export function passwordResetEmail({
  resetUrl,
  email,
}: {
  resetUrl: string;
  email: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password – W-Pull</title>
</head>
<body style="background-color: #030812; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="text-align: center; padding: 30px 0;">
      <p style="font-size: 28px; font-weight: bold; color: #00ffff; letter-spacing: 4px; margin: 0;">W-PULL</p>
      <p style="font-size: 10px; color: rgba(0,255,255,0.5); letter-spacing: 3px; margin: 4px 0 0 0;">CARD SYSTEM</p>
    </div>

    <!-- Reset Card -->
    <div style="background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.05)); border: 1px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 30px; text-align: center;">
      <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 12px 0;">
        Reset your password
      </h1>
      <p style="font-size: 15px; color: rgba(255,255,255,0.7); margin: 0 0 24px 0;">
        We received a request to reset the password for <strong>${email}</strong>.
        If you didn’t request this, you can safely ignore this email.
      </p>

      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 1px; text-transform: uppercase;">
        Reset Password
      </a>

      <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 24px 0 0 0;">
        This link expires in 1 hour.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 0;">
      <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin: 0;">
        © ${new Date().getFullYear()} W-Pull. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
`;
}
