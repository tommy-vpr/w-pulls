// components/reveal/BuybackModal.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productTitle: string;
  productImageUrl?: string | null;
  productValue: number; // in cents
  buybackAmount: number; // in cents
  buybackRate: number; // 0.0 - 1.0
  expiresInSeconds: number;
  accentColor?: string;
}

export function BuybackModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  productImageUrl,
  productValue,
  buybackAmount,
  buybackRate,
  expiresInSeconds,
  accentColor = "#10b981",
}: BuybackModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(expiresInSeconds);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirm = useCallback(async () => {
    if (isProcessing || isSuccess || timeRemaining <= 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onConfirm();
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Buyback failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isSuccess, timeRemaining, onConfirm]);

  if (!isOpen) return null;

  const isExpired = timeRemaining <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            {isSuccess ? "Added to Wallet!" : "Sell Back Card"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            // Success state
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <CheckCircle
                  className="w-8 h-8"
                  style={{ color: accentColor }}
                />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                ${(buybackAmount / 100).toFixed(2)} Added!
              </h3>
              <p className="text-zinc-400">
                The funds have been added to your wallet. You can withdraw them
                anytime from your Wallet page.
              </p>
            </div>
          ) : isExpired ? (
            // Expired state
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                Quote Expired
              </h3>
              <p className="text-zinc-400">
                This buyback offer has expired. Close this modal and request a
                new quote.
              </p>
            </div>
          ) : (
            // Normal state
            <>
              {/* Timer */}
              <div
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-4 rounded-lg mb-4",
                  timeRemaining <= 60
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400",
                )}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">
                  Quote expires in {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Card preview */}
              {productImageUrl && (
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-32 rounded-lg overflow-hidden border border-zinc-700">
                    <img
                      src={productImageUrl}
                      alt={productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Card info */}
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
                <p className="text-sm text-zinc-400 mb-1">Selling</p>
                <p className="text-lg font-semibold text-zinc-100 truncate">
                  {productTitle}
                </p>
              </div>

              {/* Value breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Card Value</span>
                  <span className="text-zinc-100">
                    ${(productValue / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    Buyback Rate ({Math.round(buybackRate * 100)}%)
                  </span>
                  <span className="text-zinc-400">
                    −${(((1 - buybackRate) * productValue) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-zinc-700 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Wallet Credit
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: accentColor }}
                    >
                      ${(buybackAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg mb-6 border border-zinc-700/50">
                <Wallet className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-400">
                  Funds will be instantly credited to your wallet. You can
                  withdraw to your bank account anytime from the Wallet page.
                </p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg mb-6 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/80">
                  This action cannot be undone. The card will be returned to
                  inventory.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/10 rounded-lg mb-4 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && !isExpired && (
          <div className="flex gap-3 p-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded cursor-pointer bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Keep Card
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing || isExpired}
              className="flex-1 px-4 py-3 rounded cursor-pointer font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: accentColor,
                color: "white",
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Get ${(buybackAmount / 100).toFixed(2)}
                </>
              )}
            </button>
          </div>
        )}

        {(isSuccess || isExpired) && (
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
            >
              {isSuccess ? "Done" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
