// app/(site)/wallet/(components)/WalletDashboard.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ChevronRight,
  CreditCard,
  Building,
  History,
  Landmark,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  balanceAfter: number;
  notes: string | null;
  createdAt: string;
  orderItem: {
    id: string;
    product: {
      id: string;
      title: string;
      imageUrl: string | null;
    };
  } | null;
  withdrawal: {
    id: string;
    status: string;
  } | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  stripeTransferId: string | null;
  processedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface WalletDashboardProps {
  balance: number;
  holdUntil: string | null;
  hasPayoutAccount: boolean;
  isOnboarded: boolean;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
}

// ============================================
// Balance Card
// ============================================

function BalanceCard({
  balance,
  holdUntil,
  onWithdraw,
  isRefreshing,
  onRefresh,
}: {
  balance: number;
  holdUntil: string | null;
  onWithdraw: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const hasHold = holdUntil && new Date(holdUntil) > new Date();

  // Calculate withdrawable amount (simplified - full logic in API)
  const withdrawableBalance = balance;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-200">
                Your Balance
              </h2>
              <p className="text-sm text-zinc-500">Available for withdrawal</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={cn(
                "w-5 h-5 text-zinc-400",
                isRefreshing && "animate-spin",
              )}
            />
          </button>
        </div>

        {/* Balance Amount */}
        <div className="mb-6">
          <div className="text-2xl text-gray-200 tracking-tight">
            ${(balance / 100).toFixed(2)}
          </div>
          {hasHold && (
            <div className="flex items-center gap-2 mt-2 text-sm text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Some funds on hold until they clear</span>
            </div>
          )}
        </div>

        {/* Withdraw Button */}
        <button
          onClick={onWithdraw}
          disabled={withdrawableBalance < 1000}
          className={cn(
            "cursor-pointer w-full py-3.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
            withdrawableBalance >= 1000
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
          )}
        >
          <ArrowUpFromLine className="w-5 h-5" />
          {withdrawableBalance >= 1000
            ? `Withdraw $${(withdrawableBalance / 100).toFixed(2)}`
            : balance > 0
              ? "Minimum $10 to withdraw"
              : "No funds to withdraw"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Payout Account Card
// ============================================

function PayoutAccountCard({
  hasPayoutAccount,
  isOnboarded,
  isConnecting,
  isDisconnecting,
  onConnect,
  onDisconnect,
}: {
  hasPayoutAccount: boolean;
  isOnboarded: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isOnboarded ? "bg-emerald-500/20" : "bg-violet-500/20",
          )}
        >
          {isOnboarded ? (
            <Building className="w-6 h-6 text-emerald-400" />
          ) : (
            <CreditCard className="w-6 h-6 text-violet-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-zinc-100">
            {isOnboarded
              ? "Payout Account Connected"
              : "Connect Payout Account"}
          </h3>
          <p className="text-sm text-zinc-500">
            {isOnboarded
              ? "Your bank account is ready to receive withdrawals"
              : "Required to withdraw funds to your bank"}
          </p>
        </div>

        {isOnboarded ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <button
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="cursor-pointer text-zinc-500 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
            >
              {isDisconnecting ? "..." : "Disconnect"}
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Connect</span>
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
// ============================================
// Transaction List Item
// ============================================

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.type === "CREDIT";

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      BUYBACK: "Card Sold Back",
      WITHDRAWAL: "Withdrawal",
      WITHDRAWAL_FAILED: "Withdrawal Refunded",
      ADJUSTMENT: "Adjustment",
      BONUS: "Bonus Credit",
      REFUND: "Refund",
    };
    return labels[reason] ?? reason;
  };

  return (
    <div className="flex items-center gap-4 py-4">
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isCredit ? "bg-emerald-500/20" : "bg-red-500/20",
        )}
      >
        {isCredit ? (
          <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
        ) : (
          <ArrowUpFromLine className="w-5 h-5 text-red-400" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-100">
          {getReasonLabel(transaction.reason)}
        </div>
        {transaction.orderItem && (
          <p className="text-sm text-zinc-500 truncate">
            {transaction.orderItem.product.title}
          </p>
        )}
        {transaction.notes && !transaction.orderItem && (
          <p className="text-sm text-zinc-500 truncate">{transaction.notes}</p>
        )}
        <p className="text-xs text-zinc-600 mt-0.5">
          {new Date(transaction.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div
          className={cn(
            "text-xs",
            isCredit ? "text-emerald-400" : "text-red-400",
          )}
        >
          {isCredit ? "+" : "-"}${(transaction.amount / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Withdrawal List Item
// ============================================

function WithdrawalItem({ withdrawal }: { withdrawal: Withdrawal }) {
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      PENDING: {
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending",
      },
      PROCESSING: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: <Clock className="w-3 h-3" />,
        label: "Processing",
      },
      PAID: {
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Paid",
      },
      FAILED: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <XCircle className="w-3 h-3" />,
        label: "Failed",
      },
      CANCELED: {
        color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
        icon: <XCircle className="w-3 h-3" />,
        label: "Canceled",
      },
    };
    return configs[status] ?? configs.PENDING;
  };

  const status = getStatusConfig(withdrawal.status);

  return (
    <div className="flex items-center gap-4 py-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
        <ArrowUpFromLine className="w-5 h-5 text-violet-400" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-100">Withdrawal</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
              status.color,
            )}
          >
            {status.icon}
            {status.label}
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-0.5">
          {new Date(withdrawal.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {withdrawal.failureReason && (
          <p className="text-xs text-red-400 mt-1">
            {withdrawal.failureReason}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-zinc-100">
          ${(withdrawal.amount / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Withdraw Modal
// ============================================

function WithdrawModal({
  isOpen,
  onClose,
  maxAmount,
  hasPayoutAccount,
  onSubmit,
  onConnectAccount,
}: {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: number;
  hasPayoutAccount: boolean;
  onSubmit: (amount: number) => Promise<void>;
  onConnectAccount: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const isValidAmount = amountCents >= 1000 && amountCents <= maxAmount;

  const handleSubmit = async () => {
    if (!isValidAmount || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onSubmit(amountCents);
      onClose();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMax = () => {
    setAmount((maxAmount / 100).toFixed(2));
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-1">
            Withdraw Funds
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            Transfer to your connected bank account
          </p>

          {!hasPayoutAccount ? (
            // Not connected state
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                Connect Your Bank Account
              </h3>
              <p className="text-sm text-zinc-400 mb-6">
                You need to connect a bank account through Stripe before you can
                withdraw funds.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onConnectAccount();
                }}
                className="cursor-pointer px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <span>Connect via Stripe</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Withdrawal form
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Amount to withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    step="0.01"
                    className="w-full pl-9 pr-20 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 text-2xl font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handleMax}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-zinc-500">Minimum: $10.00</span>
                  <span className="text-zinc-400">
                    Available:{" "}
                    <span className="text-emerald-400">
                      ${(maxAmount / 100).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Info notice */}
              <div className="mb-6 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                <p className="text-xs text-zinc-400">
                  Withdrawals are typically processed within 1-3 business days.
                  Funds will be transferred to your connected bank account via
                  Stripe.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="cursor-pointer flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValidAmount || isProcessing}
                  className="cursor-pointer flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-4 h-4" />
                      Withdraw
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Dashboard Component
// ============================================

export function WalletDashboard({
  balance: initialBalance,
  holdUntil,
  hasPayoutAccount: initialHasPayoutAccount,
  isOnboarded: initialIsOnboarded,
  transactions: initialTransactions,
  withdrawals: initialWithdrawals,
}: WalletDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // State
  const [balance, setBalance] = useState(initialBalance);
  const [hasPayoutAccount, setHasPayoutAccount] = useState(
    initialHasPayoutAccount,
  );
  const [isOnboarded, setIsOnboarded] = useState(initialIsOnboarded);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "withdrawals">(
    "activity",
  );

  // Handle Stripe Connect callback
  useEffect(() => {
    const connectParam = searchParams.get("connect");
    if (connectParam === "complete") {
      handleRefresh();
      router.replace("/dashboard/wallet");
    }
  }, [searchParams, router]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch wallet
      const walletRes = await fetch("/api/wallet");
      const walletData = await walletRes.json();
      if (walletData.success) {
        setBalance(walletData.wallet.balance);
        setHasPayoutAccount(walletData.wallet.hasPayoutAccount);
      }

      // Fetch transactions
      const txRes = await fetch("/api/wallet/transactions?limit=20");
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.transactions);
      }

      // Fetch withdrawals
      const wRes = await fetch("/api/withdrawals?limit=10");
      const wData = await wRes.json();
      if (wData.success) {
        setWithdrawals(wData.withdrawals);
      }

      // Check Connect status
      const connectRes = await fetch("/api/stripe/connect");
      const connectData = await connectRes.json();
      if (connectData.success) {
        setIsOnboarded(connectData.isOnboarded);
        setHasPayoutAccount(connectData.hasAccount);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Connect Stripe
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else if (data.alreadyOnboarded) {
        setIsOnboarded(true);
        setHasPayoutAccount(true);
      }
    } catch (error) {
      console.error("Connect failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect bank account
  const handleDisconnect = async () => {
    if (
      !confirm(
        "Disconnect your bank account? You'll need to reconnect to withdraw.",
      )
    )
      return;

    setIsDisconnecting(true);
    const res = await fetch("/api/stripe/connect", { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      setIsOnboarded(false);
      setHasPayoutAccount(false);
      handleRefresh();
    } else {
      alert(data.error || "Failed to disconnect");
    }
    setIsDisconnecting(false);
  };

  // Submit withdrawal
  const handleWithdraw = async (amount: number) => {
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Withdrawal failed");
    }

    // Update balance immediately
    setBalance(data.newBalance);

    // Refresh to get updated lists
    handleRefresh();
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Wallet</h1>
        <p className="text-zinc-500">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="mb-6">
        <BalanceCard
          balance={balance}
          holdUntil={holdUntil}
          onWithdraw={() => setShowWithdrawModal(true)}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Payout Account Card */}
      <div className="mb-8">
        <PayoutAccountCard
          hasPayoutAccount={hasPayoutAccount}
          isOnboarded={isOnboarded}
          isConnecting={isConnecting}
          isDisconnecting={isDisconnecting}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab("activity")}
          className={cn(
            "cursor-pointer flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === "activity"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <History className="w-4 h-4" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "cursor-pointer flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === "withdrawals"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Withdrawals
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {activeTab === "activity" ? (
          transactions.length > 0 ? (
            <div className="divide-y divide-zinc-800/50">
              {transactions.map((tx) => (
                <div key={tx.id} className="px-4">
                  <TransactionItem transaction={tx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Wallet className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No activity yet</p>
              <p className="text-sm text-zinc-600 mt-1">
                Sell back cards to earn wallet credits
              </p>
            </div>
          )
        ) : withdrawals.length > 0 ? (
          <div className="divide-y divide-zinc-800/50">
            {withdrawals.map((w) => (
              <div key={w.id} className="px-4">
                <WithdrawalItem withdrawal={w} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Landmark className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No withdrawals yet</p>
            <p className="text-sm text-zinc-600 mt-1">
              Request a withdrawal when you have $10+
            </p>
          </div>
        )}
      </div>

      {/* Back to Packs */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/packs")}
          className="cursor-pointer inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors group"
        >
          <span>Open more packs</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        maxAmount={balance}
        hasPayoutAccount={isOnboarded}
        onSubmit={handleWithdraw}
        onConnectAccount={handleConnect}
      />
    </>
  );
}
