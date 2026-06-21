import type { Page, TestInfo } from "@playwright/test";

type AnnotatedScreenshotOptions = {
  targetSelectors: string[];
  comment: string;
  attachmentName: string;
  fileName: string;
  fullPage?: boolean;
};

export async function annotateAndAttachScreenshot(
  page: Page,
  testInfo: TestInfo,
  options: AnnotatedScreenshotOptions
) {
  await page.evaluate(
    ({ targetSelectors, comment }) => {
      const previousNote = document.getElementById("validation-note");
      if (previousNote) previousNote.remove();

      for (const selector of targetSelectors) {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) continue;
        element.style.outline = "4px solid #e11d48";
        element.style.outlineOffset = "2px";
      }

      const note = document.createElement("div");
      note.id = "validation-note";
      note.textContent = comment;
      Object.assign(note.style, {
        position: "fixed",
        top: "12px",
        left: "12px",
        background: "rgba(225, 29, 72, 0.95)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "14px",
        zIndex: "99999"
      });
      document.body.appendChild(note);
    },
    { targetSelectors: options.targetSelectors, comment: options.comment }
  );

  const path = testInfo.outputPath(options.fileName);
  await page.screenshot({ path, fullPage: options.fullPage ?? true });
  await testInfo.attach(options.attachmentName, {
    path,
    contentType: "image/png"
  });
}
