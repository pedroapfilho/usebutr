import { createFileRoute } from "@tanstack/react-router";
import { ConnectionSection } from "../sections/connection";
import { InternalsSection } from "../sections/internals";
import { ModeSection } from "../sections/mode";
import { WalletsSection } from "../sections/wallets";

const Home = () => (
  <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
    <header style={{ padding: 16 }}>
      <h1>butr · TanStack Start</h1>
    </header>
    <ConnectionSection />
    <WalletsSection />
    <ModeSection />
    <InternalsSection />
  </main>
);

export const Route = createFileRoute("/")({ component: Home });
