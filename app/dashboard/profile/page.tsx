import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

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
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account information</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings">
            <IconSettings className="h-4 w-4" /> Edit Settings
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Avatar"}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-violet-500/20 mb-4"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center  text-3xl font-bold mb-4">
                  {getInitials()}
                </div>
              )}
              <h2 className="text-xl font-bold ">{user.name || "User"}</h2>
              <p className="text-sm text-neutral-400">{user.email}</p>
              <Badge variant="outline" className="mt-2">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="md:col-span-2 border">
          <CardHeader>
            <CardTitle>Account Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-400">Member Since</p>
                <p className="text-2xl font-bold ">
                  {format(user.createdAt, "MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Total Orders</p>
                <p className="text-2xl font-bold ">{user._count.orders}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Account ID</p>
                <p className="text-sm font-mono text-neutral-300 truncate">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-400">Last Updated</p>
                <p className="text-sm text-neutral-300">
                  {format(user.updatedAt, "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
