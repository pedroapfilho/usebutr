import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { svgText } from "@repo/social-image";

const logo = await readFile(join(process.cwd(), "public/butr-logo-light.svg"), "base64");
const COLORS = { accent: "#fdd754", ink: "#171717", muted: "#525252", paper: "#ffffff" };
const OgCard = ({ description, title }: { description?: string; title: string }) => (
  <svg height={630} viewBox="0 0 1200 630" width={1200}>
    <rect fill={COLORS.paper} height={630} width={1200} />
    <image height={72} href={`data:image/svg+xml;base64,${logo}`} width={288} x={72} y={64} />
    <rect fill={COLORS.accent} height={6} width={96} x={72} y={168} />
    {svgText(title, { color: COLORS.ink, lineHeight: 1.15, size: 52, width: 1056, x: 72, y: 254 })}
    {svgText(description ?? "", {
      color: COLORS.muted,
      lineHeight: 1.35,
      size: 26,
      width: 1056,
      x: 72,
      y: 408,
    })}
    {svgText("docs.usebutr.com", { color: COLORS.muted, size: 22, x: 72, y: 560 })}
  </svg>
);
export { OgCard };
