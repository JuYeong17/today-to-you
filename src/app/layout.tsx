import type { Metadata } from "next";
import { brand } from "../config/brand";
import "./globals.css";

const title = `${brand.name} — ${brand.slogan}`;
export const metadata: Metadata = {
  title, description: brand.description, applicationName: brand.name,
  openGraph: { title, description: brand.description, siteName: brand.name, locale: "ko_KR", type: "website" },
  twitter: { card: "summary", title, description: brand.description },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><a className="skip-link" href="#main-content">본문으로 바로가기</a>{children}</body></html>;
}
