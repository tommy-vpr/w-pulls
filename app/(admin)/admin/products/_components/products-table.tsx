"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SerializedProduct } from "@/types/product";
import { ProductTier } from "@prisma/client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteProductAction,
  toggleProductStatusAction,
} from "@/app/actions/product.actions";
import {
  getTierBadgeClass,
  getTierConfig,
  TIER_CONFIG,
} from "@/lib/tier-config";

interface ProductsTableProps {
  products: SerializedProduct[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setActionId(id);
    startTransition(async () => {
      await deleteProductAction(id);
      router.refresh();
      setActionId(null);
    });
  };

  const handleToggleStatus = async (id: string) => {
    setActionId(id);
    startTransition(async () => {
      await toggleProductStatusAction(id);
      router.refresh();
      setActionId(null);
    });
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <div className="rounded-full bg-zinc-800 p-4">
          <Package className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-zinc-100">
          No products yet
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Create your first product to get started
        </p>
        <Button
          asChild
          className="mt-4 bg-white text-zinc-900 hover:bg-zinc-200"
        >
          <Link href="/admin/products/new">Create Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-[80px] text-zinc-400">Image</TableHead>
            <TableHead className="text-zinc-400">Product</TableHead>
            <TableHead className="text-zinc-400">Category</TableHead>
            <TableHead className="text-zinc-400">Tier</TableHead>
            <TableHead className="text-zinc-400">Price</TableHead>
            <TableHead className="text-zinc-400">Inventory</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400">Created</TableHead>
            <TableHead className="w-[120px] text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLoading = isPending && actionId === product.id;
            const tier = getTierConfig(product.tier);

            return (
              <TableRow
                key={product.id}
                className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <TableCell>
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-zinc-600" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-zinc-100 hover:text-white hover:underline transition-colors"
                    >
                      {product.title}
                    </Link>
                    {product.sku && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        SKU: {product.sku}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-700">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-medium border ${getTierBadgeClass(
                      product.tier,
                    )}`}
                  >
                    {tier.label}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-zinc-100">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      product.inventory <= 0
                        ? "text-red-400"
                        : product.inventory <= 10
                          ? "text-amber-400"
                          : "text-zinc-300"
                    }`}
                  >
                    {product.inventory}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.isActive
                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {product.isActive ? "Active" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {formatDate(product.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      disabled={isLoading}
                      className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(product.id)}
                      disabled={isLoading}
                      className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : product.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id, product.title)}
                      disabled={isLoading}
                      className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-950/50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
