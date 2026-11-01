import { ImageResponse } from "next/og";
import { card } from "@/content/card";
import { resolveCard } from "@/features/card/resolve";

const { addressee } = resolveCard(card);

export const alt = `Gửi ${addressee}: có một món quà nhỏ đang chờ mở`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const title = `Gửi ${addressee}`;
const subtitle = "Có một món quà nhỏ đang chờ mở";

// Without a browser user agent, Google Fonts returns TrueType, which is what the image renderer reads;
// `text` trims the font to just the letters drawn here.
async function googleFont(family: string, weight: number, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((response) => response.text());
  const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
  if (!url) throw new Error(`Google Fonts returned no TrueType file for ${family}`);
  return fetch(url).then((response) => response.arrayBuffer());
}

const gift = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fc2"/><stop offset="1" stop-color="#e05a8c"/></linearGradient><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb8d2"/><stop offset="1" stop-color="#f27aa6"/></linearGradient><linearGradient id="r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3a03e"/><stop offset=".5" stop-color="#ffe6a6"/><stop offset="1" stop-color="#e3a03e"/></linearGradient></defs><ellipse cx="100" cy="188" rx="66" ry="8" fill="#000" fill-opacity=".28"/><rect x="36" y="94" width="128" height="90" rx="10" fill="url(#b)"/><rect x="90" y="94" width="20" height="90" fill="url(#r)"/><rect x="28" y="72" width="144" height="28" rx="8" fill="url(#l)"/><rect x="90" y="72" width="20" height="28" fill="url(#r)"/><path d="M100 72C86 44 52 42 58 64c4 12 30 12 42 8Z" fill="url(#r)"/><path d="M100 72c14-28 48-30 42-8-4 12-30 12-42 8Z" fill="url(#r)"/><circle cx="100" cy="72" r="9" fill="#f0b04f"/></svg>`;

// Fixed positions, so every build draws the same sky.
const STARS = [
  [80, 70, 3],
  [210, 150, 2],
  [330, 60, 2.5],
  [520, 110, 2],
  [700, 50, 3],
  [880, 130, 2],
  [1050, 70, 2.5],
  [1130, 210, 2],
  [980, 300, 1.5],
  [140, 330, 1.5],
  [60, 520, 2],
  [420, 560, 1.5],
  [760, 560, 2],
  [1110, 520, 2.5],
] as const;

export default async function Image() {
  const [script, sans] = await Promise.all([
    googleFont("Dancing+Script", 700, title),
    googleFont("Be+Vietnam+Pro", 400, subtitle),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 70,
        position: "relative",
        background: "linear-gradient(180deg, #0b0820 0%, #1d1240 46%, #431f4f 80%, #7a3357 100%)",
      }}
    >
      {STARS.map(([x, y, r]) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            background: "#fff6ec",
            opacity: 0.8,
          }}
        />
      ))}
      <img src={`data:image/svg+xml;base64,${Buffer.from(gift).toString("base64")}`} width={300} height={300} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: "Dancing Script", fontSize: 112, color: "#fff0c2", lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 40, color: "rgba(255, 246, 236, .8)" }}>{subtitle}</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Dancing Script", data: script, weight: 700, style: "normal" },
        { name: "Be Vietnam Pro", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
