"use client";

import { useEffect, useState } from "react";

/** Shows when the device is offline; the cached trip still works. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      data-testid="offline-banner"
      style={{
        background: "var(--royal-700)",
        color: "var(--cream-100)",
        textAlign: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        padding: "var(--space-2)",
      }}
    >
      You are offline. Your saved trip still works; the live map needs wifi.
    </div>
  );
}
