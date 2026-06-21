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
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("Playwright の練習中です。");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByRole("status")).toContainText(
      "田中太郎さん、お問い合わせありがとうございます。"
    );
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

  test("連続送信すると最新の名前でメッセージが更新される", async ({ page }) => {
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("1回目");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();
    await expect(page.getByRole("status")).toContainText(
      "田中太郎さん、お問い合わせありがとうございます。"
    );

    await page.getByLabel("名前").fill("佐藤花子");
    await page.getByLabel("メッセージ").fill("2回目");
    await page.getByRole("button", { name: "送信" }).click();
    await expect(page.getByRole("status")).toContainText(
      "佐藤花子さん、お問い合わせありがとうございます。"
    );
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
