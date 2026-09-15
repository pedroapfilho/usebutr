import { ImageResponse } from "next/og";

import { brandPaths } from "@/lib/brand-paths";

const size = { height: 180, width: 180 };
const contentType = "image/png";
const PAPER = "#ffffff";
const Icon = () =>
  new ImageResponse(
    <svg height={180} viewBox="0 0 180 180" width={180}>
      <rect fill={PAPER} height={180} width={180} />
      <g transform="translate(17.22 10) scale(0.63)">{brandPaths()}</g>
    </svg>,
    size,
  );
export { contentType, size };
export default Icon;
