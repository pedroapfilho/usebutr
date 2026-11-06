export type {
  BitcoinSendTransferFeature,
  BitcoinSendTransferInput,
  BitcoinSendTransferOutput,
  BitcoinSignMessageFeature,
  BitcoinSignMessageInput,
  BitcoinSignMessageOutput,
  BitcoinSignPsbtFeature,
  BitcoinSignPsbtInput,
  BitcoinSignPsbtOutput,
} from "./wallet-standard-types";

export { buildBitcoinAdapter, discoverBitcoinAdapters } from "./wallet-standard-adapter";

export {
  GENERIC_BITCOIN_ICON,
  discoverInjectedBitcoinAdapter,
  discoverLegacyBitcoinAdapter,
} from "./injected";

import "./signer-augmentation";
