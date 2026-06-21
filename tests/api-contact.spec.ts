import { expect, test } from "@playwright/test";

test.describe("/api/contact", () => {
  test("必須項目不足で 400 を返す", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        email: "taro@example.com",
        message: "名前が未入力"
      }
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "VALIDATION_ERROR",
      message: "name, email, message は必須です。"
    });
  });

  test("不正メール形式で 400 を返す", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "田中太郎",
        email: "invalid-mail",
        message: "メール形式エラー"
      }
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "VALIDATION_ERROR",
      message: "email の形式が不正です。"
    });
  });

  test("サーバーエラー時に 500 を返す", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: {
        "x-force-error": "500"
      },
      data: {
        name: "田中太郎",
        email: "taro@example.com",
        message: "500 エラーを発生させる"
      }
    });

    expect(response.status()).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "サーバー内部でエラーが発生しました。"
    });
  });
});
