import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidDemoSession, SESSION_COOKIE_NAME } from "../../../lib/demo-session";

export default async function MemberHomePage() {
  const cookieStore = await cookies();

  if (!isValidDemoSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>会員ホーム</h1>
      <p>ログイン後の画面として、認証済みユーザー向け導線を練習できます。</p>

      <section aria-labelledby="member-menu-heading">
        <h2 id="member-menu-heading">会員メニュー</h2>
        <ul>
          <li>プロフィールを確認する</li>
          <li>利用履歴を確認する</li>
        </ul>
      </section>

      <Link href="/login">ログイン画面に戻る</Link>
    </main>
  );
}
