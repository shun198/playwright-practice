import { expect, test } from "@playwright/test";

test.describe("失敗サンプル", () => {
  test("バリデーション発生時に意図的に失敗する", async ({ page }, testInfo) => {
    await page.goto("/");

    await page.getByLabel("メールアドレス").fill("taro@example.com");
    await page.getByLabel("メッセージ").fill("名前未入力の送信テスト");
    await page.getByLabel("一般").check();
    await page.getByLabel("利用規約に同意する").check();
    await page.getByRole("button", { name: "送信" }).click();
    await page.waitForTimeout(1000);

    // バリデーション対象を強調表示して、注釈付きスクリーンショットを残す
    await page.evaluate(() => {
      const nameInput = document.querySelector<HTMLInputElement>("#name");
      if (!nameInput) return;

      nameInput.style.outline = "4px solid #e11d48";
      nameInput.style.outlineOffset = "2px";

      const existingNote = document.getElementById("validation-note");
      if (existingNote) existingNote.remove();

      const note = document.createElement("div");
      note.id = "validation-note";
      note.textContent = "名前が未入力のためバリデーションで送信されません";
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
    });

    const annotatedPath = testInfo.outputPath("annotated-validation-error.png");
    await page.screenshot({ path: annotatedPath, fullPage: true });
    await testInfo.attach("annotated-validation-error", {
      path: annotatedPath,
      contentType: "image/png"
    });

    // 実際は表示されないメッセージをあえて期待してテストを失敗させる
    await expect(page.getByRole("status")).toContainText(
      "田中太郎さん、お問い合わせありがとうございます。"
    );
  });
});
