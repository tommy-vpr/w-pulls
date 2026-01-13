import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const blob = bucket.file(filename);
  
  await blob.save(buffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function deleteFromGCS(filename: string): Promise<void> {
  try {
    await bucket.file(filename).delete();
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
  }
}

export function getFilenameFromUrl(url: string): string | null {
  const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
  return match ? match[1] : null;
}
