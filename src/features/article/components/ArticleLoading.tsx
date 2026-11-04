export function ArticleLoading() {
  return (
    <div aria-label="글을 불러오는 중" className="article-list" role="status">
      <span className="sr-only">글을 불러오는 중입니다.</span>
      {Array.from({ length: 4 }, (_, index) => (
        <div aria-hidden="true" className="article-skeleton" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
