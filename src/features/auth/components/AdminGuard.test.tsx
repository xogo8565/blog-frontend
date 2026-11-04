import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { components } from "@/shared/api/schema";
import { apiUrl, server } from "@/shared/api/test/server";
import { AdminGuard } from "./AdminGuard";

type Me = components["schemas"]["Me"];

function renderGuard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminGuard>
        <p>관리 화면</p>
      </AdminGuard>
    </QueryClientProvider>,
  );
}

function me(role: Me["role"]): Me {
  return { id: 1, email: "admin@example.com", nickname: "관리자", pictureUrl: null, role };
}

describe("AdminGuard", () => {
  it("로그인하지 않았으면 로그인 안내를 보여준다", async () => {
    server.use(
      http.get(apiUrl("/me"), () => new HttpResponse(null, { status: 401 })),
      http.post(apiUrl("/auth/refresh"), () => new HttpResponse(null, { status: 401 })),
    );
    renderGuard();

    expect(await screen.findByText("로그인이 필요합니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Google로 로그인" })).toHaveAttribute(
      "href",
      "http://localhost:8080/oauth2/authorization/google",
    );
    expect(screen.queryByText("관리 화면")).not.toBeInTheDocument();
  });

  it("관리자가 아니면 화면을 열지 않는다", async () => {
    server.use(http.get(apiUrl("/me"), () => HttpResponse.json(me("USER"))));
    renderGuard();

    expect(await screen.findByText("이 화면은 관리자만 쓸 수 있습니다.")).toBeInTheDocument();
  });

  it("관리자면 내용을 보여준다", async () => {
    server.use(http.get(apiUrl("/me"), () => HttpResponse.json(me("ADMIN"))));
    renderGuard();

    expect(await screen.findByText("관리 화면")).toBeInTheDocument();
  });
});
