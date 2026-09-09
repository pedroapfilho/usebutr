import { readFile } from "node:fs/promises";
import { join } from "node:path";

const logo = await readFile(join(process.cwd(), "public/butr-logo-light.svg"), "base64");

const OgCard = ({ description, title }: { description?: string; title: string }) => (
  <div
    style={{
      background: "white",
      color: "#171717",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "64px 72px",
      width: "100%",
    }}
  >
    {/* oxlint-disable-next-line next/no-img-element -- ImageResponse requires a native img with embedded SVG */}
    <img alt="butr" height={72} src={`data:image/svg+xml;base64,${logo}`} width={288} />
    <div style={{ background: "#fdd754", height: 6, marginTop: 32, width: 96 }} />
    <div style={{ fontSize: 52, lineHeight: 1.15, marginTop: 32 }}>{title}</div>
    <div style={{ color: "#525252", fontSize: 26, lineHeight: 1.35, marginTop: 24 }}>
      {description}
    </div>
    <div style={{ color: "#525252", fontSize: 22, marginTop: "auto" }}>docs.usebutr.com</div>
  </div>
);

export { OgCard };
