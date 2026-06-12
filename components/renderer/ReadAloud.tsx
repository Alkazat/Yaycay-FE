"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ds";

/**
 * Offline text-to-speech for an activity. Reads the supplied copy (name + body
 * + facts, never the challenge answer) via the browser speech synthesis API.
 * Renders only where TTS is supported; toggles play/stop.
 */
export function ReadAloud({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text.trim()) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utter);
    setSpeaking(true);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      aria-pressed={speaking}
      data-testid="read-aloud"
      style={{ alignSelf: "flex-start" }}
    >
      {speaking ? "Stop" : "Read to me"}
    </Button>
  );
}
