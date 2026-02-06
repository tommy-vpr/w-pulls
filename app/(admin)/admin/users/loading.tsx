// app/(admin)/admin/loading.tsx
import { ProductsLoading } from "@/components/ui/loadings";

export default function Loading() {
  return <ProductsLoading />;
}

// // app/(admin)/admin/products/loading.tsxs
// import { Skeleton } from "@/components/ui/skeleton";

// export default function ProductsLoading() {
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <Skeleton className="h-8 w-32 bg-zinc-800" />
//           <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
//         </div>
//         <Skeleton className="h-10 w-32 bg-zinc-800" />
//       </div>

//       {/* Filters */}
//       <div className="flex gap-4">
//         <Skeleton className="h-10 w-64 bg-zinc-800" />
//         <Skeleton className="h-10 w-40 bg-zinc-800" />
//         <Skeleton className="h-10 w-40 bg-zinc-800" />
//       </div>

//       {/* Table */}
//       <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
//         {/* Table Header */}
//         <div className="px-6 py-4 border-b border-zinc-800">
//           <div className="flex gap-4">
//             <Skeleton className="h-4 w-16 bg-zinc-800" />
//             <Skeleton className="h-4 w-24 bg-zinc-800" />
//             <Skeleton className="h-4 w-20 bg-zinc-800" />
//             <Skeleton className="h-4 w-16 bg-zinc-800" />
//             <Skeleton className="h-4 w-20 bg-zinc-800" />
//           </div>
//         </div>

//         {/* Table Rows */}
//         {Array.from({ length: 8 }).map((_, i) => (
//           <div
//             key={i}
//             className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4"
//           >
//             <Skeleton className="h-12 w-12 rounded-lg bg-zinc-800" />
//             <div className="flex-1 space-y-2">
//               <Skeleton className="h-4 w-48 bg-zinc-800" />
//               <Skeleton className="h-3 w-24 bg-zinc-800" />
//             </div>
//             <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
//             <Skeleton className="h-6 w-16 rounded-md bg-zinc-800" />
//             <Skeleton className="h-4 w-16 bg-zinc-800" />
//             <Skeleton className="h-4 w-8 bg-zinc-800" />
//             <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
//           </div>
//         ))}
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-center gap-2">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <Skeleton key={i} className="h-9 w-9 rounded-lg bg-zinc-800" />
//         ))}
//       </div>
//     </div>
//   );
// }
