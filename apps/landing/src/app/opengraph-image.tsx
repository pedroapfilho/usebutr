import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

const logo = await readFile(join(process.cwd(), "public/butr-logo-light.svg"), "base64");
const alt = "butr: multi-chain wallet management for React";
const size = { height: 630, width: 1200 };
const contentType = "image/png";

const Image = () =>
  new ImageResponse(
    <div
      style={{
        background: "white",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      {/* oxlint-disable-next-line next/no-img-element -- ImageResponse requires a native img with embedded SVG */}
      <img alt="butr" height={100} src={`data:image/svg+xml;base64,${logo}`} width={400} />
      <div style={{ background: "#fdd754", height: 6, marginTop: 40, width: 96 }} />
      <div style={{ fontSize: 52, lineHeight: 1.15, marginTop: 36 }}>
        Multi-chain wallet management for React
      </div>
      <div style={{ color: "#525252", fontSize: 28, marginTop: 28 }}>
        EVM · Solana · Sui · Bitcoin · Polkadot
      </div>
    </div>,
    size,
  );

export { alt, contentType, size };
export default Image;
