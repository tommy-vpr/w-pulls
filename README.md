# Product CMS Dashboard

A modern product catalog management system built with Next.js 15, React 19, Tailwind CSS 4, Prisma, Supabase, and Google Cloud Storage.

## Features

- **Product Management**: Create, edit, delete, and toggle product status
- **Auto-generated Slugs**: Unique URL-friendly slugs from product titles
- **Image Upload**: Direct upload to Google Cloud Storage with drag & drop
- **Responsive Dashboard**: Clean shadcn/ui components
- **Type-safe**: Full TypeScript with Zod validation
- **Architecture**: Actions → Repository → Service pattern

## Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **React**: React 19
- **Styling**: Tailwind CSS 4
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **UI**: shadcn/ui
- **Storage**: Google Cloud Storage

## Project Structure

```
├── app/
│   ├── actions/           # Server actions
│   ├── api/upload/        # Image upload API
│   └── dashboard/         # Dashboard pages
├── components/
│   ├── ui/               # shadcn components
│   ├── product-form.tsx  # Product form component
│   └── products-table.tsx
├── lib/
│   ├── repositories/     # Database layer
│   ├── services/         # Business logic layer
│   ├── validations/      # Zod schemas
│   ├── utils/            # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── gcs.ts            # GCS client
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                # TypeScript types
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in:

```env
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Google Cloud Storage
GCP_PROJECT_ID="your-project-id"
GCP_BUCKET_NAME="your-bucket-name"
GCP_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the connection strings to your `.env`

### 4. Set up Google Cloud Storage

1. Create a GCS bucket
2. Create a service account with Storage Object Admin role
3. Download the JSON key and extract the values

### 5. Initialize the database

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### 6. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Architecture Pattern

### Actions → Repository → Service

```
[Client] → [Server Action] → [Service] → [Repository] → [Database]
                 ↓               ↓
            Validation     Business Logic
```

- **Actions**: Handle form data, validation, and call services
- **Services**: Business logic, slug generation, file cleanup
- **Repositories**: Direct database operations via Prisma

## API Routes

### POST /api/upload

Upload an image to GCS.

```typescript
// Request
const formData = new FormData();
formData.append('file', file);

// Response
{
  success: true,
  url: "https://storage.googleapis.com/bucket/products/123-image.jpg",
  filename: "products/123-image.jpg"
}
```

## Database Commands

```bash
npm run db:generate   # Regenerate Prisma client
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio
npm run db:migrate    # Create migration
```
