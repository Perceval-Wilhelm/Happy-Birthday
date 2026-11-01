import type { StaticImageData } from "next/image";
import photo1 from "./photo-1.jpg";
import photo2 from "./photo-2.jpg";
import photo3 from "./photo-3.jpg";

export type CardConfig = {
  /** Shown on the gift, in the greeting and in the chat. */
  name: string;
  fullName: string;
  /**
   * How the sender refers to themself ("anh", "em", "mình", …) and to the recipient ("em", "chị", …).
   * For someone you call by name, set `you` to the name itself.
   */
  me: string;
  you: string;
  /**
   * Photos in src/content/, in the order they land in the wish scene; the last stays on top. The first
   * is also the chat avatar. Portrait (3:4) works best.
   */
  photos: [StaticImageData, ...StaticImageData[]];
  music: string;
  /** Keep the gift locked until this moment, as ISO time with an offset, e.g. "2026-11-02T00:00:00+07:00". */
  unlockAt: string | null;
  /** Optional link for a reply button at the end, e.g. "https://m.me/your.username" or a Zalo link. */
  replyUrl: string | null;
  /**
   * The story, scene by scene. {me}/{you}/{name}/{fullName} are filled in; {Me}/{You} start a
   * sentence. Words between *asterisks* get the gold underline.
   */
  text: {
    greeting: string;
    birthday: string;
    message: string;
    planned: string;
    rethink: string;
    special: string;
    because: string;
    youAre: string;
    makeAWish: string;
    wish: string;
    reply: string;
    replay: string;
    replyButton: string;
  };
};

export const card: CardConfig = {
  name: "Tiên",
  fullName: "Huỳnh Ngọc Thuỷ Tiên",
  me: "Thịnh",
  you: "Tiên",
  photos: [photo1, photo2, photo3],
  music: "/music/hbd.mp3",
  unlockAt: null,
  replyUrl: null,
  text: {
    greeting: "{fullName} hay Maeve, tên nào của {you} cũng nghe rất hay đó!",
    birthday: "It's your birthday!!",
    message:
      "Chúc mừng sinh nhật!!! Chúc mỹ nữ tuổi mới ngày càng xinh đẹp, giỏi giang, học được thật nhiều kiến thức, kiếm thật nhiều tiền, tràn đầy sức khoẻ và niềm vui trong cuộc sống nha",
    planned: "Đó là những gì mà {me} đã định làm.",
    rethink: "Nhưng sau đó {me} nghĩ lại.",
    special: "{Me} nhận ra, {me} muốn làm gì đó *đặc biệt* hơn.",
    because: "Bởi vì,",
    youAre: "{You} là một người phụ nữ đặc biệt",
    makeAWish: "Ước một điều thật đẹp, rồi chạm vào nến để thổi nha ✨",
    wish: "Mong những điều tốt đẹp nhất sẽ luôn bên {you}! ;)",
    reply: "Ok, giờ thì nhắn cho {me} là nếu {you} thích nó hay không.",
    replay: "Hoặc nhấn đây, nếu {you} muốn xem lại nó nha.",
    replyButton: "Nhắn lại cho {me} 💌",
  },
};
