import { card } from "@/content/card";
import { BirthdayCard } from "@/features/card/BirthdayCard";
import { resolveCard } from "@/features/card/resolve";

export default function Page() {
  return <BirthdayCard card={resolveCard(card)} />;
}
