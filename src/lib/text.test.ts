import { describe, expect, it } from "vitest";
import { emphasis, fill } from "./text";

const voice = { me: "anh", you: "em", name: "Lan", fullName: "Ngọc Lan" };

describe("fill", () => {
  it("swaps pronouns and names", () => {
    expect(fill("Thật ra tên của {you} nghe rất hay đó, {fullName}!", voice)).toBe(
      "Thật ra tên của em nghe rất hay đó, Ngọc Lan!",
    );
  });

  it("capitalises {Me} and {You} for the start of a sentence", () => {
    expect(fill("{Me} nhận ra, {me} muốn làm gì đó", voice)).toBe("Anh nhận ra, anh muốn làm gì đó");
    expect(fill("{You} là một người phụ nữ đặc biệt", { ...voice, you: "chị" })).toBe(
      "Chị là một người phụ nữ đặc biệt",
    );
  });

  it("leaves unknown placeholders untouched", () => {
    expect(fill("Hi {nickname}", voice)).toBe("Hi {nickname}");
  });
});

describe("emphasis", () => {
  it("marks the words between asterisks", () => {
    expect(emphasis("làm gì đó *đặc biệt* hơn.")).toEqual([
      { text: "làm gì đó ", marked: false },
      { text: "đặc biệt", marked: true },
      { text: " hơn.", marked: false },
    ]);
  });

  it("returns the plain line when nothing is marked", () => {
    expect(emphasis("Bởi vì,")).toEqual([{ text: "Bởi vì,", marked: false }]);
  });
});
