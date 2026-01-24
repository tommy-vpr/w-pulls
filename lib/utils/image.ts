// lib/utils/image.ts
export function getPublicImageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  const gcsUrl = process.env.GCS_PUBLIC_URL; // "https://storage.googleapis.com/your-bucket"
  if (gcsUrl) return `${gcsUrl}${path}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}
