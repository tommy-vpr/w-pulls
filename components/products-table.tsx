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

interface ProductsTableProps {
  products: SerializedProduct[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const tierLabels: Record<string, string> = {
    COMMON: "Common",
    UNCOMMON: "Uncommon",
    RARE: "Rare",
    ULTRA_RARE: "Ultra Rare",
    SECRET_RARE: "Secret Rare",
    BANGER: "Banger 🔥",
    GRAIL: "Grail 👑",
  };

  const tierVariants: Record<
    string,
    "secondary" | "default" | "destructive" | "outline" | "success" | "warning"
  > = {
    COMMON: "secondary",
    UNCOMMON: "secondary",
    RARE: "default",
    ULTRA_RARE: "default",
    SECRET_RARE: "warning",
    BANGER: "destructive",
    GRAIL: "success",
  };

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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first product to get started
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/products/new">Create Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLoading = isPending && actionId === product.id;

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="secondary">{product.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tierVariants[product.tier] || "secondary"}
                    className="whitespace-nowrap"
                  >
                    {tierLabels[product.tier] || product.tier}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      product.inventory <= 0
                        ? "text-destructive"
                        : product.inventory <= 10
                        ? "text-amber-600"
                        : ""
                    }
                  >
                    {product.inventory}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Active" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(product.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      disabled={isLoading}
                    >
                      <Link href={`/dashboard/products/${product.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(product.id)}
                      disabled={isLoading}
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
                      className="text-destructive hover:text-destructive"
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
