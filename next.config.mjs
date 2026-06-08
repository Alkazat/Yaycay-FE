import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA only active in production; avoids SW caching headaches in dev.
  disable: process.env.NODE_ENV === "development",
  register: true,
  // Offline cache of a purchased trip + background sync are layered in later
  // (premium tiers only); this is the install + shell baseline.
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design system is vendored as .jsx source under /vendor; let Next
  // transpile it as part of the app build.
  transpilePackages: [],
};

export default withPWA(nextConfig);
