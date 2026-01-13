import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToGCS } from "@/lib/gcs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Process with sharp - convert to WebP and optimize
    const processedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const filename = `products/${Date.now()}-${sanitizedName}.webp`;

    const url = await uploadToGCS(processedBuffer, filename, "image/webp");

    return NextResponse.json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { uploadToGCS } from '@/lib/gcs';

// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: 'No file provided' },
//         { status: 400 }
//       );
//     }

//     // Validate file type
//     if (!ALLOWED_TYPES.includes(file.type)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
//         { status: 400 }
//       );
//     }

//     // Validate file size
//     if (file.size > MAX_SIZE) {
//       return NextResponse.json(
//         { success: false, error: 'File too large. Maximum size: 10MB' },
//         { status: 400 }
//       );
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Generate unique filename
//     const extension = file.name.split('.').pop() || 'jpg';
//     const sanitizedName = file.name
//       .replace(/\.[^/.]+$/, '')
//       .replace(/[^a-zA-Z0-9]/g, '-')
//       .toLowerCase();
//     const filename = `products/${Date.now()}-${sanitizedName}.${extension}`;

//     const url = await uploadToGCS(buffer, filename, file.type);

//     return NextResponse.json({
//       success: true,
//       url,
//       filename,
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Upload failed' },
//       { status: 500 }
//     );
//   }
// }
