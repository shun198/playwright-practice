import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { annotateAndAttachScreenshot } from "./helpers/annotated-screenshot";

async function expectSuccessMessageToFail(page: Page) {
  // 実際は表示されないメッセージをあえて期待してテストを失敗させる
  await expect(page.getByRole("status")).toContainText(
    "田中太郎さん、お問い合わせありがとうございます。"
  );
}

test.describe("失敗サンプル", () => {
  test("名前未入力のバリデーション時に意図的に失敗する", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("名前未入力の送信テスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();
    await page.waitForTimeout(1000);

    await annotateAndAttachScreenshot(page, testInfo, {
      targetSelectors: ["#name"],
      comment: "名前が未入力のためバリデーションで送信されません",
      attachmentName: "annotated-name-validation-error",
      fileName: "annotated-name-validation-error.png"
    });

    await expectSuccessMessageToFail(page);
  });

  test("メール形式不正のバリデーション時に意図的に失敗する", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("invalid-mail");
    await page.getByLabel("メッセージ").fill("メール形式不正の送信テスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();
    await page.waitForTimeout(1000);

    await annotateAndAttachScreenshot(page, testInfo, {
      targetSelectors: ["#email"],
      comment: "メール形式が不正なためバリデーションで送信されません",
      attachmentName: "annotated-email-validation-error",
      fileName: "annotated-email-validation-error.png"
    });

    await expectSuccessMessageToFail(page);
  });

  test("利用規約未同意のバリデーション時に意図的に失敗する", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByLabel("名前").fill("田中太郎");
    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("利用規約未同意の送信テスト");
    await page.getByLabel("一般").check();
    await page.getByRole("button", { name: "送信" }).click();
    await page.waitForTimeout(1000);

    await annotateAndAttachScreenshot(page, testInfo, {
      targetSelectors: ["#agree"],
      comment: "利用規約が未同意のためバリデーションで送信されません",
      attachmentName: "annotated-agree-validation-error",
      fileName: "annotated-agree-validation-error.png"
    });

    await expectSuccessMessageToFail(page);
  });
});
