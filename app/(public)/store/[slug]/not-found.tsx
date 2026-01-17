import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
          <Package className="w-10 h-10 text-zinc-600" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Product Not Found
        </h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          Sorry, we couldn&apos;t find the product you&apos;re looking for. It
          may have been removed or is no longer available.
        </p>

        <Link
          href="/store"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    </div>
  );
}
