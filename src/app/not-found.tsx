import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notice">
      <h1>Lạc mất rồi</h1>
      <p>Trang này không có ở đây. Món quà đang chờ ở trang chính nha.</p>
      <Link className="replay" href="/">
        Về món quà
      </Link>
    </main>
  );
}
