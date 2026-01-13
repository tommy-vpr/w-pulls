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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {product.title}
              </h1>
              <Badge variant={product.isActive ? "success" : "secondary"}>
                {product.isActive ? "Active" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Slug:{" "}
              <code className="rounded bg-muted px-1">{product.slug}</code>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              {product.imageUrl ? (
                <div className="relative aspect-video w-full flex justify-center items-center overflow-hidden rounded-lg bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-[90%] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed bg-muted/50">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No image uploaded
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {product.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatPrice(product.price)}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
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
              </div>
              <p className="text-sm text-muted-foreground">units in stock</p>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </p>
                <p className="mt-1">
                  {product.category ? (
                    <Badge variant="secondary">
                      {categoryLabels[product.category] || product.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  SKU
                </p>
                <p className="mt-1 font-mono text-sm">
                  {product.sku || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Created
                </p>
                <p className="mt-1 text-sm">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="mt-1 text-sm">{formatDate(product.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product ID */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Product ID
              </p>
              <p className="mt-1 font-mono text-xs break-all">{product.id}</p>
            </CardContent>
          </Card>

          {/* Audit */}
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Badge variant="outline">{audit.action}</Badge>
                    {audit.field && (
                      <span className="text-muted-foreground">
                        {audit.field}: {audit.oldValue} → {audit.newValue}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(audit.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
