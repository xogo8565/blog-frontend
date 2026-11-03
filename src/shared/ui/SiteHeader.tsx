import Link from "next/link";
import type { components } from "@/shared/api/schema";
import { categoryTone } from "@/shared/lib/category-tone";
import { NavMenu } from "./NavMenu";

type CategoryNode = components["schemas"]["CategoryNode"];

function CategoryMenuPanel({ categories }: { categories: CategoryNode[] }) {
  return (
    <ul className="category-menu">
      {categories.map((group) => (
        <li data-tone={categoryTone(group.slug)} key={group.id}>
          <Link className="category-menu__group" href={`/categories/${group.slug}`}>
            <span aria-hidden="true" className="tone-swatch" />
            {group.name}
            <span className="category-menu__count">
              {group.articleCount}
              <span className="sr-only">개의 글</span>
            </span>
          </Link>
          {group.children.length > 0 && (
            <ul>
              {group.children.map((child) => (
                <li key={child.id}>
                  <Link className="category-menu__child" href={`/categories/${child.slug}`}>
                    {child.name}
                    <span className="category-menu__count">
                      {child.articleCount}
                      <span className="sr-only">개의 글</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function SiteHeader({ categories }: { categories: CategoryNode[] }) {
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
          {categories.length > 0 ? (
            <NavMenu label="카테고리">
              <CategoryMenuPanel categories={categories} />
            </NavMenu>
          ) : (
            <Link className="site-nav__link" href="/#tags">
              태그
            </Link>
          )}
          <Link className="site-nav__search" href="/search">
            <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            검색
          </Link>
        </nav>
      </div>
    </header>
  );
}
