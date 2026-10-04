import { useId } from "react";

/** Ink separation from the existing artwork; no replacement image or hand-traced geometry.
 * Its teal/G become ink; cream and amber become negative space, retaining all three tips. */
export function BrandSilhouette() {
  const id = useId().replaceAll(":", "");
  const filter = `${id}-brand-ink`;
  const mask = `${id}-brand-mask`;
  return (
    <g className="scene-brand" aria-hidden="true">
      <defs>
        <filter
          id={filter}
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -4 0 0 0 2"
          />
        </filter>
        <mask
          id={mask}
          maskUnits="userSpaceOnUse"
          x="250"
          y="250"
          width="100"
          height="100"
          style={{ maskType: "alpha" }}
        >
          <image
            href="/gripsky-brand-mark-v1.png"
            x="250"
            y="250"
            width="100"
            height="100"
            filter={`url(#${filter})`}
          />
        </mask>
      </defs>
      <rect x="250" y="250" width="100" height="100" mask={`url(#${mask})`} />
    </g>
  );
}
