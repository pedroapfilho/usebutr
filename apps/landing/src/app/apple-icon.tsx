import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

const icon = await readFile(join(process.cwd(), "src/app/icon.svg"), "base64");
const size = { height: 180, width: 180 };
const contentType = "image/png";
const PAPER = "#ffffff";
const Icon = () =>
  new ImageResponse(
    <svg height={180} viewBox="0 0 180 180" width={180}>
      <rect fill={PAPER} height={180} width={180} />
      <image height={160} href={`data:image/svg+xml;base64,${icon}`} width={160} x={10} y={10} />
    </svg>,
    size,
  );
export { contentType, size };
export default Icon;
