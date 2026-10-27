import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";

/**
 * Admin root layout.
 *
 * The admin is intentionally its own root document: it is an operator tool in
 * English with an LTR interface, and it must not inherit the public site's
 * localized `lang`/`dir` from `[locale]`. Multiple root layouts are the supported
 * App Router pattern for exactly this split.
 */
export const metadata: Metadata = {
  title: {
    default: "Raid VISION — Dashboard",
    template: "%s — Raid VISION",
  },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/favicon.ico" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="min-h-dvh bg-black text-ink">{children}</body>
    </html>
  );
}