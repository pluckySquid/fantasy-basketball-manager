import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fantasy Hoops Director",
  description: "A single-player fantasy basketball manager MVP built with original teams, players, and simulation rules.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
