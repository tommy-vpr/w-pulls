export default function Loading() {
  return (
    <div className="mt-24 max-w-2xl mx-auto px-4 py-6 animate-pulse space-y-6">
      {/* Balance */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="h-4 w-20 bg-zinc-800 rounded mb-3" />
        <div className="h-10 w-40 bg-zinc-800 rounded" />
      </div>

      {/* Actions */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-3">
        <div className="h-12 w-full bg-zinc-800 rounded-lg" />
        <div className="h-12 w-full bg-zinc-800 rounded-lg" />
      </div>

      {/* Transactions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>

        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
