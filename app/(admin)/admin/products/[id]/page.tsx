import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  DollarSign,
  Layers,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { getProductByIdAction } from "@/app/actions/product.actions";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const result = await getProductByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  const audits = await prisma.productAudit.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const categoryLabels: Record<string, string> = {
    BASEBALL: "Baseball",
    BASKETBALL: "Basketball",
    FOOTBALL: "Football",
    HOCKEY: "Hockey",
    SOCCER: "Soccer",
    POKEMON: "Pokémon",
    YUGIOH: "Yu-Gi-Oh!",
    DRAGON_BALL: "Dragon Ball",
    MAGIC_THE_GATHERING: "Magic: The Gathering",
    ONE_PIECE: "One Piece",
    OTHER: "Other",
  };

  const actionConfig: Record<string, { bg: string; text: string }> = {
    CREATED: { bg: "bg-emerald-900/40", text: "text-emerald-400" },
    UPDATED: { bg: "bg-blue-900/40", text: "text-blue-400" },
    DELETED: { bg: "bg-red-900/40", text: "text-red-400" },
    INVENTORY_INCREASED: { bg: "bg-green-900/40", text: "text-green-400" },
    INVENTORY_DECREASED: { bg: "bg-orange-900/40", text: "text-orange-400" },
    PRICE_CHANGED: { bg: "bg-purple-900/40", text: "text-purple-400" },
    STATUS_CHANGED: { bg: "bg-yellow-900/40", text: "text-yellow-400" },
    TIER_CHANGED: { bg: "bg-pink-900/40", text: "text-pink-400" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                {product.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  product.isActive
                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}
              >
                {product.isActive ? "Active" : "Draft"}
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              Slug:{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                {product.slug}
              </code>
            </p>
          </div>
        </div>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit Product
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Product Image
              </h2>
            </div>
            <div className="p-6">
              {product.imageUrl ? (
                <div className="relative aspect-video w-full flex justify-center items-center overflow-hidden rounded-lg bg-zinc-800">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-[90%] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-zinc-600" />
                    <p className="mt-2 text-sm text-zinc-500">
                      No image uploaded
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Description
              </h2>
            </div>
            <div className="p-6">
              {product.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No description provided
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-zinc-400" />
                Pricing
              </h2>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-zinc-100">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-400" />
                Inventory
              </h2>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold">
                <span
                  className={
                    product.inventory <= 0
                      ? "text-red-400"
                      : product.inventory <= 10
                        ? "text-amber-400"
                        : "text-zinc-100"
                  }
                >
                  {product.inventory}
                </span>
              </div>
              <p className="text-sm text-zinc-500">units in stock</p>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Tag className="h-4 w-4 text-zinc-400" />
                Organization
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Category
                </p>
                <p className="mt-1">
                  {product.category ? (
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-700">
                      {categoryLabels[product.category] || product.category}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  SKU
                </p>
                <p className="mt-1 font-mono text-sm text-zinc-300">
                  {product.sku || <span className="text-zinc-600">—</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" />
                Timestamps
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Created
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {formatDate(product.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {formatDate(product.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Product ID */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Product ID
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-400 break-all">
              {product.id}
            </p>
          </div>

          {/* Audit */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Change History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {audits.length === 0 ? (
                  <p className="text-sm text-zinc-500">No changes recorded</p>
                ) : (
                  audits.map((audit) => {
                    const config = actionConfig[audit.action] || {
                      bg: "bg-zinc-800",
                      text: "text-zinc-400",
                    };
                    return (
                      <div
                        key={audit.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config.bg} ${config.text} border border-current/20`}
                        >
                          {audit.action}
                        </span>
                        {audit.field && (
                          <span className="text-zinc-500">
                            {audit.field}:{" "}
                            <span className="text-red-400/70">
                              {audit.oldValue}
                            </span>
                            <span className="text-zinc-600 mx-1">→</span>
                            <span className="text-emerald-400/70">
                              {audit.newValue}
                            </span>
                          </span>
                        )}
                        <span className="text-xs text-zinc-600 ml-auto">
                          {formatDistanceToNow(audit.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
