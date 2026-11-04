import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import type { components } from "@/shared/api/schema";
import { apiUrl, server } from "@/shared/api/test/server";
import { CategoryManager } from "./CategoryManager";

type AdminCategory = components["schemas"]["AdminCategory"];
type Problem = components["schemas"]["Problem"];
type UpsertBody = components["schemas"]["CategoryUpsertRequest"];
type OrderBody = components["schemas"]["CategoryOrderRequest"];

function category(
  id: number,
  name: string,
  slug: string,
  parentId: number | null,
  articleCount: number,
): AdminCategory {
  return { id, name, slug, description: null, parentId, visible: true, position: 0, articleCount };
}

function problem(status: number, code: Problem["code"]): Problem {
  return {
    type: "about:blank",
    title: code,
    status,
    detail: code,
    instance: "/api/v1/admin/categories",
    code,
    requestId: "test",
  };
}

let categories: AdminCategory[];
const requests: { method: string; url: string; body: unknown }[] = [];

beforeEach(() => {
  requests.length = 0;
  categories = [
    category(1, "백엔드", "backend", null, 0),
    category(2, "Spring", "spring", 1, 2),
    category(3, "아키텍처", "architecture", 1, 3),
    category(4, "프론트엔드", "frontend", null, 0),
    category(5, "Next.js", "nextjs", 4, 1),
  ];

  server.use(
    http.get(apiUrl("/admin/categories"), () => HttpResponse.json(categories)),
    http.post(apiUrl("/admin/categories"), async ({ request }) => {
      const body = (await request.json()) as UpsertBody;
      requests.push({ method: "POST", url: request.url, body });
      if (categories.some((item) => item.slug === body.slug)) {
        return HttpResponse.json(problem(409, "CATEGORY_SLUG_DUPLICATED"), { status: 409 });
      }
      const created = { ...category(100, body.name, body.slug, body.parentId, 0), ...body };
      categories = [...categories, created];
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(apiUrl("/admin/categories/order"), async ({ request }) => {
      const body = (await request.json()) as OrderBody;
      requests.push({ method: "PUT", url: request.url, body });
      const others = categories.filter((item) => item.parentId !== body.parentId);
      const reordered = body.categoryIds.map((id) => categories.find((item) => item.id === id)!);
      categories =
        body.parentId === null
          ? reordered.flatMap((group) => [group, ...others.filter((c) => c.parentId === group.id)])
          : [...others, ...reordered];
      return HttpResponse.json(categories);
    }),
    http.delete(apiUrl("/admin/categories/:categoryId"), ({ request, params }) => {
      requests.push({ method: "DELETE", url: request.url, body: null });
      categories = categories.filter((item) => item.id !== Number(params.categoryId));
      return new HttpResponse(null, { status: 204 });
    }),
  );
});

function renderManager() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CategoryManager />
    </QueryClientProvider>,
  );
}

describe("CategoryManager", () => {
  it("상위·하위 카테고리와 요약을 보여준다", async () => {
    renderManager();

    const table = await screen.findByRole("table", { name: "카테고리 목록" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((row) => within(row).getByRole("rowheader").textContent)).toEqual([
      "백엔드",
      "└ Spring",
      "└ 아키텍처",
      "프론트엔드",
      "└ Next.js",
    ]);
    // 상위 카테고리의 글 수는 하위 카테고리 글을 합친다.
    expect(within(rows[0]).getByRole("cell", { name: "5" })).toBeInTheDocument();
    expect(screen.getByText("상위 2개")).toBeInTheDocument();
    expect(screen.getByText("하위 3개")).toBeInTheDocument();
  });

  it("슬러그 형식이 틀리면 요청하지 않고 필드 오류를 보여준다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "새 카테고리" }));
    await user.type(screen.getByLabelText("이름"), "운영");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getByLabelText("슬러그")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/영문 소문자, 숫자, 하이픈/)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("새 카테고리를 만들고 결과를 알린다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "새 카테고리" }));
    await user.type(screen.getByLabelText("이름"), "Operations");
    await user.selectOptions(screen.getByLabelText("상위 카테고리"), "프론트엔드");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText("‘Operations’ 카테고리를 추가했습니다.")).toBeInTheDocument();
    expect(requests[0].body).toEqual({
      name: "Operations",
      slug: "operations",
      description: null,
      parentId: 4,
      visible: true,
    });
  });

  it("중복 슬러그 응답은 슬러그 필드 오류로 보여준다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "새 카테고리" }));
    await user.type(screen.getByLabelText("이름"), "Spring");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText(/이미 쓰고 있는 슬러그입니다/)).toBeInTheDocument();
    expect(screen.getByLabelText("슬러그")).toHaveAttribute("aria-invalid", "true");
  });

  it("같은 부모 안에서 순서를 바꾼다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "프론트엔드 위로 이동" }));

    expect(await screen.findByText("‘프론트엔드’ 순서를 바꿨습니다.")).toBeInTheDocument();
    expect(requests[0].body).toEqual({ parentId: null, categoryIds: [4, 1] });
    expect(screen.getByRole("button", { name: "프론트엔드 위로 이동" })).toBeDisabled();
  });

  it("글이 있으면 옮길 카테고리를 골라 삭제한다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "아키텍처 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "‘아키텍처’ 삭제" });
    await user.selectOptions(within(dialog).getByLabelText("글을 옮길 카테고리"), "Next.js");
    await user.click(within(dialog).getByRole("button", { name: "글을 옮기고 삭제" }));

    expect(await screen.findByText("‘아키텍처’ 카테고리를 삭제했습니다.")).toBeInTheDocument();
    expect(new URL(requests[0].url).searchParams.get("moveTo")).toBe("5");
  });

  it("하위 카테고리가 있으면 삭제를 막는다", async () => {
    const user = userEvent.setup();
    renderManager();

    await user.click(await screen.findByRole("button", { name: "백엔드 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "‘백엔드’ 삭제" });

    expect(
      within(dialog).getByText(/하위 카테고리 2개가 있어 삭제할 수 없습니다/),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /삭제/ })).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });
});
