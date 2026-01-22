import { FALLBACK_PRODUCT_IMAGE_URL } from "@/lib/constants/images";

// export function getProductImageUrl(
//   imageUrl: string | null | undefined,
// ): string {
//   return imageUrl?.trim() ? imageUrl : FALLBACK_PRODUCT_IMAGE_URL;
// }

export function getProductImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return FALLBACK_PRODUCT_IMAGE_URL;

  const version = process.env.IMAGE_VERSION ?? "2";
  return `${imageUrl}?v=${version}`;
}
