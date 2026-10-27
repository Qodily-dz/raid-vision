import {
  Barlow,
  Bebas_Neue,
  IBM_Plex_Mono,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";

/**
 * Display face: condensed, poster-like. Used for oversized headlines and the
 * Raid VISION lockup only.
 */
export const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--raid-font-display",
  display: "swap",
});

/** Supporting face for body copy and interface text. */
export const sansFont = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--raid-font-sans",
  display: "swap",
});

/** Monospaced face for timecode-style metadata and credits. */
export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--raid-font-mono",
  display: "swap",
});

/** Arabic face: clean, technical, pairs with the Latin mono. */
export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--raid-font-arabic",
  display: "swap",
});

export const fontVariables = [
  displayFont.variable,
  sansFont.variable,
  monoFont.variable,
  arabicFont.variable,
].join(" ");