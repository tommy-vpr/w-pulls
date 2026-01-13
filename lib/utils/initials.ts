interface UserLike {
  name?: string | null;
  email?: string | null;
}

/**
 * Get initials from user name or email
 * - "John Doe" → "JD"
 * - "john@example.com" → "J"
 * - null → "U"
 */
export function getInitials(user?: UserLike | null, fallback = "U"): string {
  if (!user) return fallback;

  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return fallback;
}
