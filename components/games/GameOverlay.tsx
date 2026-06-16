"use client";

import { useEffect, useState } from "react";
import type { GameConfig } from "@/lib/contract-mock/types";
import { Button } from "@/components/ds";
import { Celebrate } from "@/components/ui/Celebrate";

interface GameOverlayProps {
  game: GameConfig;
  onWin: () => void;
  onClose: () => void;
}

const PALETTE = ["var(--sky-400)", "var(--sun-400)", "var(--coral-400)", "var(--meadow-400)"];

/**
 * Lenny's daily mini-game. Tap / spot games ask you to catch a goal number of
 * things; the colouring game asks you to fill every cell. On win a star is
 * granted (the launcher handles the claim). Touch-first, stable layout so it is
 * testable and accessible (>=44px targets).
 */
export function GameOverlay({ game, onWin, onClose }: GameOverlayProps) {
  const isColour = game.type === "colour";
  const goal = isColour ? game.items.length : (game.goal ?? game.items.length);

  const [caught, setCaught] = useState<Set<number>>(new Set());
  const [colour, setColour] = useState(PALETTE[0]);
  const [filled, setFilled] = useState<Record<number, string>>({});

  const progress = isColour ? Object.keys(filled).length : caught.size;
  const won = progress >= goal;

  // Fire a confetti burst the moment the game is won (re-fires after Play again).
  const [winKey, setWinKey] = useState(0);
  useEffect(() => {
    if (won) setWinKey((k) => k + 1);
  }, [won]);

  // Render `goal` catchable tiles for tap/spot; cycle item labels for variety.
  const tiles = Array.from({ length: goal }, (_, i) => game.items[i % game.items.length]);

  return (
    <div
      role="dialog"
      aria-label={game.theme}
      data-testid="game-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--grad-scene)",
        padding:
          "calc(var(--safe-top) + var(--space-4)) var(--space-4) calc(var(--safe-bottom) + var(--space-4))",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, display: "flex", justifyContent: "space-between" }}>
        <strong style={{ fontFamily: "var(--font-display)", color: "var(--royal-800)" }}>
          {progress} / {goal}
        </strong>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close game"
          className="yc-btn yc-btn--secondary yc-btn--sm"
        >
          Close
        </button>
      </div>

      <p
        style={{
          margin: 0,
          maxWidth: 520,
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          color: "var(--royal-800)",
        }}
      >
        {game.theme}
      </p>

      {won ? (
        <div
          data-testid="game-win"
          style={{
            background: "var(--surface-card)",
            border: "var(--border-ink)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--pop-sun), var(--gloss-top)",
            padding: "var(--space-6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <strong style={{ fontSize: "var(--fs-h3)", color: "var(--royal-700)" }}>
            You did it! A star for you.
          </strong>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
            <Button
              variant="secondary"
              onClick={() => {
                setCaught(new Set());
                setFilled({});
              }}
            >
              Play again
            </Button>
            <Button
              variant="cta"
              onClick={() => {
                onWin();
                onClose();
              }}
            >
              All done
            </Button>
          </div>
        </div>
      ) : isColour ? (
        <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Pick colour ${c}`}
                onClick={() => setColour(c)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-pill)",
                  background: c,
                  border: colour === c ? "4px solid var(--royal-600)" : "2.5px solid var(--royal-500)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-2)" }}>
            {tiles.map((label, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Colour ${label}`}
                onClick={() => setFilled((f) => ({ ...f, [i]: colour }))}
                style={{
                  minHeight: 64,
                  borderRadius: "var(--radius-md)",
                  border: "2.5px solid var(--royal-500)",
                  background: filled[i] ?? "var(--surface-card)",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--royal-700)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {tiles.map((label, i) => {
            const got = caught.has(i);
            return (
              <button
                key={i}
                type="button"
                data-testid="game-tile"
                aria-label={got ? `${label} caught` : `Catch ${label}`}
                disabled={got}
                onClick={() => setCaught((s) => new Set(s).add(i))}
                style={{
                  minHeight: 88,
                  borderRadius: "var(--radius-lg)",
                  border: "var(--border-ink)",
                  background: got ? "var(--meadow-300)" : "var(--surface-card)",
                  boxShadow: got ? "none" : "var(--pop-sky), var(--gloss-top)",
                  cursor: got ? "default" : "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--royal-700)",
                  transition: "transform var(--dur-fast) var(--ease-bounce)",
                }}
              >
                {got ? "Got it!" : label}
              </button>
            );
          })}
        </div>
      )}
      <Celebrate fireKey={winKey} />
    </div>
  );
}
