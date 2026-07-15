import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "playwright_practice_member";

export const SESSION_MAX_AGE_SECONDS = 60 * 60;
const globalForDemoSession = globalThis as typeof globalThis & {
  demoSessionSecret?: string;
};
const sessionSecret =
  globalForDemoSession.demoSessionSecret ?? randomBytes(32).toString("hex");

globalForDemoSession.demoSessionSecret = sessionSecret;

function createSignature(timestamp: string) {
  return createHmac("sha256", sessionSecret).update(timestamp).digest("base64url");
}

export function createDemoSession() {
  const timestamp = Date.now().toString();
  return `${timestamp}.${createSignature(timestamp)}`;
}

export function isValidDemoSession(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [timestamp, signature] = value.split(".");
  const issuedAt = Number(timestamp);

  if (!timestamp || !signature || !Number.isSafeInteger(issuedAt)) {
    return false;
  }

  const isExpired = Date.now() - issuedAt > SESSION_MAX_AGE_SECONDS * 1000;
  const expectedSignature = createSignature(timestamp);
  const signaturesHaveEqualLength = signature.length === expectedSignature.length;

  return (
    !isExpired &&
    signaturesHaveEqualLength &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  );
}
