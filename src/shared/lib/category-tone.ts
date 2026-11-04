const TONE_COUNT = 6;

/**
 * 상위 카테고리 슬러그로 색 번호(1~6)를 정한다. API에 색 필드가 없으므로
 * 같은 카테고리가 메뉴·카드·커버 어디서나 같은 색을 갖도록 슬러그에서 계산한다.
 */
export function categoryTone(slug: string): number {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % TONE_COUNT) + 1;
}
