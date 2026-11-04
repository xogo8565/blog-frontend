type Props = {
  defaultValue?: string;
  compact?: boolean;
};

export function ArticleSearchForm({ defaultValue = "", compact = false }: Props) {
  return (
    <form action="/search" className={`search-form${compact ? " search-form--compact" : ""}`}>
      <label className="sr-only" htmlFor={compact ? "header-article-search" : "article-search"}>
        글 검색
      </label>
      <input
        autoComplete="off"
        defaultValue={defaultValue}
        id={compact ? "header-article-search" : "article-search"}
        maxLength={50}
        minLength={2}
        name="q"
        placeholder={compact ? "검색어 입력" : "궁금한 주제를 검색해 보세요"}
        required
        type="search"
      />
      <button className="button button--primary" type="submit">
        검색
      </button>
    </form>
  );
}
