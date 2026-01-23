import { resend } from "./resend";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  from = "W-Pull <no-reply@emails.teevong.com>",
}: SendEmailParams) {
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send failed:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error };
  }
}
