import { productService } from "@/lib/services/product.service";
import { serializeProduct } from "@/types/product";
import { Pagination } from "./(components)/Pagination";
import { CategoryFilter } from "./(components)/CategoryFilter";
import { TierFilter } from "./(components)/TierFilter";
import { SearchInput } from "./(components)/SearchInput";
import { StoreContent } from "./(components)/StoreContent";
import { ActiveFilters } from "./(components)/Activefilters";

interface StorePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tier?: string;
    search?: string;
  }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = 12;

  const [productsResult, categoriesResult] = await Promise.all([
    productService.getProducts(
      {
        isActive: true,
        category: params.category as any,
        tier: params.tier as any,
        search: params.search,
      },
      { page, limit },
    ),
    productService.getCategories(),
  ]);

  if (!productsResult.success || !productsResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Failed to load products</p>
        </div>
      </div>
    );
  }

  const { data: products, totalPages, total } = productsResult.data;
  const activeCategories = categoriesResult.success
    ? categoriesResult.data!
    : [];

  return (
    <div className="min-h-screen mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Store</h1>
          <p className="mt-2 text-zinc-400">
            Browse our collection of {total} products
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput defaultValue={params.search} />
            <CategoryFilter
              currentCategory={params.category}
              categories={activeCategories}
            />
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-2">Filter by tier</p>
            <TierFilter currentTier={params.tier} />
          </div>
        </div>

        <ActiveFilters
          search={params.search}
          category={params.category}
          tier={params.tier}
        />

        <StoreContent
          products={products.map(serializeProduct)}
          hasFilters={!!(params.search || params.category || params.tier)}
        />

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
