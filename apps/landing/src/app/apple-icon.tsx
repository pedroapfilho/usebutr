import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

const icon = await readFile(join(process.cwd(), "src/app/icon.svg"), "base64");
const size = { height: 180, width: 180 };
const contentType = "image/png";

const Icon = () =>
  new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {/* oxlint-disable-next-line next/no-img-element -- ImageResponse requires a native img with embedded SVG */}
      <img alt="butr" height={160} src={`data:image/svg+xml;base64,${icon}`} width={160} />
    </div>,
    size,
  );

export { contentType, size };
export default Icon;
