import { expect, test } from "@playwright/test";

type ErrorCategory = "retry_later" | "maintenance" | "unknown";

function classifyErrorMessage(message: string): ErrorCategory {
  if (/時間をおいて|再度お試し/.test(message)) {
    return "retry_later";
  }

  if (/メンテナンス|保守/.test(message)) {
    return "maintenance";
  }

  return "unknown";
}

test.describe("エラー画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/error");
  });

  test("エラーメッセージが表示される", async ({ page }) => {
    await expect(page).toHaveURL("/error");
    await expect(page.getByRole("heading", { name: "エラーが発生しました" })).toBeVisible();
    await expect(page.getByText("しばらく時間をおいてから再度お試しください。")).toBeVisible();
  });

  test("フォームページに戻れる", async ({ page }) => {
    await page.getByRole("link", { name: "フォームページに戻る" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "お問い合わせフォーム" })).toBeVisible();
  });

  test("エラー文言に応じて処理を分岐しスクリーンショットを保存できる", async ({ page }, testInfo) => {
    const errorMessage = (await page.locator("main p").first().innerText()).trim();
    const errorCategory = classifyErrorMessage(errorMessage);

    const screenshotPath = testInfo.outputPath(`error-content-${errorCategory}.png`);
    await page.locator("main").screenshot({ path: screenshotPath });
    await testInfo.attach("error-content", {
      path: screenshotPath,
      contentType: "image/png"
    });

    switch (errorCategory) {
      case "retry_later":
        await expect(page.getByRole("link", { name: "フォームページに戻る" })).toBeVisible();
        break;
      case "maintenance":
        await expect(page.getByRole("heading", { name: "エラーが発生しました" })).toBeVisible();
        break;
      default:
        throw new Error(
          `未対応のエラー文言です。分類を追加してください: "${errorMessage}"`
        );
    }
  });
});
