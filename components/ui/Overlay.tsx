"use client";

import { useEffect, type ReactNode } from "react";

interface OverlayProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}

/**
 * A full-screen bottom-sheet overlay - the in-place "stay in the book" surface
 * the gold standard uses for Map / Packing / Journal / While-you're-there, so a
 * tool never navigates you away from the day. Esc + backdrop tap close it; the
 * body scroll is locked while open (one scroll context); the sheet body is the
 * only scroller. role="dialog" + aria-modal for assistive tech.
 */
export function Overlay({ open, title, onClose, children, testId }: OverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="yc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={testId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="yc-overlay__sheet">
        <header className="yc-overlay__bar">
          <h2 className="yc-overlay__title">{title}</h2>
          <button
            type="button"
            className="yc-overlay__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="yc-overlay__body">{children}</div>
      </div>
      <style>{`
        .yc-overlay {
          position: fixed; inset: 0; z-index: 60;
          display: flex; align-items: flex-end; justify-content: center;
          background: rgba(10, 30, 60, .45);
          animation: yc-overlay-fade var(--dur-sm, .15s) ease both;
        }
        .yc-overlay__sheet {
          display: flex; flex-direction: column;
          width: 100%; max-width: 760px; height: 100%;
          background: var(--surface-page, var(--cream-100, #fbf7ec));
          border-top-left-radius: var(--radius-2xl, 24px);
          border-top-right-radius: var(--radius-2xl, 24px);
          box-shadow: 0 -8px 40px rgba(10, 30, 60, .3);
          overflow: hidden;
          animation: yc-overlay-up var(--dur-md, .3s) var(--ease-bounce, ease) both;
        }
        .yc-overlay__bar {
          flex: 0 0 auto;
          display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          padding-top: max(var(--space-3), env(safe-area-inset-top));
          background: var(--surface-card, #fff);
          border-bottom: 2.5px solid var(--sand-200, #ece3d2);
        }
        .yc-overlay__title {
          margin: 0; font-family: var(--font-display); font-weight: 700;
          font-size: var(--fs-h4, 1.1rem); color: var(--royal-700, #0a4c8b);
        }
        .yc-overlay__close {
          flex: 0 0 auto; display: grid; place-items: center;
          width: var(--control-md, 44px); height: var(--control-md, 44px);
          border-radius: var(--radius-pill, 999px);
          border: 2.5px solid var(--sand-300, #ddd0b8);
          background: var(--surface-card, #fff);
          color: var(--royal-700, #0a4c8b); font-size: 18px; font-weight: 800; cursor: pointer;
        }
        .yc-overlay__body {
          flex: 1 1 auto; overflow-y: auto;
          padding: var(--space-4);
          padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
          -webkit-overflow-scrolling: touch;
        }
        @keyframes yc-overlay-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes yc-overlay-up { from { transform: translateY(6%); } to { transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .yc-overlay, .yc-overlay__sheet { animation: none; }
        }
      `}</style>
    </div>
  );
}
