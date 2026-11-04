"use server";

import { updateTag } from "next/cache";
import { api } from "@/shared/api/client";

/**
 * 관리자가 카테고리를 바꾼 뒤 공개 화면 캐시를 바로 비운다.
 * 넘겨받은 access 토큰으로 /me를 호출해 ADMIN일 때만 실행한다. 토큰은 저장하지 않는다.
 */
export async function revalidateCategoryPages(accessToken: string | null): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const { data } = await api.GET("/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (data?.role !== "ADMIN") return false;
  } catch {
    return false;
  }

  updateTag("categories");
  updateTag("articles");
  return true;
}
