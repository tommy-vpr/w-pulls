"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductCategory, ProductTier } from "@prisma/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import {
  createProductAction,
  updateProductAction,
} from "@/app/actions/product.actions";
import { ActionResponse } from "@/types/product";
import Link from "next/link";
import { SerializedProduct } from "@/types/product";

interface ProductFormProps {
  product?: SerializedProduct | null;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl || null
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const tierLabels: Record<ProductTier, string> = {
    COMMON: "Common",
    UNCOMMON: "Uncommon",
    RARE: "Rare",
    ULTRA_RARE: "Ultra Rare",
    SECRET_RARE: "Secret Rare",
    BANGER: "Banger 🔥",
    GRAIL: "Grail 👑",
  };

  const tierColors: Record<ProductTier, string> = {
    COMMON: "text-gray-500",
    UNCOMMON: "text-green-600",
    RARE: "text-blue-600",
    ULTRA_RARE: "text-purple-600",
    SECRET_RARE: "text-yellow-600",
    BANGER: "text-orange-600",
    GRAIL: "text-pink-600",
  };

  // Add a mapping for display names
  const categoryLabels: Record<ProductCategory, string> = {
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

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setGlobalError(null);

    // Add image URL and isActive to form data
    if (imageUrl) {
      formData.set("imageUrl", imageUrl);
    }
    formData.set("isActive", String(isActive));

    if (mode === "edit" && product) {
      formData.set("id", product.id);
    }

    startTransition(async () => {
      const action =
        mode === "create" ? createProductAction : updateProductAction;
      const result: ActionResponse<SerializedProduct> = await action(formData);

      if (result.success) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.error) {
          setGlobalError(result.error);
        }
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "create" ? "Create Product" : "Edit Product"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Add a new product to your catalog"
                : `Editing: ${product?.title}`}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Create Product" : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      {globalError && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {globalError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core product details. The slug will be auto-generated from the
                title.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={product?.title || ""}
                  placeholder="Enter product title"
                  required
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title[0]}</p>
                )}
                {product?.slug && (
                  <p className="text-xs text-muted-foreground">
                    Current slug:{" "}
                    <code className="rounded bg-muted px-1">
                      {product.slug}
                    </code>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description || ""}
                  placeholder="Enter product description"
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                Upload a product image. Images are stored in Google Cloud
                Storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                disabled={isPending}
              />
              {errors.imageUrl && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.imageUrl[0]}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Product is visible in the store
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.price ? Number(product.price) : ""}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  defaultValue={product?.inventory || 0}
                  placeholder="0"
                />
                {errors.inventory && (
                  <p className="text-sm text-destructive">
                    {errors.inventory[0]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={product?.category || ""}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select category</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category[0]}
                  </p>
                )}
              </div>

              {/* Tier */}
              <div className="space-y-2">
                <Label htmlFor="tier">Tier *</Label>
                <select
                  id="tier"
                  name="tier"
                  defaultValue={product?.tier || "COMMON"}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(tierLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.tier && (
                  <p className="text-sm text-destructive">{errors.tier[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku || ""}
                  placeholder="e.g., PROD-001"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku[0]}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
