"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { generateDemoDay } from "@/lib/api/demo";
import { captureSignup } from "@/lib/api/signup";
import type { DemoGenerateDayResponse } from "@/lib/contract-mock/types";
import { PREFILL_EMAIL_PARAM } from "@/lib/constants";
import { Button, Card, CardBody, Input } from "@/components/ds";
import { Countdown } from "@/components/Countdown";
import { TripDayRenderer } from "@/components/renderer/TripDayRenderer";

/** A sensible default trip date: about a month out. */
function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function localTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function DemoClient() {
  const router = useRouter();
  const [destination, setDestination] = useState("Singapore");
  const [childName, setChildName] = useState("");
  const [date, setDate] = useState(defaultDate());
  const [email, setEmail] = useState("");

  const mutation = useMutation<DemoGenerateDayResponse, Error>({
    mutationFn: () => generateDemoDay({ destination, child: { name: childName }, date }),
  });

  // Capture the account/email (Brevo-synced by BE), then hand off to /auth.
  const signup = useMutation({
    mutationFn: () => captureSignup({ email, consent: true }),
    onSuccess: () => {
      router.push(`/auth?${PREFILL_EMAIL_PARAM}=${encodeURIComponent(email)}`);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const result = mutation.data;

  return (
    <div className="yc-stack">
      <header style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--fs-display)" }}>Your family holiday, in a moment</h1>
        <p style={{ fontSize: "var(--fs-lg)" }}>
          Tell us where, when, and who. We will build one day to show you the yay.
        </p>
      </header>

      <Card>
        <CardBody>
          <form className="yc-stack" onSubmit={onSubmit}>
            <Input
              label="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Singapore"
              required
            />
            <Input
              label="Who is exploring?"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="A first name"
              required
            />
            <Input
              label="When?"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="cta"
              size="lg"
              block
              disabled={mutation.isPending || !destination || !childName}
            >
              {mutation.isPending ? "Building your day..." : "Build my day"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {mutation.isError ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              Hmm, that didn&apos;t build. Give it another go?
            </p>
          </CardBody>
        </Card>
      ) : null}

      {result ? (
        <div className="yc-stack" data-testid="demo-result">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Countdown startDate={date} timezone={localTimezone()} />
          </div>

          <h2 style={{ textAlign: "center" }}>Day 1 in {destination}</h2>

          {/* The demo shows one explorer's view, with a quiz. */}
          <TripDayRenderer day={result.day} view="kid" mode="explorer_plus" />

          {result.grownups_teaser ? (
            <Card variant="soft">
              <CardBody title="For the grown-ups">
                <p style={{ margin: 0 }}>{result.grownups_teaser}</p>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardBody title="Want the whole adventure?">
              <p style={{ margin: 0 }}>
                Create your free account to save this and unlock every day, every child&apos;s
                adventure, and the grown-ups guide.
              </p>
              <Input
                label="Your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button
                variant="primary"
                size="lg"
                block
                onClick={() => signup.mutate()}
                disabled={email.length === 0 || signup.isPending}
              >
                {signup.isPending ? "Saving..." : "Create my account"}
              </Button>
              {signup.isError ? (
                <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
                  Hmm, that didn&apos;t save. Give it another go?
                </p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
