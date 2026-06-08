import type { MetadataRoute } from "next";

/** PWA manifest. Icons reuse the brand lockup vendored with the design system. */
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
        src: "/icons/yaycay-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/yaycay-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
