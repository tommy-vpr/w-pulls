import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { IconSettings } from "@tabler/icons-react";

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!user) return null;

  const getInitials = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Profile</h1>
          <p className="text-zinc-500">Your account information</p>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
        >
          <IconSettings className="h-4 w-4" />
          Edit Settings
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex flex-col items-center text-center">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-violet-500/30 mb-4"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {getInitials()}
              </div>
            )}
            <h2 className="text-xl font-bold text-zinc-100">
              {user.name || "User"}
            </h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <span className="mt-3 inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-700">
              {user.role}
            </span>
          </div>
        </div>

        {/* Stats Card */}
        <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-100">
              Account Stats
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-zinc-500">Member Since</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {format(user.createdAt, "MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Orders</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {user._count.orders}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Account ID</p>
                <p className="text-sm font-mono text-zinc-400 truncate">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Last Updated</p>
                <p className="text-sm text-zinc-400">
                  {format(user.updatedAt, "PPP")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
