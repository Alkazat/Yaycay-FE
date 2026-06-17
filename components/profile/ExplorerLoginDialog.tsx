"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExplorerLogin,
  enableExplorerLogin,
  disableExplorerLogin,
} from "@/lib/api/profiles";
import { Button, Card, CardBody } from "@/components/ds";

interface ExplorerLoginDialogProps {
  profileId: string;
  profileName: string;
  onClose: () => void;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(16, 24, 40, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-4)",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  padding: "0 14px",
  minHeight: 46,
  borderRadius: "var(--radius-md)",
  border: "2.5px solid var(--sand-300)",
};

function ErrText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
      {children}
    </p>
  );
}

/** Shows the one-time sign-in link to hand to the explorer, with a copy button. */
function LinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="yc-stack"
      data-testid="explorer-login-link"
      style={{
        gap: 6,
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md)",
        background: "var(--sky-50)",
        border: "2px solid var(--sky-200, #cfe3fa)",
      }}
    >
      <span style={{ fontWeight: 800 }}>Their one-time sign-in link</span>
      <span style={{ wordBreak: "break-all", color: "var(--text-muted)", fontWeight: 600 }}>{link}</span>
      <button
        type="button"
        className="yc-btn yc-btn--secondary yc-btn--sm"
        onClick={() => {
          navigator.clipboard?.writeText(link).then(
            () => setCopied(true),
            () => setCopied(false),
          );
        }}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

/**
 * Give a profile its own magic-link login (or revoke it). A linked explorer can
 * sign in and explore the family's trips read-only - no grown-ups area, no edits.
 * No login means they simply explore through the parent's account (the fallback).
 */
export function ExplorerLoginDialog({ profileId, profileName, onClose }: ExplorerLoginDialogProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [actionLink, setActionLink] = useState<string | null>(null);

  const status = useQuery({
    queryKey: ["explorer-login", profileId],
    queryFn: () => getExplorerLogin(profileId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["explorer-login", profileId] });

  const enable = useMutation({
    mutationFn: () => enableExplorerLogin(profileId, email.trim().toLowerCase()),
    onSuccess: (res) => {
      setActionLink(res.action_link ?? null);
      invalidate();
    },
  });

  const revoke = useMutation({
    mutationFn: () => disableExplorerLogin(profileId),
    onSuccess: () => {
      setActionLink(null);
      invalidate();
    },
  });

  const enabled = status.data?.enabled ?? false;
  const canSend = EMAIL_RE.test(email.trim()) && !enable.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${profileName}'s login`}
      data-testid="explorer-login"
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card variant="soft" style={{ width: "100%", maxWidth: 400 }}>
        <CardBody title={`${profileName}'s own login`}>
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            Give {profileName} their own magic-link sign-in so they can explore the trip
            themselves - read-only, no grown-ups area, no edits. Revoke it any time. No login?
            They just explore through your account.
          </p>

          {status.isLoading ? <p style={{ marginTop: "var(--space-3)" }}>Loading…</p> : null}

          {!status.isLoading && enabled ? (
            <div className="yc-stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
              <p style={{ margin: 0, fontWeight: 800 }}>
                ✅ Login active
                {status.data?.email ? (
                  <>
                    {" "}
                    for <span style={{ color: "var(--royal-700)" }}>{status.data.email}</span>
                  </>
                ) : null}
                .
              </p>
              {actionLink ? <LinkBox link={actionLink} /> : null}
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <Button
                  variant="danger"
                  onClick={() => revoke.mutate()}
                  disabled={revoke.isPending}
                  data-testid="explorer-login-revoke"
                >
                  {revoke.isPending ? "Revoking…" : "Revoke login"}
                </Button>
                <button type="button" className="yc-btn yc-btn--secondary" onClick={onClose}>
                  Done
                </button>
              </div>
              {revoke.isError ? <ErrText>Couldn&apos;t revoke that just now. Try again?</ErrText> : null}
            </div>
          ) : null}

          {!status.isLoading && !enabled ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSend) enable.mutate();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
                marginTop: "var(--space-3)",
              }}
            >
              <input
                type="email"
                inputMode="email"
                autoComplete="off"
                autoFocus
                value={email}
                aria-label={`${profileName}'s email`}
                placeholder="their.email@example.com"
                data-testid="explorer-login-email"
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              {actionLink ? <LinkBox link={actionLink} /> : null}
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <Button
                  type="submit"
                  variant="cta"
                  disabled={!canSend}
                  data-testid="explorer-login-send"
                >
                  {enable.isPending ? "Setting up…" : "Give them a login"}
                </Button>
                <button type="button" className="yc-btn yc-btn--secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>
              {enable.isError ? (
                <ErrText>Couldn&apos;t set that up. Check the email and try again?</ErrText>
              ) : null}
            </form>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
