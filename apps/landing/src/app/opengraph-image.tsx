import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { svgText } from "@repo/social-image";
import { ImageResponse } from "next/og";

const logo = await readFile(join(process.cwd(), "public/butr-logo-light.svg"), "base64");
const alt = "butr: multi-chain wallet management for React";
const size = { height: 630, width: 1200 };
const contentType = "image/png";
const COLORS = { accent: "#fdd754", ink: "#171717", muted: "#525252", paper: "#ffffff" };
const Image = () =>
  new ImageResponse(
    <svg height={630} viewBox="0 0 1200 630" width={1200}>
      <rect fill={COLORS.paper} height={630} width={1200} />
      <image height={100} href={`data:image/svg+xml;base64,${logo}`} width={400} x={72} y={153} />
      <rect fill={COLORS.accent} height={6} width={96} x={72} y={293} />
      {svgText("Multi-chain wallet management for React", {
        color: COLORS.ink,
        lineHeight: 1.15,
        size: 52,
        width: 1056,
        x: 72,
        y: 382,
      })}
      {svgText("EVM · Solana · Sui · Bitcoin · Polkadot", {
        color: COLORS.muted,
        size: 28,
        x: 72,
        y: 453,
      })}
    </svg>,
    size,
  );
export { alt, contentType, size };
export default Image;
