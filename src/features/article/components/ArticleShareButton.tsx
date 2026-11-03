"use client";

import { useState } from "react";

export function ArticleShareButton() {
  const [status, setStatus] = useState("");

  async function shareArticle() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        setStatus("공유 창을 열었습니다.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setStatus("글 주소를 복사했습니다.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("이 브라우저에서는 공유할 수 없습니다.");
    }
  }

  return (
    <span className="article-share">
      <button className="article-share__button" onClick={shareArticle} type="button">
        글 공유 <span aria-hidden="true">↗</span>
      </button>
      <span aria-live="polite" className="article-share__status" role="status">
        {status}
      </span>
    </span>
  );
}
