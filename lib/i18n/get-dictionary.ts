import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import { DEFAULT_LOCALE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ar, en, fr };

export function getDictionary(locale: string): Dictionary {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : DEFAULT_LOCALE];
}

export type { Locale };
export { DEFAULT_LOCALE };