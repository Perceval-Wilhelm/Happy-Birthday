// Fourteen stars on the classic heart curve, rounded so server and browser render the same markup.
const STARS = Array.from({ length: 14 }, (_, i) => {
  const t = (i / 14) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
});
const POINTS = [...STARS, STARS[0]].map(({ x, y }) => `${x},${y}`).join(" ");

/** A heart drawn in stars for the ending. */
export function Constellation() {
  return (
    <svg className="constellation" viewBox="-19 -16 38 36" aria-hidden="true">
      <polyline className="constellation-line" points={POINTS} pathLength={1} />
      {STARS.map(({ x, y }) => (
        <circle key={`${x},${y}`} className="constellation-star" cx={x} cy={y} r="0.85" />
      ))}
    </svg>
  );
}
