import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>This page is not in the public system.</h1>
      <p>这个页面尚未进入公开体系。</p>
      <Link href="/">Return home / 返回首页</Link>
    </main>
  );
}
