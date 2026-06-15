"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
];

const ACCOUNT: NavItem = { href: "/account", label: "Account", icon: ICONS.account };

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Which section accent the current route belongs to (subtle per-area colour). */
function sectionFor(pathname: string): string {
  if (pathname.startsWith("/account")) return "account";
  if (pathname.startsWith("/profiles")) return "explorers";
  if (/^\/trips\/[^/]+\/plan/.test(pathname)) return "planning";
  return "trips";
}

/** Persistent app chrome: top brand bar + desktop nav, mobile bottom tab bar. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const section = sectionFor(pathname);

  // The brand mark is large at the top of a page and shrinks once you scroll.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="yc-app" data-section={section}>
      <OfflineBanner />
      <header className={`yc-appbar${scrolled ? " yc-appbar--scrolled" : ""}`}>
        <Link href="/trips" className="yc-appbar__brand" aria-label="Yaycay home">
          <Image src="/icons/yaycay-wordmark.png" alt="Yaycay" width={132} height={76} priority />
        </Link>
        <div className="yc-appbar__actions">
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
          <Link
            href={ACCOUNT.href}
            aria-label={ACCOUNT.label}
            aria-current={isActive(pathname, ACCOUNT.href) ? "page" : undefined}
            className={
              "yc-appnav__link yc-appbar__account" +
              (isActive(pathname, ACCOUNT.href) ? " yc-appnav__link--active" : "")
            }
          >
            {ACCOUNT.icon}
            <span className="yc-appbar__account-label">{ACCOUNT.label}</span>
          </Link>
        </div>
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
    </div>
  );
}
