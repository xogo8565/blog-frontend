"use client";

import { useState } from "react";
import { toUserMessage } from "@/shared/api/errors";
import {
  useAdminCategories,
  useDeleteCategory,
  useReorderCategories,
  useSaveCategory,
  type AdminCategory,
  type CategoryUpsertRequest,
} from "../../api/adminCategories";
import { CategoryForm } from "./CategoryForm";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

type Editing = { mode: "new" } | { mode: "edit"; category: AdminCategory } | null;

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : null;
}

export function CategoryManager() {
  const categories = useAdminCategories();
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const reorder = useReorderCategories();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [status, setStatus] = useState("");

  if (categories.isPending) {
    return (
      <p className="admin-notice" role="status">
        카테고리를 불러오는 중입니다.
      </p>
    );
  }

  if (categories.isError) {
    return (
      <div className="admin-notice" role="alert">
        <p>{toUserMessage(categories.error)}</p>
        <button
          className="button button--secondary"
          onClick={() => categories.refetch()}
          type="button"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const list = categories.data;
  const groups = list.filter((category) => category.parentId === null);
  const childrenOf = (id: number) => list.filter((category) => category.parentId === id);
  const siblingsOf = (category: AdminCategory) =>
    list.filter((item) => item.parentId === category.parentId);
  const rows = groups.flatMap((group) => [group, ...childrenOf(group.id)]);
  const editingCategory = editing?.mode === "edit" ? editing.category : null;
  const slugError =
    save.isError && errorCode(save.error) === "CATEGORY_SLUG_DUPLICATED"
      ? toUserMessage(save.error)
      : null;

  function openForm(next: Editing) {
    save.reset();
    setEditing(next);
  }

  function submit(body: CategoryUpsertRequest) {
    save.mutate(
      { id: editingCategory?.id ?? null, body },
      {
        onSuccess: (saved) => {
          setStatus(`‘${saved.name}’ 카테고리를 ${editingCategory ? "저장" : "추가"}했습니다.`);
          setEditing(null);
        },
        onError: (error) => {
          if (errorCode(error) !== "CATEGORY_SLUG_DUPLICATED") setStatus(toUserMessage(error));
        },
      },
    );
  }

  function move(category: AdminCategory, delta: -1 | 1) {
    const ids = siblingsOf(category).map((item) => item.id);
    const from = ids.indexOf(category.id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    reorder.mutate(
      { parentId: category.parentId, categoryIds: ids },
      {
        onSuccess: () => setStatus(`‘${category.name}’ 순서를 바꿨습니다.`),
        onError: (error) => setStatus(toUserMessage(error)),
      },
    );
  }

  function confirmDelete(moveTo: number | null) {
    if (!deleting) return;
    const target = deleting;
    remove.mutate(
      { id: target.id, moveTo },
      {
        onSuccess: () => {
          setStatus(`‘${target.name}’ 카테고리를 삭제했습니다.`);
          setDeleting(null);
        },
        onError: (error) => {
          setStatus(toUserMessage(error));
          setDeleting(null);
        },
      },
    );
  }

  return (
    <div className="category-manager">
      <div className="admin-toolbar">
        <ul aria-label="카테고리 요약" className="admin-summary">
          <li>상위 {groups.length}개</li>
          <li>하위 {list.length - groups.length}개</li>
          <li>숨김 {list.filter((category) => !category.visible).length}개</li>
        </ul>
        <button
          className="button button--primary"
          onClick={() => openForm({ mode: "new" })}
          type="button"
        >
          새 카테고리
        </button>
      </div>

      <p className="admin-status" role="status">
        {status}
      </p>

      <div className="category-manager__layout">
        <div className="admin-table-wrap">
          {rows.length === 0 ? (
            <p className="admin-notice">아직 카테고리가 없습니다. 새 카테고리를 추가하세요.</p>
          ) : (
            <table className="admin-table">
              <caption className="sr-only">카테고리 목록</caption>
              <thead>
                <tr>
                  <th scope="col">이름</th>
                  <th scope="col">슬러그</th>
                  <th scope="col">글</th>
                  <th scope="col">상태</th>
                  <th scope="col">
                    <span className="sr-only">작업</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((category) => {
                  const siblings = siblingsOf(category);
                  const position = siblings.findIndex((item) => item.id === category.id);
                  const isGroup = category.parentId === null;
                  const count = isGroup
                    ? category.articleCount +
                      childrenOf(category.id).reduce((sum, child) => sum + child.articleCount, 0)
                    : category.articleCount;
                  const selected = editingCategory?.id === category.id;

                  return (
                    <tr
                      data-group={isGroup || undefined}
                      data-selected={selected || undefined}
                      key={category.id}
                    >
                      <th scope="row">
                        {!isGroup && <span aria-hidden="true">└ </span>}
                        {category.name}
                      </th>
                      <td className="admin-table__mono">{category.slug}</td>
                      <td>{count}</td>
                      <td>
                        <span
                          className={`status-badge${category.visible ? "" : " status-badge--muted"}`}
                        >
                          {category.visible ? "공개" : "숨김"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-table__actions">
                          <button
                            aria-label={`${category.name} 위로 이동`}
                            className="icon-button"
                            disabled={position === 0 || reorder.isPending}
                            onClick={() => move(category, -1)}
                            type="button"
                          >
                            <span aria-hidden="true">↑</span>
                          </button>
                          <button
                            aria-label={`${category.name} 아래로 이동`}
                            className="icon-button"
                            disabled={position === siblings.length - 1 || reorder.isPending}
                            onClick={() => move(category, 1)}
                            type="button"
                          >
                            <span aria-hidden="true">↓</span>
                          </button>
                          <button
                            aria-label={`${category.name} 수정`}
                            className="icon-button"
                            onClick={() => openForm({ mode: "edit", category })}
                            type="button"
                          >
                            수정
                          </button>
                          <button
                            aria-label={`${category.name} 삭제`}
                            className="icon-button icon-button--danger"
                            onClick={() => setDeleting(category)}
                            type="button"
                          >
                            삭제
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <section aria-labelledby="category-panel-title" className="admin-panel">
          <h2 id="category-panel-title">
            {editing === null
              ? "카테고리 편집"
              : editingCategory
                ? `‘${editingCategory.name}’ 수정`
                : "새 카테고리"}
          </h2>
          {editing === null ? (
            <p className="admin-panel__empty">
              목록에서 수정할 카테고리를 고르거나 새 카테고리를 추가하세요.
            </p>
          ) : (
            <CategoryForm
              category={editingCategory}
              hasChildren={editingCategory ? childrenOf(editingCategory.id).length > 0 : false}
              key={editingCategory?.id ?? "new"}
              onCancel={() => setEditing(null)}
              onSubmit={submit}
              parentOptions={groups.filter((group) => group.id !== editingCategory?.id)}
              pending={save.isPending}
              serverSlugError={slugError}
            />
          )}
        </section>
      </div>

      {deleting && (
        <DeleteCategoryDialog
          category={deleting}
          childCount={childrenOf(deleting.id).length}
          moveTargets={list.filter(
            (category) => category.id !== deleting.id && childrenOf(category.id).length === 0,
          )}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
          pending={remove.isPending}
        />
      )}
    </div>
  );
}
