import Link from "next/link";

export default function ErrorPage() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>エラーが発生しました</h1>
      <p>しばらく時間をおいてから再度お試しください。</p>
      <Link href="/">フォームページに戻る</Link>
    </main>
  );
}
