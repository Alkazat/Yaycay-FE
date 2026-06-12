"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { OfflineBanner } from "@/components/shell/OfflineBanner";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const ICONS = {
  trips: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  explorers: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
};

const NAV: NavItem[] = [
  { href: "/trips", label: "Trips", icon: ICONS.trips },
  { href: "/profiles", label: "Explorers", icon: ICONS.explorers },
  { href: "/account", label: "Account", icon: ICONS.account },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Persistent app chrome: top brand bar + desktop nav, mobile bottom tab bar. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <>
      <OfflineBanner />
      <header className="yc-appbar">
        <Link href="/trips" className="yc-appbar__brand" aria-label="Yaycay home">
          <Image src="/icons/yaycay-logo.png" alt="" width={36} height={36} priority />
          <span>Yaycay</span>
        </Link>
        <nav className="yc-appnav" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={
                "yc-appnav__link" + (isActive(pathname, item.href) ? " yc-appnav__link--active" : "")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="yc-shell">
        <div className="yc-container">{children}</div>
      </main>

      <nav className="yc-tabbar" aria-label="Primary">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={
              "yc-tabbar__link" + (isActive(pathname, item.href) ? " yc-tabbar__link--active" : "")
            }
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
