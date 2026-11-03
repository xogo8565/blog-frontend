import type { Metadata } from "next";
import { AdminGuard } from "@/features/auth/components/AdminGuard";
import { CategoryManager } from "@/features/category/components/admin/CategoryManager";

export const metadata: Metadata = {
  title: "카테고리 관리",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <main className="page-shell admin-shell" id="main-content">
      <div className="page-heading">
        <p className="eyebrow">ADMIN</p>
        <h1>카테고리 관리</h1>
        <p>순서는 공개 화면의 메뉴 순서입니다. 글은 카테고리 하나에 속하고, 태그는 함께 씁니다.</p>
      </div>
      <AdminGuard>
        <CategoryManager />
      </AdminGuard>
    </main>
  );
}
