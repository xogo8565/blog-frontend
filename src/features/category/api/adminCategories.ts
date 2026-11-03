"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import type { components } from "@/shared/api/schema";
import { revalidateCategoryPages } from "../actions/revalidate";

export type AdminCategory = components["schemas"]["AdminCategory"];
export type CategoryUpsertRequest = components["schemas"]["CategoryUpsertRequest"];
export type CategoryOrderRequest = components["schemas"]["CategoryOrderRequest"];

export const adminCategoriesKey = ["admin", "categories"] as const;

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

/** 실패 응답(Problem)을 그대로 던진다. 화면은 toUserMessage()로 문구를 만든다. */
async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (!response.ok) throw error ?? new Error(`HTTP ${response.status}`);
  return data as T;
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoriesKey,
    queryFn: () => unwrap(api.GET("/admin/categories")),
  });
}

/** 변경이 끝나면 목록을 다시 받고, 공개 화면 캐시를 비운다. */
function useAfterChange() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: adminCategoriesKey });
    await revalidateCategoryPages(getAccessToken());
  };
}

export function useSaveCategory() {
  const afterChange = useAfterChange();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: CategoryUpsertRequest }) =>
      id === null
        ? unwrap(api.POST("/admin/categories", { body }))
        : unwrap(
            api.PUT("/admin/categories/{categoryId}", {
              params: { path: { categoryId: id } },
              body,
            }),
          ),
    onSuccess: afterChange,
  });
}

export function useDeleteCategory() {
  const afterChange = useAfterChange();
  return useMutation({
    mutationFn: ({ id, moveTo }: { id: number; moveTo: number | null }) =>
      unwrap(
        api.DELETE("/admin/categories/{categoryId}", {
          params: { path: { categoryId: id }, query: { moveTo: moveTo ?? undefined } },
        }),
      ),
    onSuccess: afterChange,
  });
}

export function useReorderCategories() {
  const afterChange = useAfterChange();
  return useMutation({
    mutationFn: (body: CategoryOrderRequest) =>
      unwrap(api.PUT("/admin/categories/order", { body })),
    onSuccess: afterChange,
  });
}
