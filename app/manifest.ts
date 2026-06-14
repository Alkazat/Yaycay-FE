import type { MetadataRoute } from "next";

/**
 * PWA manifest. Install icons use the square "Yay!" app-icon mark (not the wide
 * box-art lockup, which is illegible at icon sizes). See BRAND-ASSETS.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yaycay - For families making memories",
    short_name: "Yaycay",
    description: "Plan the trip. Skip the stress. Keep the yay.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7EC",
    theme_color: "#2A96D8",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
