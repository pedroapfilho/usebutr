import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

type PairingState = {
  uri: string | null;
};

// Module-level store: `onPairingUri` is wired at adapter-creation time,
// outside the React tree, so the URI has to flow through shared state.
const pairingStore = createStore<PairingState>(() => ({ uri: null }));

const setPairingUri = (uri: string): void => {
  pairingStore.setState({ uri });
};

const clearPairingUri = (): void => {
  pairingStore.setState({ uri: null });
};

const usePairingUri = (): string | null => useStore(pairingStore, (state) => state.uri);

export { clearPairingUri, setPairingUri, usePairingUri };
