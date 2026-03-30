import Link from "next/link";
import { LanguageSwitcher } from "@/components/action-forms";
import { buildNav, copy, type Locale } from "@/lib/i18n";

export function AppShell({
  children,
  title,
  subtitle,
  locale,
  nav,
  languageLabels,
  appName,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  locale?: Locale;
  appName?: string;
  nav?: Array<{ href: string; label: string }>;
  languageLabels?: {
    label: string;
    en: string;
    zh: string;
  };
}) {
  const resolvedLocale = locale ?? "en";
  const resolvedNav = nav ?? buildNav(resolvedLocale);
  const resolvedLabels = languageLabels ?? copy[resolvedLocale].language;
  const resolvedAppName = appName ?? copy[resolvedLocale].appName;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(2,6,23,0.94),rgba(15,23,42,0.92),rgba(23,37,84,0.7))] p-6 shadow-2xl shadow-slate-950/40">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 top-10 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">{resolvedAppName}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
          </div>
          <div className="grid gap-3">
            <LanguageSwitcher currentLocale={resolvedLocale} labels={resolvedLabels} />
            <nav className="flex flex-wrap gap-2 rounded-[24px] border border-white/8 bg-white/4 p-2 backdrop-blur-sm">
              {resolvedNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-amber-300/40 hover:bg-amber-300/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
