import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell not-found" id="main-content">
      <p className="eyebrow">404 · NOT FOUND</p>
      <h1>글을 찾을 수 없습니다</h1>
      <p>주소가 바뀌었거나 공개되지 않은 글일 수 있습니다.</p>
      <Link className="button button--secondary" href="/">
        최신 글로 돌아가기
      </Link>
    </main>
  );
}
