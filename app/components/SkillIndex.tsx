"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "../lib/site-data";

type Family = "meta" | "embodied" | "field";
type Entry = {
  code: string;
  name: string;
  summary: string;
  kind: string;
  status: string;
  href: string;
  family: Family;
};

/** All entries are available in SSR; filtering is an optional client-side convenience. */
export function SkillIndex({
  entries,
  locale,
}: {
  entries: Entry[];
  locale: Locale;
}) {
  const [filter, setFilter] = useState<Family | "all">("all");
  const zh = locale === "zh";
  const visible = entries.filter(
    (entry) => filter === "all" || entry.family === filter,
  );
  const filters: { id: Family | "all"; label: string }[] = [
    { id: "all", label: zh ? "全部" : "All" },
    { id: "meta", label: zh ? "母体与元技能" : "Grammar & meta" },
    { id: "embodied", label: zh ? "生理技能" : "Embodied" },
    { id: "field", label: zh ? "领域技能" : "Field" },
  ];
  return (
    <div className="atlas-index">
      <div
        className="atlas-filters"
        role="group"
        aria-label={zh ? "按技能类别筛选" : "Filter skills by category"}
      >
        {filters.map((item) => (
          <button
            type="button"
            aria-pressed={filter === item.id}
            aria-controls="home-skill-results"
            onClick={() => setFilter(item.id)}
            key={item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="atlas-index-meta">
        <span>{zh ? "定义与开放状态" : "DEFINITIONS & AVAILABILITY"}</span>
        <span aria-live="polite" aria-atomic="true">
          {String(visible.length).padStart(2, "0")} {zh ? "项" : "entries"}
        </span>
      </div>
      <div id="home-skill-results">
        {visible.map((entry) => (
          <Link className="atlas-skill" href={entry.href} key={entry.code}>
            <span className="atlas-skill-code">{entry.code}</span>
            <div className="atlas-skill-main">
              <small>{entry.kind}</small>
              <h3>{entry.name}</h3>
              <p>{entry.summary}</p>
              <span className="atlas-skill-status">{entry.status}</span>
            </div>
            <span className="atlas-skill-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
