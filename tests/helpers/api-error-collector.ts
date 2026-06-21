import type { Page, Request, Response, TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";

type ApiErrorEntry = {
  type: "http_error" | "request_failed";
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  failureText?: string | null;
  responseBody?: string;
  timestamp: string;
};

type ApiErrorCollectorOptions = {
  endpointPattern?: RegExp;
  maxBodyLength?: number;
};

type ApiErrorCollector = {
  attach: (
    testInfo: TestInfo,
    options?: { attachmentName?: string; fileName?: string }
  ) => Promise<void>;
  dispose: () => void;
};

function shouldTrack(url: string, endpointPattern: RegExp) {
  return endpointPattern.test(url);
}

function truncateBody(body: string, maxBodyLength: number) {
  if (body.length <= maxBodyLength) return body;
  return `${body.slice(0, maxBodyLength)} ...[truncated]`;
}

export function createApiErrorCollector(
  page: Page,
  options: ApiErrorCollectorOptions = {}
): ApiErrorCollector {
  const endpointPattern = options.endpointPattern ?? /\/api\//;
  const maxBodyLength = options.maxBodyLength ?? 3000;
  const entries: ApiErrorEntry[] = [];
  const pending: Promise<void>[] = [];

  const onResponse = (response: Response) => {
    const task = (async () => {
      const url = response.url();
      if (!shouldTrack(url, endpointPattern)) return;
      if (response.status() < 400) return;

      const entry: ApiErrorEntry = {
        type: "http_error",
        method: response.request().method(),
        url,
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };

      try {
        const body = await response.text();
        entry.responseBody = truncateBody(body, maxBodyLength);
      } catch {
        entry.responseBody = "[response body unavailable]";
      }

      entries.push(entry);
    })();

    pending.push(task);
  };

  const onRequestFailed = (request: Request) => {
    const task = (async () => {
      const url = request.url();
      if (!shouldTrack(url, endpointPattern)) return;

      entries.push({
        type: "request_failed",
        method: request.method(),
        url,
        failureText: request.failure()?.errorText ?? null,
        timestamp: new Date().toISOString()
      });
    })();

    pending.push(task);
  };

  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  return {
    async attach(testInfo, options = {}) {
      const attachmentName = options.attachmentName ?? "api-errors";
      const fileName = options.fileName ?? "api-errors.json";
      await Promise.all(pending);
      const payload = {
        endpointPattern: endpointPattern.source,
        total: entries.length,
        entries
      };

      const filePath = testInfo.outputPath(fileName);
      await writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
      await testInfo.attach(attachmentName, {
        path: filePath,
        contentType: "application/json"
      });
    },
    dispose() {
      page.off("response", onResponse);
      page.off("requestfailed", onRequestFailed);
    }
  };
}
