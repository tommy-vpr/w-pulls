import prisma from "@/lib/prisma";
import { Product, Prisma, ProductCategory, ProductTier } from "@prisma/client";
import {
  ProductFilters,
  PaginationParams,
  PaginatedResult,
} from "@/types/product";

export class ProductRepository {
  /**
   * Create a new product
   */
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug },
    });
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  /**
   * Get all slugs (for unique slug generation)
   */
  async getAllSlugs(): Promise<string[]> {
    const products = await prisma.product.findMany({
      select: { slug: true },
    });
    return products.map((p) => p.slug);
  }

  /**
   * Get slugs excluding a specific product ID
   */
  async getSlugsExcluding(excludeId: string): Promise<string[]> {
    const products = await prisma.product.findMany({
      where: { id: { not: excludeId } },
      select: { slug: true },
    });
    return products.map((p) => p.slug);
  }

  /**
   * Update a product
   */
  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get paginated products with filters
   */
  async findMany(
    filters: ProductFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<Product>> {
    const { category, tier, isActive, search, stock } = filters;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category as ProductCategory;
    }

    if (tier) {
      where.tier = tier as ProductTier;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    // 👇 Add stock filter
    if (stock === "instock") {
      where.inventory = { gt: 0 };
    } else if (stock === "outofstock") {
      where.inventory = 0;
    } else if (stock === "low") {
      where.inventory = { gt: 0, lt: 10 };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // 👇 Dynamic sorting
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      where: {
        isActive: true,
      },
    });
    return categories.map((c) => c.category);
  }

  /**
   * Check if SKU exists (excluding a specific product ID)
   */
  async skuExists(sku: string, excludeId?: string): Promise<boolean> {
    const product = await prisma.product.findFirst({
      where: {
        sku,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!product;
  }
}

export const productRepository = new ProductRepository();
