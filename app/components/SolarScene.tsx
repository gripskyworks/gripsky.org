/** A planetary composition, not a second armillary sphere or live telemetry.
 * Motion is controlled by the shared visibility/input preference controller. */
export function SolarScene() {
  return (
    <div className="selfhost-visual solar-scene" data-scene-tempo aria-hidden="true">
      <svg viewBox="0 0 720 560" fill="none">
        <defs>
          <pattern
            id="solar-engraving"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            <path d="M0 0V5" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <clipPath id="solar-giant-clip">
            <circle cx="506" cy="397" r="88" />
          </clipPath>
          <clipPath id="solar-ivory-clip">
            <circle cx="412" cy="146" r="56" />
          </clipPath>
          <linearGradient
            id="solar-comet-fade"
            x1="636"
            y1="27"
            x2="552"
            y2="111"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".75" />
          </linearGradient>
        </defs>
        <g className="solar-reference">
          <path d="M275 12V545M10 260H698M23 456L654 34" />
          <path d="M22 22H42M32 12V32M662 506H682M672 496V516" />
        </g>
        <g className="solar-orbits" transform="rotate(-24 275 260)">
          <ellipse cx="275" cy="260" rx="78" ry="48" />
          <ellipse cx="275" cy="260" rx="152" ry="94" />
          <ellipse cx="275" cy="260" rx="231" ry="152" />
          <ellipse cx="306" cy="260" rx="313" ry="223" />
          <path d="M-10 27C273-100 732 50 681 356" />
        </g>
        <g className="solar-asteroids" transform="rotate(-24 275 260)">
          <ellipse
            cx="275"
            cy="260"
            rx="196"
            ry="125"
            strokeDasharray="1 13 2 16"
          />
          <ellipse cx="275" cy="260" rx="202" ry="130" strokeDasharray="1 21" />
        </g>
        <g className="solar-small-planet">
          <circle cx="136" cy="174" r="28" className="solar-planet-fill" />
          <circle cx="136" cy="174" r="28" fill="url(#solar-engraving)" />
          <path
            className="solar-planet-line"
            d="M124 149A28 28 0 0 0 147 199"
          />
        </g>
        <circle className="solar-dark-moon" cx="255" cy="80" r="12" />
        <g className="solar-ringed-planet">
          <ellipse
            className="solar-saturn-ring"
            cx="412"
            cy="146"
            rx="92"
            ry="23"
            transform="rotate(-24 412 146)"
          />
          <circle className="solar-ivory" cx="412" cy="146" r="56" />
          <g className="solar-ivory-bands" clipPath="url(#solar-ivory-clip)">
            <path d="M348 116Q399 162 471 140M346 128Q399 174 471 152M346 142Q399 186 471 163" />
            <path d="M352 94Q389 109 414 93" />
          </g>
          <path
            className="solar-saturn-front"
            d="M328 179C349 188 443 157 492 109"
          />
        </g>
        <g className="solar-sun">
          <circle cx="275" cy="260" r="27" />
          <circle cx="275" cy="260" r="18" />
          <circle className="solar-sun-core" cx="275" cy="260" r="9" />
          <path d="M275 222V216M275 298V304M237 260H231M313 260H319" />
        </g>
        <g className="solar-orbiter" data-orbit-motion>
          <circle cx="220" cy="294" r="6" />
        </g>
        <g className="solar-giant">
          <circle className="solar-planet-fill" cx="506" cy="397" r="88" />
          <circle
            className="solar-giant-hatch"
            cx="506"
            cy="397"
            r="88"
            fill="url(#solar-engraving)"
          />
          <g className="solar-planet-line" clipPath="url(#solar-giant-clip)">
            <path d="M406 367Q506 338 605 379M406 383Q506 354 605 395M406 411Q506 382 605 423M406 426Q506 397 605 438M406 442Q506 413 605 454" />
            <ellipse
              cx="525"
              cy="356"
              rx="16"
              ry="7"
              transform="rotate(9 525 356)"
            />
          </g>
          <path className="solar-giant-limb" d="M461 322A88 88 0 0 1 580 444" />
        </g>
        <circle className="solar-ivory solar-moon" cx="623" cy="265" r="19" />
        <g className="solar-low-planet">
          <circle className="solar-planet-fill" cx="127" cy="444" r="41" />
          <path
            className="solar-planet-line"
            d="M105 410Q144 440 106 479M117 405Q156 438 118 485"
          />
          <circle className="solar-dark-moon" cx="65" cy="403" r="8" />
        </g>
        <g className="solar-comet" data-orbit-motion>
          <path
            className="solar-comet-tail"
            d="M643 20L550 114M626 24L549 108M646 38L558 113"
          />
          <circle cx="552" cy="111" r="4" />
        </g>
        <g className="solar-coordinate-labels">
          <text x="38" y="41">
            G / FIELD — 02
          </text>
          <text x="422" y="530">
            ORBITS / EXTERNAL REACH
          </text>
        </g>
      </svg>
    </div>
  );
}
