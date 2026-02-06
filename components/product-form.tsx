"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProductCategory, ProductTier } from "@prisma/client";
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
    product?.imageUrl || null,
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
    BANGER: "Banger",
    GRAIL: "Grail",
  };

  const tierColors: Record<ProductTier, string> = {
    COMMON: "text-zinc-400",
    UNCOMMON: "text-green-400",
    RARE: "text-blue-400",
    ULTRA_RARE: "text-purple-400",
    SECRET_RARE: "text-yellow-400",
    BANGER: "text-orange-400",
    GRAIL: "text-pink-400",
  };

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
        router.push("/admin/products");
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
          <Link
            href="/admin/products"
            className="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {mode === "create" ? "Create Product" : "Edit Product"}
            </h1>
            <p className="text-sm text-zinc-500">
              {mode === "create"
                ? "Add a new product to your catalog"
                : `Editing: ${product?.title}`}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Create Product" : "Save Changes"}
            </>
          )}
        </button>
      </div>

      {globalError && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 p-4 text-sm text-red-400">
          {globalError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Basic Information
              </h2>
              <p className="text-sm text-zinc-500">
                Core product details. The slug will be auto-generated from the
                title.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">
                  Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={product?.title || ""}
                  placeholder="Enter product title"
                  required
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title[0]}</p>
                )}
                {product?.slug && (
                  <p className="text-xs text-zinc-500">
                    Current slug:{" "}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                      {product.slug}
                    </code>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description || ""}
                  placeholder="Enter product description"
                  rows={5}
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                />
                {errors.description && (
                  <p className="text-sm text-red-400">
                    {errors.description[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Product Image
              </h2>
              <p className="text-sm text-zinc-500">
                Upload a product image. Images are stored in Google Cloud
                Storage.
              </p>
            </div>
            <div className="p-6">
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                disabled={isPending}
              />
              {errors.imageUrl && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.imageUrl[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">Status</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-zinc-300">
                    Active
                  </Label>
                  <p className="text-xs text-zinc-500">
                    Product is visible in the store
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Pricing & Inventory
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-zinc-300">
                  Price *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
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
                    className="pl-7 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-400">{errors.price[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory" className="text-zinc-300">
                  Inventory
                </Label>
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  min="0"
                  defaultValue={product?.inventory || 0}
                  placeholder="0"
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                />
                {errors.inventory && (
                  <p className="text-sm text-red-400">{errors.inventory[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Organization
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-zinc-300">
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={product?.category || ""}
                  required
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50"
                >
                  <option value="" className="bg-zinc-800">
                    Select category
                  </option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-zinc-800">
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-400">{errors.category[0]}</p>
                )}
              </div>

              {/* Tier */}
              <div className="space-y-2">
                <Label htmlFor="tier" className="text-zinc-300">
                  Tier *
                </Label>
                <select
                  id="tier"
                  name="tier"
                  defaultValue={product?.tier || "COMMON"}
                  required
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50"
                >
                  {Object.entries(tierLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-zinc-800">
                      {label}
                    </option>
                  ))}
                </select>
                {errors.tier && (
                  <p className="text-sm text-red-400">{errors.tier[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-zinc-300">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku || ""}
                  placeholder="e.g., PROD-001"
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                />
                {errors.sku && (
                  <p className="text-sm text-red-400">{errors.sku[0]}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
