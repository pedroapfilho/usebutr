"use client";

import { ConnectionSection } from "../sections/connection";
import { InternalsSection } from "../sections/internals";
import { ModeSection } from "../sections/mode";
import { WalletsSection } from "../sections/wallets";

const Page = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · Next.js</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export default Page;
