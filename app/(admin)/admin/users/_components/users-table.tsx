// app/admin/users/_components/users-table.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { SerializedUser } from "@/lib/services/user.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  Eye,
  Wallet,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";

interface UsersTableProps {
  users: SerializedUser[];
  total: number;
  page: number;
  totalPages: number;
  currentSearch: string;
  currentRole: string;
  currentSortBy: string;
  currentSortOrder: string;
}

export function UsersTable({
  users,
  total,
  page,
  totalPages,
  currentSearch,
  currentRole,
  currentSortBy,
  currentSortOrder,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "ALL" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!updates.page) {
        params.delete("page");
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search });
  };

  const handleSort = (field: string) => {
    const newOrder =
      currentSortBy === field && currentSortOrder === "asc" ? "desc" : "asc";
    updateParams({ sortBy: field, sortOrder: newOrder });
  };

  const SortHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <TableHead className="text-zinc-400">
      <button
        onClick={() => handleSort(field)}
        className="cursor-pointer flex items-center gap-1 hover:text-zinc-100 transition-colors"
      >
        {children}
        <ArrowUpDown className="h-3 w-3" />
        {currentSortBy === field && (
          <span className="text-xs text-zinc-300">
            {currentSortOrder === "asc" ? "↑" : "↓"}
          </span>
        )}
      </button>
    </TableHead>
  );

  if (users.length === 0 && !currentSearch && currentRole === "ALL") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Users className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100">No users found</h3>
        <p className="text-zinc-500 mt-1">
          Users will appear here once they register.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-zinc-700"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </form>

        <Select
          value={currentRole}
          onValueChange={(value) => updateParams({ role: value })}
        >
          <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem
              value="ALL"
              className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
            >
              All Roles
            </SelectItem>
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

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Wallet</TableHead>
              <TableHead className="text-zinc-400">Orders</TableHead>
              <TableHead className="text-zinc-400">Stripe</TableHead>
              <SortHeader field="createdAt">Joined</SortHeader>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-zinc-500"
                >
                  No users match your filters
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Name / Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
                          <Image
                            src={user.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-zinc-500" />
                        </div>
                      )}
                      <span className="font-medium text-zinc-100 truncate max-w-[160px]">
                        {user.name || <span className="text-zinc-500">—</span>}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-sm text-zinc-400 truncate max-w-[200px] block">
                      {user.email}
                    </span>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-violet-900/30 text-violet-400 border-violet-700/50">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                        User
                      </span>
                    )}
                  </TableCell>

                  {/* Wallet */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-zinc-100">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Orders */}
                  <TableCell>
                    <span className="text-sm text-zinc-300">
                      {user.orderCount}
                    </span>
                  </TableCell>

                  {/* Stripe */}
                  <TableCell>
                    {user.stripeConnected ? (
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-700/50">
                        Connected
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </TableCell>

                  {/* Joined */}
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <button className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of{" "}
            {total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1 || isPending}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-zinc-500 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= totalPages || isPending}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
