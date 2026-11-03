import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link aria-label="개발 노트 홈" className="site-brand" href="/">
          <span aria-hidden="true" className="site-brand__mark">
            {"</>"}
          </span>
          <span>개발 노트</span>
        </Link>
        <nav aria-label="주요 메뉴" className="site-nav">
          <Link className="site-nav__link" href="/">
            글 모음
          </Link>
          <Link className="site-nav__link" href="/#topics">
            주제
          </Link>
          <Link className="site-nav__search" href="/search">
            검색 <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
