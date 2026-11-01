const CANDLES = [
  { x: 102, delay: "0s" },
  { x: 130, delay: "-.2s" },
  { x: 158, delay: "-.35s" },
];

const SPRINKLES = [
  { x: 58, y: 198, angle: 30, color: "#ffd36e" },
  { x: 84, y: 214, angle: -25, color: "#7fd8c8" },
  { x: 110, y: 196, angle: 65, color: "#fff" },
  { x: 136, y: 216, angle: 12, color: "#b79bff" },
  { x: 164, y: 200, angle: -40, color: "#ffd36e" },
  { x: 190, y: 214, angle: 28, color: "#7fd8c8" },
  { x: 208, y: 194, angle: -62, color: "#fff" },
];

/**
 * Each flame sits in three groups: GSAP blows out `.flame-wrap`, the microphone bends `.flame-lean`
 * through the --breath variable, and CSS flickers `.flame`. Separate groups keep them from fighting.
 */
export function Cake() {
  return (
    <svg viewBox="0 0 260 250" aria-hidden="true">
      <defs>
        <linearGradient id="cTier1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9fc2" />
          <stop offset="1" stopColor="#dd5c90" />
        </linearGradient>
        <linearGradient id="cTier2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4bdff" />
          <stop offset="1" stopColor="#9a77e3" />
        </linearGradient>
        <linearGradient id="cFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a2a" />
          <stop offset=".55" stopColor="#ffc93c" />
          <stop offset="1" stopColor="#ffeaa0" />
        </linearGradient>
        <radialGradient id="cGlow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <pattern id="cStripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <rect width="8" height="8" fill="#fff8fb" />
          <rect width="4" height="8" fill="#ff8fb1" />
        </pattern>
      </defs>
      <ellipse cx="130" cy="239" rx="112" ry="8" fill="#000" fillOpacity=".25" />
      <ellipse cx="130" cy="232" rx="122" ry="12" fill="#f4eaff" />
      <rect x="34" y="150" width="192" height="82" rx="14" fill="url(#cTier1)" />
      <g>
        {SPRINKLES.map((s) => (
          <rect
            key={`${s.x}-${s.y}`}
            x="-5"
            y="-1.8"
            width="10"
            height="3.6"
            rx="1.8"
            transform={`translate(${s.x} ${s.y}) rotate(${s.angle})`}
            fill={s.color}
          />
        ))}
      </g>
      <path
        d="M34 164Q34 150 48 150H212Q226 150 226 164V166L214 168C214 184 202 184 202 170L186 169C186 178 176 178 176 169L156 168C156 190 140 190 140 170L120 169C120 179 110 179 110 169L92 168C92 186 78 186 78 170L60 169C60 178 50 178 50 168L34 166Z"
        fill="#fff3f8"
      />
      <path d="M46 228H216" stroke="#fff3f8" strokeWidth="10" strokeLinecap="round" strokeDasharray="0 13" />
      <rect x="66" y="96" width="128" height="58" rx="12" fill="url(#cTier2)" />
      <g fill="#ffd36e">
        <circle cx="88" cy="134" r="3.2" />
        <circle cx="130" cy="132" r="3.2" />
        <circle cx="172" cy="134" r="3.2" />
      </g>
      <g fill="#fff">
        <circle cx="109" cy="139" r="3.2" />
        <circle cx="151" cy="139" r="3.2" />
      </g>
      {CANDLES.map(({ x }) => (
        <rect key={x} x={x - 5} y="56" width="10" height="44" rx="3" fill="url(#cStripes)" />
      ))}
      <path d="M102 56v-7M130 56v-7M158 56v-7" stroke="#4b3535" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M66 110Q66 96 80 96H180Q194 96 194 110V112L184 113C184 126 174 126 174 114L158 113C158 120 150 120 150 113L134 112C134 130 120 130 120 114L104 113C104 121 96 121 96 113L80 112C80 125 70 125 70 113L66 112Z"
        fill="#fff3f8"
      />
      <path d="M76 151H184" stroke="#fff3f8" strokeWidth="9" strokeLinecap="round" strokeDasharray="0 12" />
      {CANDLES.map(({ x, delay }) => (
        <g key={x} className="flame-wrap">
          <circle cx={x} cy="38" r="24" fill="url(#cGlow)" />
          <g className="flame-lean">
            <g className="flame" style={{ animationDelay: delay }}>
              <path d={`M${x} 20c7 10 9 16 9 21a9 9 0 0 1-18 0c0-5 2-11 9-21Z`} fill="url(#cFlame)" />
              <path d={`M${x} 31c4 6 5 9 5 12a5 5 0 0 1-10 0c0-3 1-6 5-12Z`} fill="#fffbe6" />
            </g>
          </g>
        </g>
      ))}
      {CANDLES.map(({ x }) => (
        <path key={x} className="smoke" d={`M${x} 44c-5-7 5-12 0-19s5-12 0-19`} />
      ))}
    </svg>
  );
}
