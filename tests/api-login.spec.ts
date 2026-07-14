import { expect, test } from "@playwright/test";
import { DEMO_MEMBER } from "../lib/demo-member";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "../lib/demo-session";

test.describe("/api/login", () => {
  test("有効な認証情報でセッションCookieを発行する", async ({ request }) => {
    const response = await request.post("/api/login", { data: DEMO_MEMBER });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "ログインに成功しました。" });
    expect(response.headers()["set-cookie"]).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(response.headers()["set-cookie"]).toContain("HttpOnly");
    expect(response.headers()["set-cookie"]).toContain("SameSite=lax");
    expect(response.headers()["set-cookie"]).toContain("Path=/");
    expect(response.headers()["set-cookie"]).toContain(`Max-Age=${SESSION_MAX_AGE_SECONDS}`);
  });

  test("無効な認証情報では401を返しセッションCookieを発行しない", async ({ request }) => {
    const response = await request.post("/api/login", {
      data: { email: DEMO_MEMBER.email, password: "incorrect-password" }
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "メールアドレスまたはパスワードが正しくありません。"
    });
    expect(response.headers()["set-cookie"]).toBeUndefined();
  });
});
