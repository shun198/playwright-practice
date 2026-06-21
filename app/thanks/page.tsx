import Link from "next/link";

export default function ThanksPage() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>サンクスページ</h1>
      <p>ページ遷移の確認用に用意したページです。</p>
      <Link href="/">フォームページに戻る</Link>
    </main>
  );
}
