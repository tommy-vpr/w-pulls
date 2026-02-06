// app/admin/users/page.tsx
import { getUsers } from "@/lib/actions/admin-user.actions";
import { UsersTable } from "./_components/users-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = params.search || "";
  const role = params.role || "ALL";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  const result = await getUsers({
    page,
    pageSize: 25,
    search,
    role,
    sortBy,
    sortOrder,
  });

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-red-400">Error loading users: {result.error}</p>
      </div>
    );
  }

  const { users, total, totalPages } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Users
        </h1>
        <p className="text-zinc-500">
          Manage all registered users ({total} total)
        </p>
      </div>

      <UsersTable
        users={users}
        total={total}
        page={page}
        totalPages={totalPages}
        currentSearch={search}
        currentRole={role}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />
    </div>
  );
}
