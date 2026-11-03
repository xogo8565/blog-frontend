import type { ElementType, ReactNode } from "react";

type MarkdownBlock =
  | { type: "heading"; id: string; level: number; value: string }
  | { type: "paragraph"; value: string }
  | { type: "quote"; value: string }
  | { type: "list"; ordered: boolean; values: string[] }
  | { type: "code"; language: string; value: string }
  | { type: "rule" };

export type MarkdownHeading = {
  id: string;
  level: number;
  value: string;
};

const INLINE_TOKEN = /(!?\[[^\]]*\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function safeHref(candidate: string): string | null {
  try {
    const parsed = new URL(candidate, "https://blog.invalid");
    return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? candidate : null;
  } catch {
    return null;
  }
}

function renderInline(value: string): ReactNode[] {
  return value
    .split(INLINE_TOKEN)
    .filter(Boolean)
    .map((part, index) => {
      const image = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) {
        return (
          <span className="markdown-image-note" key={index}>
            이미지: {image[1] || "설명 없음"}
          </span>
        );
      }

      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = safeHref(link[2]);
        return href ? (
          <a href={href} key={index} rel={href.startsWith("http") ? "nofollow" : undefined}>
            {link[1]}
          </a>
        ) : (
          <span key={index}>{link[1]}</span>
        );
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return <span key={index}>{part}</span>;
    });
}

function isBlockStart(line: string): boolean {
  return (
    /^\s*```/.test(line) ||
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*([-+*]|\d+\.)\s+/.test(line) ||
    /^(?:---+|\*\*\*+|___+)\s*$/.test(line)
  );
}

function headingSlug(value: string): string {
  const plainText = value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*|__|\*|_/g, "")
    .trim()
    .toLocaleLowerCase();
  const slug = plainText
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  const headingCounts = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^\s*```([\w+-]*)\s*$/);
    if (fence) {
      const language = fence[1];
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", language, value: code.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const baseId = headingSlug(heading[2]);
      const occurrence = (headingCounts.get(baseId) ?? 0) + 1;
      headingCounts.set(baseId, occurrence);
      blocks.push({
        type: "heading",
        id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
        level: heading[1].length,
        value: heading[2],
      });
      index += 1;
      continue;
    }

    if (/^(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", value: quote.join(" ") });
      continue;
    }

    const listItem = line.match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
    if (listItem) {
      const ordered = /^\d/.test(listItem[1]);
      const values: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
        if (!item || /^\d/.test(item[1]) !== ordered) break;
        values.push(item[2]);
        index += 1;
      }
      blocks.push({ type: "list", ordered, values });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", value: paragraph.join(" ") });
  }

  return blocks;
}

export function getMarkdownHeadings(markdown: string): MarkdownHeading[] {
  return parseMarkdown(markdown)
    .filter(
      (block): block is Extract<MarkdownBlock, { type: "heading" }> => block.type === "heading",
    )
    .map(({ id, level, value }) => ({ id, level, value }));
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      {parseMarkdown(content).map((block, index) => {
        switch (block.type) {
          case "heading": {
            const level = Math.min(block.level + 1, 6);
            const Heading = `h${level}` as ElementType;
            return (
              <Heading className="markdown-heading" id={block.id} key={index}>
                {renderInline(block.value)}
              </Heading>
            );
          }
          case "paragraph":
            return <p key={index}>{renderInline(block.value)}</p>;
          case "quote":
            return <blockquote key={index}>{renderInline(block.value)}</blockquote>;
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={index}>
                {block.values.map((value, itemIndex) => (
                  <li key={itemIndex}>{renderInline(value)}</li>
                ))}
              </List>
            );
          }
          case "code":
            return (
              <pre data-language={block.language || undefined} key={index}>
                <code className={block.language ? `language-${block.language}` : undefined}>
                  {block.value}
                </code>
              </pre>
            );
          case "rule":
            return <hr key={index} />;
        }
      })}
    </div>
  );
}
