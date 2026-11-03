import type { Metadata } from "next";
import { Providers } from "./providers";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "개발 노트", template: "%s | 개발 노트" },
  description: "배우고 만든 것을 차분히 기록하는 기술 블로그입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>
          <a className="skip-link" href="#main-content">
            본문으로 건너뛰기
          </a>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
