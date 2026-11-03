const KST_DATE = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** API가 주는 UTC 일시(ISO 8601)를 한국 날짜로 보여준다. 예: 2026년 11월 2일 */
export function formatKstDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`올바른 ISO 8601 일시가 아닙니다: ${isoDateTime}`);
  }
  return KST_DATE.format(date);
}
