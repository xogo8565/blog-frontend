"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AdminCategory } from "../../api/adminCategories";

type Props = {
  category: AdminCategory;
  childCount: number;
  moveTargets: AdminCategory[];
  pending: boolean;
  onConfirm: (moveTo: number | null) => void;
  onClose: () => void;
};

/** 삭제 확인 대화상자. 하위가 있으면 막고, 글이 있으면 옮길 카테고리를 먼저 고르게 한다. */
export function DeleteCategoryDialog({
  category,
  childCount,
  moveTargets,
  pending,
  onConfirm,
  onClose,
}: Props) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const [moveTo, setMoveTo] = useState(moveTargets[0] ? String(moveTargets[0].id) : "");
  const needsMove = childCount === 0 && category.articleCount > 0;
  const blocked = childCount > 0 || (needsMove && moveTargets.length === 0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }, []);

  let message: string;
  if (childCount > 0) {
    message = `하위 카테고리 ${childCount}개가 있어 삭제할 수 없습니다. 하위 카테고리를 먼저 옮기거나 삭제하세요.`;
  } else if (needsMove && moveTargets.length === 0) {
    message = `글 ${category.articleCount}개를 옮길 다른 카테고리가 없습니다. 카테고리를 먼저 만드세요.`;
  } else if (needsMove) {
    message = `글 ${category.articleCount}개가 있습니다. 글을 옮길 카테고리를 고른 뒤 삭제하세요.`;
  } else {
    message = "글이 없는 카테고리입니다. 삭제하면 되돌릴 수 없습니다.";
  }

  return (
    <dialog
      aria-describedby={`${id}-message`}
      aria-labelledby={`${id}-title`}
      className="admin-dialog"
      onClose={onClose}
      ref={ref}
    >
      <h2 id={`${id}-title`}>‘{category.name}’ 삭제</h2>
      <p id={`${id}-message`}>{message}</p>
      {needsMove && moveTargets.length > 0 && (
        <div className="form-field">
          <label htmlFor={`${id}-move`}>글을 옮길 카테고리</label>
          <select
            id={`${id}-move`}
            onChange={(event) => setMoveTo(event.target.value)}
            value={moveTo}
          >
            {moveTargets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="category-form__actions">
        {!blocked && (
          <button
            className="button button--danger"
            disabled={pending}
            onClick={() => onConfirm(needsMove ? Number(moveTo) : null)}
            type="button"
          >
            {needsMove ? "글을 옮기고 삭제" : "삭제"}
          </button>
        )}
        <button className="button button--secondary" onClick={onClose} type="button">
          {blocked ? "닫기" : "취소"}
        </button>
      </div>
    </dialog>
  );
}
