"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ComponentProps } from "react";
import { DEMO_MEMBER } from "../../lib/demo-member";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      if (response.ok) {
        router.push("/member/home");
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { message?: unknown };
      setErrorMessage(
        typeof body.message === "string"
          ? body.message
          : "ログイン処理中にエラーが発生しました。"
      );
    } catch {
      setErrorMessage("ログイン処理中にエラーが発生しました。");
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>ログイン</h1>
      <p>Playwright の認証フロー練習用画面です。実運用の認証には使用しないでください。</p>
      <p>
        テスト用アカウント: <code>{DEMO_MEMBER.email}</code> / <code>{DEMO_MEMBER.password}</code>
      </p>

      <form onSubmit={handleSubmit} aria-label="login form">
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">メールアドレス</label>
          <br />
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">パスワード</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit">ログイン</button>
      </form>

      {errorMessage ? <p role="alert" aria-label="ログインエラー">{errorMessage}</p> : null}

      <p style={{ marginTop: 20 }}>
        <Link href="/">お問い合わせフォームに戻る</Link>
      </p>
    </main>
  );
}
