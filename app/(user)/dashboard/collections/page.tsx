// app/dashboard/collection/page.tsx
import { requireAuth } from "@/lib/auth-utils";
import { collectionService } from "@/lib/services/collection.service";
import { CollectionGrid } from "@/components/collections/collection-grid";
import { CollectionStats } from "@/components/collections/collection-stats";

export default async function CollectionPage() {
  const session = await requireAuth();

  const { summary, items } = await collectionService.getUserCollection(
    session.user.id
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Collection</h1>
        <p className="text-zinc-400">
          Your revealed pulls and total portfolio value
        </p>
      </div>

      <CollectionStats summary={summary} />

      <CollectionGrid items={items} />
    </div>
  );
}
