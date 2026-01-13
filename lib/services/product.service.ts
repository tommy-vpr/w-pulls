import { Product } from "@prisma/client";
import {
  productRepository,
  ProductRepository,
} from "@/lib/repositories/product.repository";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validations/product";
import {
  ProductFilters,
  PaginationParams,
  PaginatedResult,
  ActionResponse,
} from "@/types/product";
import { deleteFromGCS, getFilenameFromUrl } from "@/lib/gcs";
import { auditService } from "./audit.service";

export class ProductService {
  constructor(private repository: ProductRepository) {}

  /**
   * Create a new product with auto-generated slug
   */
  async createProduct(
    input: CreateProductInput
  ): Promise<ActionResponse<Product>> {
    try {
      // Generate unique slug from title
      const baseSlug = generateSlug(input.title);
      const existingSlugs = await this.repository.getAllSlugs();
      const slug = generateUniqueSlug(baseSlug, existingSlugs);

      // Check SKU uniqueness if provided
      if (input.sku) {
        const skuExists = await this.repository.skuExists(input.sku);
        if (skuExists) {
          return {
            success: false,
            error: "SKU already exists",
            errors: { sku: ["This SKU is already in use"] },
          };
        }
      }

      const product = await this.repository.create({
        title: input.title,
        slug,
        description: input.description || null,
        price: parseFloat(input.price),
        imageUrl: input.imageUrl || null,
        category: input.category || null,
        tier: input.tier || "COMMON",
        sku: input.sku || null,
        inventory: parseInt(input.inventory || "0"),
        isActive: input.isActive ?? true,
      });

      // Log audit
      await auditService.logProductCreated(product);

      return { success: true, data: product };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: "Failed to create product",
      };
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    input: UpdateProductInput
  ): Promise<ActionResponse<Product>> {
    try {
      const existingProduct = await this.repository.findById(input.id);
      if (!existingProduct) {
        return { success: false, error: "Product not found" };
      }

      // Track changes
      const changes: { field: string; oldValue: any; newValue: any }[] = [];

      if (input.price && input.price !== existingProduct.price.toString()) {
        changes.push({
          field: "price",
          oldValue: existingProduct.price,
          newValue: input.price,
        });
      }
      if (
        input.inventory &&
        parseInt(input.inventory) !== existingProduct.inventory
      ) {
        changes.push({
          field: "inventory",
          oldValue: existingProduct.inventory,
          newValue: input.inventory,
        });
      }
      if (input.tier && input.tier !== existingProduct.tier) {
        changes.push({
          field: "tier",
          oldValue: existingProduct.tier,
          newValue: input.tier,
        });
      }
      if (
        input.isActive !== undefined &&
        input.isActive !== existingProduct.isActive
      ) {
        changes.push({
          field: "isActive",
          oldValue: existingProduct.isActive,
          newValue: input.isActive,
        });
      }

      // Generate new slug if title changed
      let slug = existingProduct.slug;
      if (input.title && input.title !== existingProduct.title) {
        const baseSlug = generateSlug(input.title);
        const existingSlugs = await this.repository.getSlugsExcluding(input.id);
        slug = generateUniqueSlug(baseSlug, existingSlugs);
      }

      // Check SKU uniqueness if changed
      if (input.sku && input.sku !== existingProduct.sku) {
        const skuExists = await this.repository.skuExists(input.sku, input.id);
        if (skuExists) {
          return {
            success: false,
            error: "SKU already exists",
            errors: { sku: ["This SKU is already in use"] },
          };
        }
      }

      // Delete old image from GCS if image URL changed
      if (
        input.imageUrl !== undefined &&
        existingProduct.imageUrl &&
        input.imageUrl !== existingProduct.imageUrl
      ) {
        const oldFilename = getFilenameFromUrl(existingProduct.imageUrl);
        if (oldFilename) {
          await deleteFromGCS(oldFilename);
        }
      }

      const product = await this.repository.update(input.id, {
        ...(input.title && { title: input.title }),
        slug,
        ...(input.description !== undefined && {
          description: input.description || null,
        }),
        ...(input.price && { price: parseFloat(input.price) }),
        ...(input.imageUrl !== undefined && {
          imageUrl: input.imageUrl || null,
        }),
        ...(input.category !== undefined && {
          category: input.category || null,
        }),
        ...(input.tier !== undefined && { tier: input.tier }),
        ...(input.sku !== undefined && { sku: input.sku || null }),
        ...(input.inventory && { inventory: parseInt(input.inventory) }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      });

      // Log audit
      if (changes.length > 0) {
        await auditService.logProductUpdated(product.id, changes);
      }

      return { success: true, data: product };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: "Failed to update product" };
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ActionResponse<Product>> {
    try {
      const existingProduct = await this.repository.findById(id);
      if (!existingProduct) {
        return { success: false, error: "Product not found" };
      }

      // Delete image from GCS if exists
      if (existingProduct.imageUrl) {
        const filename = getFilenameFromUrl(existingProduct.imageUrl);
        if (filename) {
          await deleteFromGCS(filename);
        }
      }

      await auditService.logProductDeleted(existingProduct);

      const product = await this.repository.delete(id);
      return { success: true, data: product };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: "Failed to delete product" };
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ActionResponse<Product>> {
    try {
      const product = await this.repository.findById(id);
      if (!product) {
        return { success: false, error: "Product not found" };
      }
      return { success: true, data: product };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: "Failed to fetch product" };
    }
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ActionResponse<Product>> {
    try {
      const product = await this.repository.findBySlug(slug);
      if (!product) {
        return { success: false, error: "Product not found" };
      }
      return { success: true, data: product };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: "Failed to fetch product" };
    }
  }

  /**
   * Get paginated products
   */
  async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ActionResponse<PaginatedResult<Product>>> {
    try {
      const result = await this.repository.findMany(filters, pagination);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, error: "Failed to fetch products" };
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ActionResponse<string[]>> {
    try {
      const categories = await this.repository.getCategories();
      return { success: true, data: categories };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: "Failed to fetch categories" };
    }
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(id: string): Promise<ActionResponse<Product>> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return { success: false, error: "Product not found" };
      }

      const product = await this.repository.update(id, {
        isActive: !existing.isActive,
      });

      return { success: true, data: product };
    } catch (error) {
      console.error("Error toggling product status:", error);
      return { success: false, error: "Failed to toggle product status" };
    }
  }
}

export const productService = new ProductService(productRepository);
