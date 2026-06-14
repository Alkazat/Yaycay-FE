"use client";

import { useEffect } from "react";
import { captureAffiliateCode } from "@/lib/affiliate/code";

/**
 * Captures the affiliate `?code=` into localStorage on first mount, app-wide, so
 * a visitor arriving from the Website `/go/<slug>` funnel keeps attribution
 * through navigation and sign-in. Renders nothing.
 */
export function AffiliateCodeCapture() {
  useEffect(() => {
    captureAffiliateCode();
  }, []);
  return null;
}
