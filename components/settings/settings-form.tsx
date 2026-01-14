"use client";

import { useState, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconUser,
  IconMail,
  IconLock,
  IconCamera,
  IconTrash,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import {
  updateProfileAction,
  updatePasswordAction,
  updateAvatarAction,
  removeAvatarAction,
  deleteAccountAction,
} from "@/lib/actions/settings.actions";
import { format } from "date-fns";

interface SettingsUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
}

interface SettingsFormProps {
  user: SettingsUser;
}

export function SettingsForm({ user }: SettingsFormProps) {
  return (
    <div className="space-y-8">
      <AvatarSection user={user} />
      <ProfileSection user={user} />
      <PasswordSection />
      <DangerZone />
    </div>
  );
}

// Avatar Section
function AvatarSection({ user }: { user: SettingsUser }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(user.image);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const result = await updateAvatarAction(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        setPreview(user.image);
      } else if (result.success) {
        // Update session with new image
        await update({ image: result.data?.image });
        setMessage({ type: "success", text: "Avatar updated successfully" });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleRemove = () => {
    startRemoveTransition(async () => {
      const result = await removeAvatarAction();
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        // Update session with null image
        await update({ image: null });
        setPreview(null);
        setMessage({ type: "success", text: "Avatar removed" });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const getInitials = () => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">
        Profile Picture
      </h2>

      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          {preview ? (
            <img
              src={preview}
              alt={user.name || "Avatar"}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-violet-500/30"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials()}
            </div>
          )}

          {/* Upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || isRemoving}
            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <IconCamera className="h-6 w-6 text-white" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm text-zinc-400">
            Click the avatar to upload a new image. Recommended size: 256x256px.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Supported formats: JPG, PNG, GIF, WebP (max 5MB)
          </p>

          {/* Remove button */}
          {preview && (
            <button
              onClick={handleRemove}
              disabled={isRemoving || isPending}
              className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
              ) : (
                <IconTrash className="h-4 w-4 inline mr-1" />
              )}
              Remove avatar
            </button>
          )}

          {message && (
            <p
              className={cn(
                "text-sm mt-2",
                message.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Section
function ProfileSection({ user }: { user: SettingsUser }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        // Update session with new name/email
        await update({
          name: result.data?.name,
          email: result.data?.email,
        });
        setMessage({ type: "success", text: "Profile updated successfully" });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">
        Profile Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <LabelInputContainer>
          <Label htmlFor="name" className="text-zinc-300">
            Full Name
          </Label>
          <div className="relative">
            <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="name"
              name="name"
              defaultValue={user.name || ""}
              placeholder="Your name"
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
          </div>
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="email" className="text-zinc-300">
            Email Address
          </Label>
          <div className="relative">
            <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email || ""}
              placeholder="you@example.com"
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
          </div>
        </LabelInputContainer>

        <div className="flex items-center gap-4 pt-2">
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400">Role:</span> {user.role}
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-400">Joined:</span>{" "}
            {format(user.createdAt, "MMMM d, yyyy")}
          </div>
        </div>

        {message && (
          <div
            className={cn(
              "p-3 rounded-lg text-sm",
              message.type === "success"
                ? "bg-emerald-900/30 border border-emerald-700/50 text-emerald-400"
                : "bg-red-900/30 border border-red-700/50 text-red-400"
            )}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer group/btn relative h-10 px-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 font-medium text-white text-sm shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            <>
              <IconCheck className="inline h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

// Password Section
function PasswordSection() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Password updated successfully" });
        formRef.current?.reset();
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">
        Change Password
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <LabelInputContainer>
          <Label htmlFor="currentPassword" className="text-zinc-300">
            Current Password
          </Label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              required
            />
          </div>
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="newPassword" className="text-zinc-300">
            New Password
          </Label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              required
              minLength={8}
            />
          </div>
          <p className="text-xs text-zinc-500">Minimum 8 characters</p>
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="confirmPassword" className="text-zinc-300">
            Confirm New Password
          </Label>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
              required
              minLength={8}
            />
          </div>
        </LabelInputContainer>

        {message && (
          <div
            className={cn(
              "p-3 rounded-lg text-sm",
              message.type === "success"
                ? "bg-emerald-900/30 border border-emerald-700/50 text-emerald-400"
                : "bg-red-900/30 border border-red-700/50 text-red-400"
            )}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer group/btn relative h-10 px-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 font-medium text-white text-sm shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            <>
              <IconLock className="inline h-4 w-4 mr-2" />
              Update Password
            </>
          )}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

// Danger Zone
function DangerZone() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = () => {
    if (confirmText !== "DELETE") return;

    startTransition(async () => {
      await deleteAccountAction();
    });
  };

  return (
    <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6">
      <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
        <IconAlertTriangle className="h-5 w-5" />
        Danger Zone
      </h2>
      <p className="text-sm text-zinc-400 mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="group/btn relative h-10 px-6 rounded-md bg-red-900/30 border border-red-800/50 font-medium text-red-400 text-sm hover:bg-red-900/50 transition-colors"
        >
          <IconTrash className="inline h-4 w-4 mr-2" />
          Delete Account
        </button>
      ) : (
        <div className="space-y-4 p-4 rounded-lg border border-red-800/50 bg-red-950/30">
          <p className="text-sm text-red-300">
            Type <span className="font-mono font-bold">DELETE</span> to confirm
            account deletion.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-zinc-900/50 border-red-800/50 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-red-500/50"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              className="h-10 px-6 rounded-md border border-zinc-700 font-medium text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isPending}
              className="cursor-pointer h-10 px-6 rounded-md bg-red-600 font-medium text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Delete My Account"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
