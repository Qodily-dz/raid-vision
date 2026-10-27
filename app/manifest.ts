import type { MetadataRoute } from "next";

/**
 * Generates Web App Manifest for enhanced mobile, PWA, and browser search signals.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raid VISION — Filmmaker & Visual Storyteller",
    short_name: "Raid VISION",
    description:
      "Multilingual cinematic portfolio, showreel, and visual productions by filmmaker Raid.",
    start_url: "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#7928ca",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
