/**
 * PairingDialog: WalletConnect QR pairing overlay.
 *
 * Opens whenever a WalletConnect adapter emits a pairing URI
 * (`onPairingUri` → pairing store) and closes when the connect attempt
 * settles or the user dismisses it. Same native <dialog> pattern as
 * WalletConnectDialog: browser-native focus trap, Escape-to-close,
 * aria-modal semantics, top-layer stacking.
 */
import { useConnectingConnectorId } from "@usebutr/react";
import { useEffect, useRef, useState } from "react";
import { renderSVG } from "uqr";

import { clearPairingUri, usePairingUri } from "./pairing-store";

const PairingDialog = () => {
  const uri = usePairingUri();
  const connectingId = useConnectingConnectorId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const open = uri !== null;

  useEffect(() => {
    if (uri !== null && connectingId === null) {
      clearPairingUri();
    }
  }, [connectingId, uri]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // reset copy feedback for the next pairing attempt.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    const handleClose = () => {
      clearPairingUri();
      setCopied(false);
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      clearPairingUri();
    }
  };

  const handleCopy = async () => {
    if (uri === null) {
      return;
    }
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
    } catch (error) {
      console.error("[demo] failed to copy pairing URI:", error);
    }
  };

  const qrSrc =
    uri === null ? null : `data:image/svg+xml;utf8,${encodeURIComponent(renderSVG(uri))}`;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, react-doctor/no-noninteractive-element-interactions
    <dialog
      aria-label="WalletConnect pairing"
      aria-modal="true"
      className="m-auto w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      onClick={handleBackdropClick}
      ref={dialogRef}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <h2 className="font-semibold">Scan with your wallet</h2>
        <button
          aria-label="Close dialog"
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          onClick={clearPairingUri}
          type="button"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 p-5">
        {qrSrc ? (
          <img
            alt="WalletConnect pairing QR code"
            className="size-56 rounded-lg border border-neutral-100"
            height={224}
            src={qrSrc}
            width={224}
          />
        ) : null}
        <button
          className="min-h-[44px] rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          onClick={() => {
            void handleCopy();
          }}
          type="button"
        >
          {copied ? "Copied" : "Copy URI"}
        </button>
        <p aria-live="polite" className="text-center text-xs text-neutral-500">
          Scan the code with a WalletConnect-compatible mobile wallet, or copy the URI into a
          desktop wallet.
        </p>
      </div>
    </dialog>
  );
};

export { PairingDialog };
