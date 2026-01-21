import { Product, ProductCategory, ProductTier } from "@prisma/client";

export type ProductWithoutDates = Omit<Product, "createdAt" | "updatedAt">;

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  inventory: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductFilters {
  category?: ProductCategory | string;
  tier?: ProductTier | string;
  isActive?: boolean;
  search?: string;
  stock?: "instock" | "outofstock" | "low";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string; // Optional: add sorting
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Serializable product type for client components
export interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  category: string | null;
  tier: string;
  sku: string | null;
  inventory: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper to serialize Product for client components
export function serializeProduct(product: Product): SerializedProduct {
  return {
    ...product,
    price: product.price.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function serializeProducts(products: Product[]): SerializedProduct[] {
  return products.map(serializeProduct);
}

export interface ProductFilters {
  category?: string;
  tier?: string; // Add this
  isActive?: boolean;
  search?: string;
}
