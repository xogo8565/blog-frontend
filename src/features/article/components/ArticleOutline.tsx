import type { MarkdownHeading } from "@/shared/lib/markdown/MarkdownRenderer";

export function ArticleOutline({
  headings,
  className = "",
}: {
  headings: MarkdownHeading[];
  className?: string;
}) {
  if (headings.length < 2) return null;

  return (
    <nav aria-label="이 글의 목차" className={`article-outline ${className}`.trim()}>
      <p className="article-outline__title">이 글의 순서</p>
      <ol>
        {headings.map((heading) => (
          <li data-level={heading.level} key={heading.id}>
            <a href={`#${heading.id}`}>{heading.value}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
