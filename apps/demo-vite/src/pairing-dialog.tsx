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
    if (dialog === null) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return undefined;
    }
    const handleClose = () => {
      clearPairingUri();
      setCopied(false);
    };
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
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
      className="border-border-default m-auto w-full max-w-sm rounded-xl border bg-white p-0 shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      onClick={handleBackdropClick}
      ref={dialogRef}
    >
      <div className="border-border-faint flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Scan with your wallet</h2>
        <button
          aria-label="Close dialog"
          className="text-foreground-disabled hover:bg-surface-muted hover:text-foreground-secondary rounded p-1"
          onClick={clearPairingUri}
          type="button"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 p-5">
        {qrSrc !== null && qrSrc !== "" ? (
          <img
            alt="WalletConnect pairing QR code"
            className="border-border-faint size-56 rounded-lg border"
            height={224}
            src={qrSrc}
            width={224}
          />
        ) : null}
        <button
          className="border-border-strong hover:bg-surface-subtle min-h-11 rounded-md border px-3 py-1.5 text-sm"
          onClick={() => {
            void handleCopy();
          }}
          type="button"
        >
          {copied ? "Copied" : "Copy URI"}
        </button>
        <p aria-live="polite" className="text-foreground-muted text-center text-xs">
          Scan the code with a WalletConnect-compatible mobile wallet, or copy the URI into a
          desktop wallet.
        </p>
      </div>
    </dialog>
  );
};

export { PairingDialog };
