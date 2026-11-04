import type { MarkdownHeading } from "@/shared/lib/markdown/MarkdownRenderer";

function OutlineList({ headings }: { headings: MarkdownHeading[] }) {
  return (
    <ol>
      {headings.map((heading) => (
        <li data-level={heading.level} key={heading.id}>
          <a href={`#${heading.id}`}>{heading.value}</a>
        </li>
      ))}
    </ol>
  );
}

/**
 * 본문 Markdown 제목으로 만든 목차. `rail`은 넓은 화면의 옆 목차,
 * `inline`은 좁은 화면에서 본문 앞에 접어 두는 목차다.
 */
export function ArticleOutline({
  headings,
  variant,
}: {
  headings: MarkdownHeading[];
  variant: "rail" | "inline";
}) {
  if (headings.length < 2) return null;

  if (variant === "inline") {
    return (
      <nav aria-label="이 글의 목차" className="article-outline article-outline--mobile">
        <details>
          <summary>
            목차 <span className="article-outline__count">{headings.length}개 항목</span>
          </summary>
          <OutlineList headings={headings} />
        </details>
      </nav>
    );
  }

  return (
    <nav aria-label="이 글의 목차" className="article-outline article-outline--desktop">
      <p className="article-outline__title">목차</p>
      <OutlineList headings={headings} />
    </nav>
  );
}
