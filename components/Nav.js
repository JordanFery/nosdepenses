"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Tags, Wallet } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Dépenses", icon: Receipt },
  { href: "/categories", label: "Catégories", icon: Tags },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Barre supérieure — desktop & mobile */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-neutral-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <Wallet size={16} />
            </span>
            <span className="hidden sm:inline">Dépenses du couple</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Barre inférieure — mobile uniquement */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-around h-16">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium ${
                  active ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
