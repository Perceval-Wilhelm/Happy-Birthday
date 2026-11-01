export function GiftBox() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="gBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9fc2" />
          <stop offset="1" stopColor="#e05a8c" />
        </linearGradient>
        <linearGradient id="gLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb8d2" />
          <stop offset="1" stopColor="#f27aa6" />
        </linearGradient>
        <linearGradient id="gRibbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e3a03e" />
          <stop offset=".5" stopColor="#ffe6a6" />
          <stop offset="1" stopColor="#e3a03e" />
        </linearGradient>
        <radialGradient id="gGlow">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffd36e" stopOpacity="0" />
        </radialGradient>
        <pattern id="gDots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="2.4" fill="#fff" fillOpacity=".35" />
          <circle cx="13.5" cy="13.5" r="2.4" fill="#fff" fillOpacity=".35" />
        </pattern>
      </defs>
      <ellipse cx="100" cy="188" rx="66" ry="8" fill="#000" fillOpacity=".28" />
      <ellipse className="gift-glow" cx="100" cy="94" rx="92" ry="46" fill="url(#gGlow)" opacity="0" />
      <rect x="36" y="94" width="128" height="90" rx="10" fill="url(#gBox)" />
      <rect x="36" y="94" width="128" height="90" rx="10" fill="url(#gDots)" />
      <rect x="36" y="94" width="128" height="7" fill="#000" fillOpacity=".1" />
      <rect x="90" y="94" width="20" height="90" fill="url(#gRibbon)" />
      <g className="lid">
        <rect x="28" y="72" width="144" height="28" rx="8" fill="url(#gLid)" />
        <rect x="90" y="72" width="20" height="28" fill="url(#gRibbon)" />
        <path d="M100 72C86 44 52 42 58 64c4 12 30 12 42 8Z" fill="url(#gRibbon)" />
        <path d="M100 72c14-28 48-30 42-8-4 12-30 12-42 8Z" fill="url(#gRibbon)" />
        <circle cx="100" cy="72" r="9" fill="#f0b04f" />
      </g>
    </svg>
  );
}
