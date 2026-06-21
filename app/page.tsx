"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentProps } from "react";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

export default function Page() {
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = (event: FormSubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    setSubmittedName(typeof name === "string" ? name : "");
  };

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>お問い合わせフォーム</h1>
      <p>Playwright の練習用に作成したシンプルなフォームです。</p>
      <p>
        ページ遷移テスト用に{" "}
        <Link href="/thanks">サンクスページへ</Link>
      </p>

      <form onSubmit={handleSubmit} aria-label="contact form">
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="name">名前</label>
          <br />
          <input id="name" name="name" type="text" required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">メールアドレス</label>
          <br />
          <input id="email" name="email" type="email" required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="message">メッセージ</label>
          <br />
          <textarea id="message" name="message" rows={4} required />
        </div>

        <fieldset style={{ marginBottom: 12 }}>
          <legend>お問い合わせ種別</legend>
          <label htmlFor="contact-general">
            <input
              id="contact-general"
              name="contactType"
              type="radio"
              value="general"
              required
            />{" "}
            一般
          </label>
          <br />
          <label htmlFor="contact-support">
            <input id="contact-support" name="contactType" type="radio" value="support" />{" "}
            サポート
          </label>
        </fieldset>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="agree">
            <input id="agree" name="agree" type="checkbox" required /> 利用規約に同意する
          </label>
        </div>

        <button type="submit">送信</button>
      </form>

      {submittedName ? (
        <p role="status" style={{ marginTop: 20 }}>
          {submittedName}さん、お問い合わせありがとうございます。
        </p>
      ) : null}
    </main>
  );
}
