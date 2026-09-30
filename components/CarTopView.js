const BODY_PATH =
  "M48 72 C72 60 92 52 110 52 C132 50 148 44 160 44 C190 44 222 50 250 58 " +
  "C278 65 306 67 332 68 C362 69 392 63 420 60 C450 55 480 46 508 46 " +
  "C540 45 560 47 578 52 C604 60 620 80 632 100 C660 130 676 156 688 180 " +
  "C676 204 660 230 632 260 C620 280 604 300 578 308 C560 313 540 315 508 315 " +
  "C480 314 450 305 420 300 C392 297 362 291 332 292 C306 293 278 295 250 302 " +
  "C222 310 190 316 160 316 C148 316 132 310 110 308 C92 308 72 300 48 288 " +
  "C40 236 40 124 48 72 Z";

const CANOPY_PATH =
  "M472 180 C470 158 458 146 438 141 C400 133 340 132 292 136 " +
  "C262 139 240 148 226 160 C220 166 220 174 226 180 " +
  "C220 186 220 194 226 200 C240 212 262 221 292 224 " +
  "C340 228 400 227 438 219 C458 214 470 202 472 180 Z";

const SLATS = [
  "M112 132 C150 125 182 125 212 132",
  "M104 150 C146 143 184 143 216 150",
  "M100 168 C144 161 184 161 218 168",
  "M100 192 C144 199 184 199 218 192",
  "M104 210 C146 217 184 217 216 210",
  "M112 228 C150 235 182 235 212 228",
];

export default function CarTopView({ className = "" }) {
  return (
    <svg
      viewBox="0 0 736 360"
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.34" />
          <stop offset="1" stopColor="#000" stopOpacity="0.06" />
        </linearGradient>

        <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#454a54" />
          <stop offset="0.18" stopColor="#2b2f37" />
          <stop offset="0.5" stopColor="#15181d" />
          <stop offset="0.82" stopColor="#262a31" />
          <stop offset="1" stopColor="#3d424b" />
        </linearGradient>

        <linearGradient id="canopy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#20364d" />
          <stop offset="0.45" stopColor="#0d1a27" />
          <stop offset="1" stopColor="#16283a" />
        </linearGradient>

        <linearGradient id="tyre" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24272c" />
          <stop offset="0.5" stopColor="#0a0b0d" />
          <stop offset="1" stopColor="#1c1f24" />
        </linearGradient>

        <linearGradient id="headlamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#9fe4ff" stopOpacity="0.7" />
        </linearGradient>

        <clipPath id="bodyClip">
          <path d={BODY_PATH} />
        </clipPath>

        <filter id="softBlur" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="13" />
        </filter>

        <filter id="glow" x="-60%" y="-260%" width="220%" height="620%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse
        cx="372"
        cy="212"
        rx="296"
        ry="118"
        fill="url(#carShadow)"
        filter="url(#softBlur)"
      />

      {/* tyres — drawn first so only the proud edge shows above the body */}
      <g fill="url(#tyre)">
        <rect x="142" y="32" width="104" height="54" rx="20" />
        <rect x="142" y="274" width="104" height="54" rx="20" />
        <rect x="502" y="40" width="96" height="54" rx="19" />
        <rect x="502" y="266" width="96" height="54" rx="19" />
      </g>
      <g fill="#0e1013" opacity="0.85">
        <rect x="152" y="41" width="84" height="36" rx="15" />
        <rect x="152" y="283" width="84" height="36" rx="15" />
        <rect x="512" y="49" width="76" height="36" rx="14" />
        <rect x="512" y="275" width="76" height="36" rx="14" />
      </g>
      <g stroke="#7b8590" strokeOpacity="0.22" strokeWidth="2" fill="none">
        <path d="M158 45 h72" />
        <path d="M158 315 h72" />
        <path d="M518 53 h64" />
        <path d="M518 307 h64" />
      </g>

      {/* side mirrors */}
      <g fill="#23272e">
        <ellipse cx="452" cy="56" rx="22" ry="7" transform="rotate(-14 452 56)" />
        <ellipse cx="452" cy="304" rx="22" ry="7" transform="rotate(14 452 304)" />
      </g>

      {/* body */}
      <path d={BODY_PATH} fill="url(#paint)" />

      {/* body gloss, clipped to the shell */}
      <g clipPath="url(#bodyClip)">
        <rect
          x="0"
          y="0"
          width="736"
          height="360"
          fill="url(#carShadow)"
          opacity="0.28"
        />
        <rect x="0" y="34" width="736" height="26" fill="#fff" opacity="0.07" />
        <rect x="0" y="300" width="736" height="26" fill="#fff" opacity="0.05" />
      </g>

      {/* engine deck louvres */}
      <g
        fill="none"
        stroke="#08090b"
        strokeOpacity="0.75"
        strokeWidth="6"
        strokeLinecap="round"
      >
        {SLATS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* canopy */}
      <path d={CANOPY_PATH} fill="url(#canopy)" />
      <path
        d="M306 152 C344 145 392 144 432 150"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.16"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M470 180 C470 158 458 146 438 141 C400 133 340 132 292 136"
        fill="none"
        stroke="#8fb6d6"
        strokeOpacity="0.28"
        strokeWidth="2"
      />

      {/* racing stripe over the shell */}
      <path
        d="M56 175 L676 171 L684 180 L676 189 L56 185 Z"
        fill="#def54f"
        opacity="0.92"
      />
      <path d="M56 175 L676 171 L684 180 L676 189 L56 185 Z" fill="#fff" opacity="0.14" />

      {/* front fender vents */}
      <g fill="#08090b" opacity="0.85">
        <path d="M556 68 L614 108 L601 121 L543 83 Z" />
        <path d="M556 292 L614 252 L601 239 L543 277 Z" />
      </g>

      {/* headlights */}
      <g>
        <ellipse cx="606" cy="150" rx="31" ry="9" transform="rotate(38 606 150)" fill="#bfe9ff" opacity="0.5" filter="url(#glow)" />
        <ellipse cx="606" cy="210" rx="31" ry="9" transform="rotate(-38 606 210)" fill="#bfe9ff" opacity="0.5" filter="url(#glow)" />
        <ellipse cx="606" cy="150" rx="27" ry="7" transform="rotate(38 606 150)" fill="url(#headlamp)" />
        <ellipse cx="606" cy="210" rx="27" ry="7" transform="rotate(-38 606 210)" fill="url(#headlamp)" />
      </g>

      {/* tail light bar */}
      <g>
        <path
          d="M50 88 L70 93 C61 140 61 220 70 267 L50 272 C41 220 41 140 50 88 Z"
          fill="#ff3b30"
          opacity="0.5"
          filter="url(#glow)"
        />
        <path
          d="M50 88 L70 93 C61 140 61 220 70 267 L50 272 C41 220 41 140 50 88 Z"
          fill="#ff4b3f"
        />
      </g>

      {/* rear diffuser */}
      <g fill="#08090b" opacity="0.8">
        <rect x="52" y="126" width="10" height="108" rx="5" />
        <rect x="52" y="146" width="10" height="68" rx="5" />
      </g>
    </svg>
  );
}
