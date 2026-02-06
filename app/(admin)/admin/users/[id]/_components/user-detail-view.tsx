// app/admin/users/[id]/_components/user-detail-view.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { SerializedUserDetail } from "@/lib/services/user.service";
import { updateUserRole } from "@/lib/actions/admin-user.actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Package,
  CreditCard,
  ArrowDownUp,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailViewProps {
  user: SerializedUserDetail;
}

// ─── Status configs ──────────────────────────────────────────

const orderStatusConfig: Record<
  string,
  { label: string; className: string; icon: any }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-900/30 text-amber-400 border-amber-700/50",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
  },
  PROCESSING: {
    label: "Processing",
    icon: Clock,
    className: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-900/30 text-red-400 border-red-700/50",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  ABANDONED: {
    label: "Abandoned",
    icon: XCircle,
    className: "bg-zinc-800 text-zinc-500 border-zinc-700",
  },
};

const withdrawalStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-900/30 text-amber-400 border-amber-700/50",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-900/30 text-red-400 border-red-700/50",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

export function UserDetailView({ user }: UserDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "orders" | "wallet" | "withdrawals"
  >("orders");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<"USER" | "ADMIN" | null>(null);

  const handleRoleSelect = (role: string) => {
    if (role === user.role) return;
    setPendingRole(role as "USER" | "ADMIN");
    setRoleDialogOpen(true);
  };

  const handleRoleConfirm = () => {
    if (!pendingRole) return;
    startTransition(async () => {
      const result = await updateUserRole(user.id, pendingRole);
      if (result.success) {
        toast.success(`Role updated to ${pendingRole}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role");
      }
      setRoleDialogOpen(false);
      setPendingRole(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <button className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            {user.image ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-zinc-700">
                <Image src={user.image} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-zinc-500" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">
                  {user.name || "Unnamed User"}
                </h1>
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-violet-900/30 text-violet-400 border-violet-700/50">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                    User
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Role:</span>
          <Select
            value={user.role}
            onValueChange={handleRoleSelect}
            disabled={isPending}
          >
            <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem
                value="USER"
                className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
              >
                User
              </SelectItem>
              <SelectItem
                value="ADMIN"
                className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
              >
                Admin
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            ${user.walletBalance.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Package className="h-4 w-4" />
            Total Orders
          </div>
          <p className="text-2xl font-bold text-zinc-100">{user.orderCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <CreditCard className="h-4 w-4" />
            Total Spent
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            ${user.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <ArrowDownUp className="h-4 w-4" />
            Withdrawals
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            {user.withdrawalCount}
          </p>
        </div>
      </div>

      {/* Account Details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">
            Account Details
          </h2>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="text-zinc-500">User ID</dt>
              <dd className="font-mono text-xs text-zinc-300 mt-0.5">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email Verified</dt>
              <dd className="mt-0.5">
                {user.emailVerified ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {new Date(user.emailVerified).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <XCircle className="h-3.5 w-3.5" />
                    Not verified
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Joined</dt>
              <dd className="text-zinc-300 mt-0.5">
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Last Updated</dt>
              <dd className="text-zinc-300 mt-0.5">
                {new Date(user.updatedAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Stripe Connect</dt>
              <dd className="mt-0.5">
                {user.stripeConnected ? (
                  <div>
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-700/50">
                      Connected
                    </span>
                    <p className="text-xs font-mono text-zinc-500 mt-1">
                      {user.stripeConnectedAccountId}
                    </p>
                  </div>
                ) : (
                  <span className="text-zinc-500">Not connected</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Wallet Transactions</dt>
              <dd className="text-zinc-300 mt-0.5">{user.transactionCount}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-4">
          {(["orders", "wallet", "withdrawals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-zinc-100 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              {tab === "orders" && `Orders (${user.orders.length})`}
              {tab === "wallet" &&
                `Transactions (${user.recentTransactions.length})`}
              {tab === "withdrawals" &&
                `Withdrawals (${user.withdrawals.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <OrdersTab orders={user.orders} />}
      {activeTab === "wallet" && (
        <TransactionsTab transactions={user.recentTransactions} />
      )}
      {activeTab === "withdrawals" && (
        <WithdrawalsTab withdrawals={user.withdrawals} />
      )}

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              Change User Role
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to change this user&apos;s role to{" "}
              <span className="font-semibold text-zinc-200">{pendingRole}</span>
              ?
              {pendingRole === "ADMIN" && " This will grant full admin access."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleConfirm}
              disabled={isPending}
              className={cn(
                pendingRole === "ADMIN"
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-white text-zinc-900 hover:bg-zinc-200",
              )}
            >
              {isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────────────

function OrdersTab({ orders }: { orders: SerializedUserDetail["orders"] }) {
  if (orders.length === 0) return <EmptyState message="No orders yet" />;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Order #</TableHead>
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400">Pack</TableHead>
            <TableHead className="text-zinc-400">Items</TableHead>
            <TableHead className="text-zinc-400">Amount</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status =
              orderStatusConfig[order.status] || orderStatusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <TableRow
                key={order.id}
                className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <TableCell className="font-medium text-zinc-100">
                  #{order.orderNumber}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                    {order.type}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">
                  {order.packName || "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {order.itemCount}
                </TableCell>
                <TableCell className="font-medium text-zinc-100">
                  ${order.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                      status.className,
                    )}
                  >
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {formatDistanceToNow(new Date(order.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`}>
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Transactions Tab ────────────────────────────────────────

function TransactionsTab({
  transactions,
}: {
  transactions: SerializedUserDetail["recentTransactions"];
}) {
  if (transactions.length === 0)
    return <EmptyState message="No wallet transactions" />;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400">Amount</TableHead>
            <TableHead className="text-zinc-400">Reason</TableHead>
            <TableHead className="text-zinc-400">Balance After</TableHead>
            <TableHead className="text-zinc-400">Notes</TableHead>
            <TableHead className="text-zinc-400">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
            >
              <TableCell>
                {tx.type === "CREDIT" ? (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-700/50">
                    Credit
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-red-900/30 text-red-400 border-red-700/50">
                    Debit
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    tx.type === "CREDIT" ? "text-emerald-400" : "text-red-400",
                  )}
                >
                  {tx.type === "CREDIT" ? "+" : "−"}${tx.amount.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                  {tx.reason.replace(/_/g, " ")}
                </span>
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                ${tx.balanceAfter.toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-zinc-500 max-w-[200px] truncate">
                {tx.notes || "—"}
              </TableCell>
              <TableCell className="text-sm text-zinc-500">
                {formatDistanceToNow(new Date(tx.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Withdrawals Tab ─────────────────────────────────────────

function WithdrawalsTab({
  withdrawals,
}: {
  withdrawals: SerializedUserDetail["withdrawals"];
}) {
  if (withdrawals.length === 0) return <EmptyState message="No withdrawals" />;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Amount</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Stripe Transfer</TableHead>
            <TableHead className="text-zinc-400">Processed</TableHead>
            <TableHead className="text-zinc-400">Failure Reason</TableHead>
            <TableHead className="text-zinc-400">Requested</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((w) => {
            const status =
              withdrawalStatusConfig[w.status] ||
              withdrawalStatusConfig.PENDING;

            return (
              <TableRow
                key={w.id}
                className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <TableCell className="font-medium text-zinc-100">
                  ${w.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono text-zinc-500">
                  {w.stripeTransferId || "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {w.processedAt
                    ? new Date(w.processedAt).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell>
                  {w.failureReason ? (
                    <span className="flex items-center gap-1 text-sm text-red-400 max-w-[200px] truncate">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      {w.failureReason}
                    </span>
                  ) : (
                    <span className="text-sm text-zinc-600">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {formatDistanceToNow(new Date(w.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="rounded-full bg-zinc-800 p-4 mb-4">
        <Package className="h-8 w-8 text-zinc-500" />
      </div>
      <p className="text-zinc-500">{message}</p>
    </div>
  );
}
