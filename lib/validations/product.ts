import { z } from "zod";
import { ProductCategory, ProductTier } from "@prisma/client";

export const productCategorySchema = z.nativeEnum(ProductCategory);

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Price must be a valid positive number",
    }),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  category: productCategorySchema,
  tier: z.nativeEnum(ProductTier),
  sku: z.string().max(50).optional().nullable(),
  inventory: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "Inventory must be a valid non-negative number",
    })
    .optional()
    .default("0"),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid("Invalid product ID"),
});

export const productIdSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
});

export const productSlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
