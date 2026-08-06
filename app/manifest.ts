import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GripSky — Open worldview and skill systems",
    short_name: "GripSky",
    description:
      "Open worldview, public skill systems, self-hosting and managed stewardship.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe4",
    theme_color: "#073844",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/gripsky-brand-mark-v1.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
