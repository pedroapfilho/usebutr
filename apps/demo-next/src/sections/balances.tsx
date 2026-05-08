"use client";

import { useActiveConnectorId, useBalance, useSigner } from "butr";

const BalancesSection = () => {
  const activeId = useActiveConnectorId();
  const signer = useSigner();
  const balance = useBalance();

  return (
    <section style={{ borderBottom: "1px solid #ddd", padding: 16 }}>
      <h2>Balances &amp; Signer</h2>
      <p style={{ color: "#666", fontSize: 12 }}>
        Reads `useSigner()` and `useBalance()` for the active wallet ({activeId ?? "none"}). Both
        invalidate automatically on connectorId / address / chain changes.
      </p>
      <ul>
        <li>
          signer status: <strong>{signer.status}</strong>
        </li>
        <li>signer: {signer.status === "success" ? JSON.stringify(signer.data) : signer.status}</li>
        <li>
          balance status: <strong>{balance.status}</strong>
        </li>
        <li>
          balance:{" "}
          {balance.data ? `${balance.data.formatted} ${balance.data.symbol}` : balance.status}
        </li>
      </ul>
      <button onClick={() => balance.refetch()} type="button">
        Refetch balance
      </button>
    </section>
  );
};

export { BalancesSection };
