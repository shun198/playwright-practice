import { expect, test } from "@playwright/test";

test.describe("お問い合わせフォーム", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("サンクスページへ遷移できる", async ({ page }) => {
    await page.getByRole("link", { name: "サンクスページへ" }).click();

    await expect(page).toHaveURL("/thanks");
    await expect(page.getByRole("heading", { name: "サンクスページ" })).toBeVisible();
  });

  test("初期表示では完了メッセージが出ていない", async ({ page }) => {
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("フォーム送信後に完了メッセージが表示される", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/contact") && response.request().method() === "POST"
    );
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("Playwright の練習中です。");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON()).toEqual({
      name: "田中太郎",
      email: "taro@example.com",
      message: "Playwright の練習中です。",
      contactType: "general",
      agree: true
    });
    await expect(page.getByRole("status")).toHaveText("お問い合わせを受け付けました。");
  });

  test("API が 500 を返すとエラーメッセージを表示する", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          code: "INTERNAL_SERVER_ERROR",
          message: "サーバー内部でエラーが発生しました。"
        })
      });
    });
    const responsePromise = page.waitForResponse("**/api/contact");
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("サーバーエラーのテスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    expect((await responsePromise).status()).toBe(500);
    await expect(page.getByRole("alert", { name: "送信エラー" })).toHaveText(
      "サーバー内部でエラーが発生しました。"
    );
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("API が 400 を返すとバリデーションエラーを表示する", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          code: "VALIDATION_ERROR",
          message: "サーバー側のバリデーションに失敗しました。"
        })
      });
    });
    const responsePromise = page.waitForResponse("**/api/contact");
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("サーバー検証エラーのテスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    expect((await responsePromise).status()).toBe(400);
    await expect(page.getByRole("alert", { name: "送信エラー" })).toHaveText(
      "サーバー側のバリデーションに失敗しました。"
    );
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("送信中は二重送信できない", async ({ page }) => {
    let requestCount = 0;
    let releaseResponse: () => void;
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });

    await page.route("**/api/contact", async (route) => {
      requestCount += 1;
      await responseGate;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ code: "OK", message: "お問い合わせを受け付けました。" })
      });
    });
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("送信中状態のテスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByRole("button", { name: "送信中..." })).toBeDisabled();
    await expect(page.getByRole("form", { name: "contact form" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    await expect.poll(() => requestCount).toBe(1);

    releaseResponse!();

    await expect(page.getByRole("status")).toHaveText("お問い合わせを受け付けました。");
  });

  test("必須項目が空だと送信されない", async ({ page }) => {
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("名前未入力の送信テスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    const nameIsValid = await page
      .getByLabel("名前")
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(nameIsValid).toBe(false);
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("メール形式が不正だと送信されない", async ({ page }) => {
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("invalid-mail");
    await page.getByLabel("メッセージ").fill("メール形式エラーのテスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    const emailIsValid = await page
      .getByLabel("メールアドレス")
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(emailIsValid).toBe(false);
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("連続送信すると API に 2 回リクエストする", async ({ page }) => {
    let requestCount = 0;
    page.on("request", (request) => {
      if (request.url().includes("/api/contact") && request.method() === "POST") {
        requestCount += 1;
      }
    });
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("1回目");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();
    await expect.poll(() => requestCount).toBe(1);
    await expect(page.getByRole("status")).toHaveText("お問い合わせを受け付けました。");

    await page.getByLabel("名前").fill("佐藤花子");
    await page.getByLabel("メッセージ").fill("2回目");
    await page.getByRole("button", { name: "送信" }).click();
    await expect.poll(() => requestCount).toBe(2);
    await expect(page.getByRole("status")).toHaveText("お問い合わせを受け付けました。");
  });

  test("利用規約の同意チェックが未選択だと送信されない", async ({ page }) => {
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("チェックボックス必須のテスト");
    await page.getByLabel("一般").check();
    await page.getByRole("button", { name: "送信" }).click();

    const agreeIsValid = await page
      .getByLabel("利用規約に同意する")
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(agreeIsValid).toBe(false);
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("お問い合わせ種別が未選択だと送信されない", async ({ page }) => {
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("ラジオボタン必須のテスト");
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    const contactTypeIsValid = await page
      .getByLabel("一般")
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(contactTypeIsValid).toBe(false);
    await expect(page.getByRole("status")).toHaveCount(0);
  });
});
