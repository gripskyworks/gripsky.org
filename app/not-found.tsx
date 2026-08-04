import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>There is no public page here yet.</h1>
      <p>这里还没有公开页面。</p>
      <Link href="/">Return home / 返回首页</Link>
    </main>
  );
}
