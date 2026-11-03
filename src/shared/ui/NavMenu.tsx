"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

/**
 * 헤더의 펼침 메뉴. 열고 닫기는 네이티브 <details>가 맡고, 여기서는 링크를 누르거나
 * 바깥을 누르거나 Escape를 누르면 닫히게만 한다. 헤더는 페이지 이동 후에도 남기 때문이다.
 */
export function NavMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;

    function closeOnOutside(event: PointerEvent) {
      if (details!.open && !details!.contains(event.target as Node)) details!.open = false;
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !details!.open) return;
      details!.open = false;
      details!.querySelector("summary")?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function closeOnLink(event: MouseEvent<HTMLDetailsElement>) {
    if ((event.target as Element).closest("a") && ref.current) ref.current.open = false;
  }

  return (
    <details className="nav-menu" onClick={closeOnLink} ref={ref}>
      <summary className="site-nav__link nav-menu__summary">
        {label}
        <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 24 24" width="14">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
        </svg>
      </summary>
      <div className="nav-menu__panel">{children}</div>
    </details>
  );
}
