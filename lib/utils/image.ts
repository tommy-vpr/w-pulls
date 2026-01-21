// lib/utils/image.ts
export function getPublicImageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") && !path.includes("localhost")) return path;

  // For production: use GCS or your deployed app URL
  const gcsUrl = process.env.GCS_PUBLIC_URL;
  if (gcsUrl) return `${gcsUrl}${path}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (baseUrl && !baseUrl.includes("localhost")) {
    return `${baseUrl}${path}`;
  }

  // Fallback: placeholder for local dev
  return "https://placehold.co/60x60/1a1a2e/00ffff?text=Card";
}
