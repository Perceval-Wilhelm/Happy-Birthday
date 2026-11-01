export type Voice = { me: string; you: string; name: string; fullName: string };

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase("vi") + word.slice(1);

/**
 * Fills {me}, {you}, {name} and {fullName} in a line of the card. {Me} and {You} are the same
 * pronouns capitalised for the start of a sentence, so switching "anh/em" to "em/chị" is one edit.
 */
export function fill(template: string, voice: Voice): string {
  return template.replace(/\{(me|you|Me|You|name|fullName)\}/g, (_, key: string) => {
    if (key === "Me") return capitalize(voice.me);
    if (key === "You") return capitalize(voice.you);
    return voice[key as keyof Voice];
  });
}

export type Segment = { text: string; marked: boolean };

/** Splits "*…*" emphasis (the words that get the gold underline) out of a line. */
export function emphasis(line: string): Segment[] {
  return line
    .split("*")
    .map((text, index) => ({ text, marked: index % 2 === 1 }))
    .filter((segment) => segment.text !== "");
}
