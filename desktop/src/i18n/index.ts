import pt from "./pt.json";
import en from "./en.json";

export type Locale = "pt" | "en";

const messages = { pt, en } as const;

type Messages = typeof pt;

export function t(locale: Locale, key: string): string {
  const parts = key.split(".");
  let current: unknown = messages[locale];

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  return typeof current === "string" ? current : key;
}

export type { Messages };
