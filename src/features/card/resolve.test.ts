import { describe, expect, it } from "vitest";
import { card } from "@/content/card";
import { resolveCard } from "./resolve";

describe("resolveCard", () => {
  it("puts the pronoun before the name", () => {
    expect(resolveCard({ ...card, you: "em", name: "Lan" }).addressee).toBe("em Lan");
  });

  it("uses the name alone for someone called by name", () => {
    expect(resolveCard({ ...card, you: "Lan", name: "Lan" }).addressee).toBe("Lan");
  });
});
