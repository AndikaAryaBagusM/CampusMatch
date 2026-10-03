// Original decorative graphic for the home hero (no photo rights): a winding
// path between a stack of books and a campus building. Purely decorative.
export function HeroGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" fill="none" aria-hidden className={className}>
      <path
        d="M24 214c40-6 52-40 92-44s58 30 98 18 44-62 82-70"
        stroke="white"
        strokeOpacity=".55"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="2 14"
      />
      {/* Books */}
      <g transform="translate(18 150)">
        <rect x="0" y="36" width="92" height="18" rx="4" fill="#ffd33b" />
        <rect x="8" y="18" width="80" height="18" rx="4" fill="white" />
        <rect x="2" y="0" width="86" height="18" rx="4" fill="white" fillOpacity=".7" />
        <path d="M14 45h60M20 27h52M14 9h56" stroke="#0055c0" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Campus building */}
      <g transform="translate(196 40)">
        <path d="M0 40 52 10l52 30z" fill="white" />
        <rect x="6" y="40" width="92" height="8" rx="2" fill="white" fillOpacity=".85" />
        {[14, 36, 58, 80].map((x) => (
          <rect key={x} x={x} y="52" width="10" height="42" rx="2" fill="white" fillOpacity=".75" />
        ))}
        <rect x="0" y="96" width="104" height="10" rx="2" fill="white" />
        <circle cx="52" cy="28" r="6" fill="#ffd33b" />
      </g>
      {/* Map pins along the path */}
      {[
        [118, 160],
        [214, 178],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M0-26c-9 0-15 7-15 15 0 11 15 24 15 24s15-13 15-24c0-8-6-15-15-15z" fill="#ffd33b" />
          <circle cx="0" cy="-11" r="5" fill="#0055c0" />
        </g>
      ))}
      <circle cx="150" cy="54" r="22" fill="white" fillOpacity=".12" />
      <circle cx="286" cy="200" r="14" fill="white" fillOpacity=".12" />
    </svg>
  );
}
