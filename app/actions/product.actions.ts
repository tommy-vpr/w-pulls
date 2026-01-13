"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@/lib/services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product";
import {
  ActionResponse,
  ProductFilters,
  PaginationParams,
  PaginatedResult,
  SerializedProduct,
  serializeProduct,
  serializeProducts,
} from "@/types/product";
import { ProductCategory, ProductTier } from "@prisma/client";

/**
 * Create a new product
 */
export async function createProductAction(
  formData: FormData
): Promise<ActionResponse<SerializedProduct>> {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    imageUrl: formData.get("imageUrl") as string,
    category: formData.get("category") as ProductCategory,
    tier: formData.get("tier") as ProductTier,
    sku: formData.get("sku") as string,
    inventory: formData.get("inventory") as string,
    isActive: formData.get("isActive") === "true",
  };

  const validation = createProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Validation failed",
      errors: validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const result = await productService.createProduct(validation.data);

  if (result.success && result.data) {
    revalidatePath("/dashboard/products");
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error, errors: result.errors };
}

/**
 * Update an existing product
 */
export async function updateProductAction(
  formData: FormData
): Promise<ActionResponse<SerializedProduct>> {
  const rawData = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    imageUrl: formData.get("imageUrl") as string,
    category: formData.get("category") as ProductCategory,
    tier: formData.get("tier") as ProductTier,
    sku: formData.get("sku") as string,
    inventory: formData.get("inventory") as string,
    isActive: formData.get("isActive") === "true",
  };

  const validation = updateProductSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Validation failed",
      errors: validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const result = await productService.updateProduct(validation.data);

  if (result.success && result.data) {
    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${result.data.id}/edit`);
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error, errors: result.errors };
}

/**
 * Delete a product
 */
export async function deleteProductAction(
  id: string
): Promise<ActionResponse<SerializedProduct>> {
  const result = await productService.deleteProduct(id);

  if (result.success && result.data) {
    revalidatePath("/dashboard/products");
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error };
}

/**
 * Get product by ID
 */
export async function getProductByIdAction(
  id: string
): Promise<ActionResponse<SerializedProduct>> {
  const result = await productService.getProductById(id);

  if (result.success && result.data) {
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error };
}

/**
 * Get product by slug
 */
export async function getProductBySlugAction(
  slug: string
): Promise<ActionResponse<SerializedProduct>> {
  const result = await productService.getProductBySlug(slug);

  if (result.success && result.data) {
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error };
}

/**
 * Get paginated products
 */
export async function getProductsAction(
  filters: ProductFilters = {},
  pagination: PaginationParams = {}
): Promise<ActionResponse<PaginatedResult<SerializedProduct>>> {
  const result = await productService.getProducts(filters, pagination);

  if (result.success && result.data) {
    return {
      success: true,
      data: {
        ...result.data,
        data: serializeProducts(result.data.data),
      },
    };
  }

  return { success: false, error: result.error };
}

/**
 * Get all categories
 */
export async function getCategoriesAction(): Promise<ActionResponse<string[]>> {
  return productService.getCategories();
}

/**
 * Toggle product active status
 */
export async function toggleProductStatusAction(
  id: string
): Promise<ActionResponse<SerializedProduct>> {
  const result = await productService.toggleProductStatus(id);

  if (result.success && result.data) {
    revalidatePath("/dashboard/products");
    return { success: true, data: serializeProduct(result.data) };
  }

  return { success: false, error: result.error };
}
