import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./_components/products-table";
import { getProductsAction } from "@/app/actions/product.actions";
import { ProductsFilters } from "./_components/product-filter";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getProductsAction(
    {
      search: params.search,
      category: params.category,
    },
    { page, limit: 20 }
  );

  const products = result.success ? result.data?.data || [] : [];
  const pagination = result.success ? result.data : null;

  // Generate page numbers with ellipsis
  const getPageNumbers = (current: number, total: number) => {
    const pages: (number | "...")[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  };

  const buildUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", pageNum.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.category) queryParams.set("category", params.category);
    return `/dashboard/products?${queryParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-200">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button
          asChild
          className="group/btn relative h-10 px-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 font-medium text-white text-sm shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed
          hover:opacity-85 transition"
        >
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <ProductsFilters />

      {/* Table */}
      <ProductsTable products={products} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* Previous Button */}
          {page > 1 ? (
            <Link
              href={buildUrl(page - 1)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {/* Page Numbers */}
          {getPageNumbers(page, pagination.totalPages).map((pageNum, idx) =>
            pageNum === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-3 py-2 text-sm text-zinc-600"
              >
                ...
              </span>
            ) : page === pageNum ? (
              <span
                key={pageNum}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white text-zinc-900 font-medium"
              >
                {pageNum}
              </span>
            ) : (
              <Link
                key={pageNum}
                href={buildUrl(pageNum)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                {pageNum}
              </Link>
            )
          )}

          {/* Next Button */}
          {page < pagination.totalPages ? (
            <Link
              href={buildUrl(page + 1)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}

          {/* Page Info */}
          <span className="ml-4 text-sm text-zinc-500">
            Page {page} of {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
