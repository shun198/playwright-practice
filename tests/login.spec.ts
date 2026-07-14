import { expect, test } from "@playwright/test";
import { DEMO_MEMBER } from "../lib/demo-member";
import { SESSION_COOKIE_NAME } from "../lib/demo-session";

test.describe("ログイン", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("有効な認証情報で会員ホームへ遷移できる", async ({ page }) => {
    await page.getByLabel("メールアドレス").fill(DEMO_MEMBER.email);
    await page.getByLabel("パスワード").fill(DEMO_MEMBER.password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/member/home");
    await expect(page.getByRole("heading", { name: "会員ホーム" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "会員メニュー" })).toBeVisible();
  });

  test("無効な認証情報ではエラーを表示してログイン画面に留まる", async ({ page }) => {
    await page.getByLabel("メールアドレス").fill(DEMO_MEMBER.email);
    await page.getByLabel("パスワード").fill("incorrect-password");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("alert", { name: "ログインエラー" })).toHaveText(
      "メールアドレスまたはパスワードが正しくありません。"
    );
  });

  test("ログインAPIへの通信に失敗するとエラーを表示する", async ({ page }) => {
    await page.route("**/api/login", (route) => route.abort());
    await page.getByLabel("メールアドレス").fill(DEMO_MEMBER.email);
    await page.getByLabel("パスワード").fill(DEMO_MEMBER.password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page.getByRole("alert", { name: "ログインエラー" })).toHaveText(
      "ログイン処理中にエラーが発生しました。"
    );
  });

  test("必須項目が未入力の場合はログインできない", async ({ page }) => {
    await page.getByLabel("パスワード").fill(DEMO_MEMBER.password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/login");
    const emailIsValid = await page
      .getByLabel("メールアドレス")
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(emailIsValid).toBe(false);
  });

  test("未ログインで会員ホームを開くとログイン画面へリダイレクトされる", async ({ page }) => {
    await page.goto("/member/home");

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });

  test("改ざんしたセッションCookieでは会員ホームを開けない", async ({ context, page }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;

    if (typeof baseURL !== "string") {
      throw new Error("baseURL が設定されていません。");
    }

    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: "forged-session",
        url: new URL("/", baseURL).toString()
      }
    ]);
    await page.goto("/member/home");

    await expect(page).toHaveURL("/login");
  });
});
