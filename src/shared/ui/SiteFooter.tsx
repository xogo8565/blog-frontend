import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <Link aria-label="개발 노트 홈" className="site-footer__brand" href="/">
            개발 노트 <span aria-hidden="true">↗</span>
          </Link>
          <p>설계와 구현 사이에서 배운 것을 기록합니다.</p>
        </div>
        <Link className="site-footer__top" href="#main-content">
          맨 위로 <span aria-hidden="true">↑</span>
        </Link>
      </div>
    </footer>
  );
}
