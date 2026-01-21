import { FALLBACK_PRODUCT_IMAGE_URL } from "@/lib/constants/images";

export function getProductImageUrl(
  imageUrl: string | null | undefined,
): string {
  return imageUrl?.trim() ? imageUrl : FALLBACK_PRODUCT_IMAGE_URL;
}
