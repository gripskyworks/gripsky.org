"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandSilhouette } from "./BrandSilhouette";
import { Locale, localPath } from "../lib/site-data";

const destinations = [
  "/worldview/source",
  "/worldview",
  "/about",
  "/skills",
  "/body",
];

/** Moving accents are separate from the fixed coordinates and real links. */
export function OrbitalScene({
  locale,
  nodes,
  label,
}: {
  locale: Locale;
  nodes: string[];
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure className="precision-scene" data-scene-tempo data-active={active ?? ""}>
      <figcaption>
        <span>G / FIELD — 01</span>
        <span>{label}</span>
        <i aria-hidden="true">+</i>
      </figcaption>
      <div className="scene-stage">
        <div className="precision-chart" aria-hidden="true">
          <svg viewBox="0 0 600 600" fill="none">
            <defs>
              <pattern
                id="atlas-hatching"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <path d="M0 0V6" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <circle className="scene-plane" cx="300" cy="300" r="176" />
            <circle
              className="scene-hatch"
              cx="300"
              cy="300"
              r="176"
              fill="url(#atlas-hatching)"
            />
            <path
              className="scene-axis"
              d="M300 0V600M0 300H600M65 535L535 65"
            />
            <path className="scene-rim" d="M74 410A252 252 0 0 1 410 74" />
            <path
              className="scene-arc"
              d="M50 540A352 352 0 0 1 545 30M22 568A394 394 0 0 1 580 4"
            />
            <circle className="scene-ring" cx="300" cy="300" r="212" />
            <circle className="scene-inner" cx="300" cy="300" r="176" />
            <g
              className="scene-longitudes"
              data-orbit-motion
              transform="rotate(-28 300 300)"
            >
              <ellipse cx="300" cy="300" rx="75" ry="176" />
              <ellipse cx="300" cy="300" rx="134" ry="176" />
              <ellipse cx="300" cy="300" rx="176" ry="66" />
              <ellipse cx="300" cy="300" rx="176" ry="128" />
              <path d="M124 300H476M300 124V476" />
            </g>
            <ellipse
              className="scene-orbit"
              cx="300"
              cy="300"
              rx="252"
              ry="110"
              transform="rotate(-28 300 300)"
            />
            <g className="scene-rotor scene-rotor-outer" data-orbit-motion>
              <circle cx="300" cy="300" r="212" strokeDasharray="130 1202" />
              <circle cx="300" cy="88" r="5" />
            </g>
            <g className="scene-rotor scene-rotor-inner" data-orbit-motion>
              <circle cx="300" cy="300" r="184" strokeDasharray="170 986" />
            </g>
            <circle
              className="scene-response"
              cx="300"
              cy="300"
              r="238"
              strokeDasharray="240 1256"
            />
            <g className="scene-ticks">
              {Array.from({ length: 72 }, (_, index) => (
                <path
                  key={index}
                  d={index % 6 === 0 ? "M300 66V83" : "M300 73V80"}
                  transform={`rotate(${index * 5} 300 300)`}
                />
              ))}
            </g>
            <g className="scene-coordinates">
              <text x="300" y="43" textAnchor="middle">
                0
              </text>
              <text x="560" y="305" textAnchor="middle">
                90
              </text>
              <text x="300" y="573" textAnchor="middle">
                180
              </text>
              <text x="37" y="305" textAnchor="middle">
                270
              </text>
            </g>
            <circle className="scene-core" cx="300" cy="300" r="45" />
            <BrandSilhouette />
            <circle
              className="scene-signal"
              cx="300"
              cy="300"
              r="6"
            />
          </svg>
        </div>
        <ol
          className="precision-nodes"
          aria-label={
            locale === "zh" ? "公开体系入口" : "Public system entry points"
          }
        >
          {nodes.map((node, index) => (
            <li
              className={`precision-node precision-node-${index + 1}`}
              key={node}
            >
              <Link
                href={localPath(locale, destinations[index])}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                <i aria-hidden="true" />
                <span>0{index + 1}</span>
                <b>{node}</b>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="scene-footnote">
        <span className="scene-footnote-index">
          {active === null ? "G" : `0${active + 1}`}
        </span>
        <p>
          {active === null
            ? locale === "zh"
              ? "一个开放的体系，五个可以进入的方向。"
              : "One open system. Five ways into it."
            : locale === "zh"
              ? [
                  "理解关系、边界与反馈。",
                  "判断有来源，修订有记录。",
                  "能力如何使用，仍由主体判断。",
                  "让理解成为可以复用的能力。",
                  "把可达范围延伸到身体之外。",
                ][active]
              : [
                  "Relations, boundaries and feedback.",
                  "Sourced judgments. Revisions on record.",
                  "Agency remains with the person.",
                  "Understanding made into reusable capability.",
                  "Reach beyond the physical body.",
                ][active]}
        </p>
        <span aria-hidden="true">↗</span>
      </div>
    </figure>
  );
}
