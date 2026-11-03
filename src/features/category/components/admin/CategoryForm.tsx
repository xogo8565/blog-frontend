"use client";

import { useId, useState, type FormEvent } from "react";
import type { AdminCategory, CategoryUpsertRequest } from "../../api/adminCategories";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type FieldErrors = Partial<Record<"name" | "slug" | "description", string>>;

/** 영문 이름이면 슬러그를 제안한다. 한글 이름은 직접 입력해야 한다. */
function suggestSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validate(body: CategoryUpsertRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (body.name.length < 1 || body.name.length > 30) errors.name = "이름은 1~30자로 입력해 주세요.";
  if (!SLUG_PATTERN.test(body.slug) || body.slug.length > 40) {
    errors.slug = "영문 소문자, 숫자, 하이픈(-)으로 40자 이내로 입력해 주세요.";
  }
  if ((body.description ?? "").length > 200)
    errors.description = "설명은 200자 이내로 입력해 주세요.";
  return errors;
}

type Props = {
  category: AdminCategory | null;
  parentOptions: AdminCategory[];
  /** 하위 카테고리가 있으면 다른 카테고리 아래로 옮길 수 없다(2단계 제한). */
  hasChildren: boolean;
  pending: boolean;
  serverSlugError: string | null;
  onSubmit: (body: CategoryUpsertRequest) => void;
  onCancel: () => void;
};

export function CategoryForm({
  category,
  parentOptions,
  hasChildren,
  pending,
  serverSlugError,
  onSubmit,
  onCancel,
}: Props) {
  const id = useId();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(category !== null);
  const [description, setDescription] = useState(category?.description ?? "");
  const [parentId, setParentId] = useState(category?.parentId ? String(category.parentId) : "");
  const [visible, setVisible] = useState(category?.visible ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});

  const slugError = errors.slug ?? serverSlugError ?? undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body: CategoryUpsertRequest = {
      name: name.trim(),
      slug,
      description: description.trim() || null,
      parentId: parentId ? Number(parentId) : null,
      visible,
    };
    const nextErrors = validate(body);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(body);
  }

  return (
    <form className="category-form" noValidate onSubmit={submit}>
      <div className="form-field">
        <label htmlFor={`${id}-name`}>이름</label>
        <input
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          aria-invalid={errors.name ? true : undefined}
          id={`${id}-name`}
          maxLength={30}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugTouched) setSlug(suggestSlug(event.target.value));
          }}
          value={name}
        />
        {errors.name && (
          <p className="form-field__error" id={`${id}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-slug`}>슬러그</label>
        <input
          aria-describedby={`${id}-slug-hint${slugError ? ` ${id}-slug-error` : ""}`}
          aria-invalid={slugError ? true : undefined}
          autoCapitalize="off"
          className="form-field__mono"
          id={`${id}-slug`}
          maxLength={40}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value.toLowerCase());
          }}
          spellCheck={false}
          value={slug}
        />
        <p className="form-field__hint" id={`${id}-slug-hint`}>
          주소: /categories/{slug || "슬러그"}
        </p>
        {slugError && (
          <p className="form-field__error" id={`${id}-slug-error`}>
            {slugError}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-parent`}>상위 카테고리</label>
        <select
          aria-describedby={hasChildren ? `${id}-parent-hint` : undefined}
          disabled={hasChildren}
          id={`${id}-parent`}
          onChange={(event) => setParentId(event.target.value)}
          value={parentId}
        >
          <option value="">없음 (상위 카테고리로 만들기)</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {hasChildren && (
          <p className="form-field__hint" id={`${id}-parent-hint`}>
            하위 카테고리가 있어 다른 카테고리 아래로 옮길 수 없습니다.
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor={`${id}-description`}>설명</label>
        <textarea
          aria-describedby={errors.description ? `${id}-description-error` : undefined}
          aria-invalid={errors.description ? true : undefined}
          id={`${id}-description`}
          maxLength={200}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          value={description}
        />
        {errors.description && (
          <p className="form-field__error" id={`${id}-description-error`}>
            {errors.description}
          </p>
        )}
      </div>

      <label className="form-check">
        <input
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
          type="checkbox"
        />
        공개 화면 메뉴에 표시
      </label>

      <div className="category-form__actions">
        <button className="button button--primary" disabled={pending} type="submit">
          {category ? "저장" : "추가"}
        </button>
        <button className="button button--secondary" onClick={onCancel} type="button">
          취소
        </button>
      </div>
    </form>
  );
}
