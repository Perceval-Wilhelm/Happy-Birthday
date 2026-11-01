import type { CardConfig } from "@/content/card";
import { fill } from "@/lib/text";

/** Fills every template in the config so the client only receives finished strings. */
export function resolveCard(config: CardConfig) {
  const voice = { me: config.me, you: config.you, name: config.name, fullName: config.fullName };
  const text = Object.fromEntries(
    Object.entries(config.text).map(([key, line]) => [key, fill(line, voice)]),
  ) as CardConfig["text"];
  // Someone called by name is addressed by the name alone, not "Lan Lan".
  const addressee = config.you === config.name ? config.name : `${config.you} ${config.name}`;
  return { ...config, text, addressee };
}

export type ResolvedCard = ReturnType<typeof resolveCard>;
