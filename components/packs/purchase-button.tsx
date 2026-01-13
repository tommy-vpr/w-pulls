"use client";

import { Loader2 } from "lucide-react";
import "./purchase-button.css";

interface PurchaseButtonProps {
  onClick: () => void;
  loading?: boolean;
  accentColor?: string;
}

export function PurchaseButton({
  onClick,
  loading,
  accentColor = "#37FF8B",
}: PurchaseButtonProps) {
  return (
    <button
      className="neon-button"
      onClick={onClick}
      disabled={loading}
      style={{ "--neon-color": accentColor } as React.CSSProperties}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Purchase"
      )}
    </button>
  );
}
