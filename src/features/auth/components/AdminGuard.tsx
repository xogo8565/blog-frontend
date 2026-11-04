"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiBaseUrl } from "@/shared/api/auth-token";
import { api } from "@/shared/api/client";
import { toUserMessage } from "@/shared/api/errors";

/**
 * 관리자 화면 편의용 가드. 권한 판단은 API가 하므로 이 가드를 통과해도 API가 403을 줄 수 있다.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error, response } = await api.GET("/me");
      if (!response.ok) throw Object.assign(error ?? {}, { status: response.status });
      return data!;
    },
    retry: false,
  });

  if (me.isPending) {
    return (
      <p className="admin-notice" role="status">
        관리자 권한을 확인하는 중입니다.
      </p>
    );
  }

  if (me.isError) {
    const status = (me.error as { status?: number }).status;
    if (status === 401) {
      return (
        <div className="admin-notice" role="alert">
          <p>로그인이 필요합니다.</p>
          <a
            className="button button--primary"
            href={`${apiBaseUrl()}/oauth2/authorization/google`}
          >
            Google로 로그인
          </a>
        </div>
      );
    }
    return (
      <div className="admin-notice" role="alert">
        <p>{toUserMessage(me.error)}</p>
      </div>
    );
  }

  if (me.data.role !== "ADMIN") {
    return (
      <div className="admin-notice" role="alert">
        <p>이 화면은 관리자만 쓸 수 있습니다.</p>
      </div>
    );
  }

  return children;
}
