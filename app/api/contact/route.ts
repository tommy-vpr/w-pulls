// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  reason: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, reason, message } = result.data;

    // Send email to support team
    const { error: supportError } = await resend.emails.send({
      from: "W-Pull Contact <noreply@email.teevong.com>", // Must be verified domain
      to: process.env.SUPPORT_EMAIL!, // Your support email
      replyTo: email,
      subject: `[${reason.toUpperCase()}] New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0891b2, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #1e293b; padding: 30px; border-radius: 0 0 12px 12px; }
              .field { margin-bottom: 20px; }
              .label { color: #22d3ee; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
              .value { color: #e2e8f0; font-size: 16px; }
              .message-box { background: #0f172a; padding: 20px; border-radius: 8px; border-left: 3px solid #22d3ee; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From</div>
                  <div class="value">${name} (${email})</div>
                </div>
                <div class="field">
                  <div class="label">Topic</div>
                  <div class="value">${reason}</div>
                </div>
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">
                    <div class="value">${message.replace(/\n/g, "<br>")}</div>
                  </div>
                </div>
              </div>
              <div class="footer">
                Reply directly to this email to respond to ${name}
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (supportError) {
      console.error("Failed to send support email:", supportError);
      return NextResponse.json(
        { success: false, error: "Failed to send message" },
        { status: 500 }
      );
    }

    // Send confirmation email to customer
    const { error: confirmError } = await resend.emails.send({
      from: "W-Pull <noreply@yourdomain.com>",
      to: email,
      subject: "We received your message - W-Pull Support",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030812; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .card { background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; overflow: hidden; border: 1px solid rgba(34, 211, 238, 0.2); }
              .header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(167, 139, 250, 0.1)); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(34, 211, 238, 0.1); }
              .logo { font-size: 28px; font-weight: bold; color: #22d3ee; letter-spacing: 3px; }
              .tagline { color: rgba(34, 211, 238, 0.5); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
              .content { padding: 40px 30px; }
              .greeting { color: #e2e8f0; font-size: 20px; margin-bottom: 20px; }
              .text { color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
              .summary { background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(34, 211, 238, 0.1); border-radius: 12px; padding: 20px; margin: 25px 0; }
              .summary-title { color: #22d3ee; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
              .summary-item { margin-bottom: 12px; }
              .summary-label { color: rgba(34, 211, 238, 0.6); font-size: 11px; text-transform: uppercase; }
              .summary-value { color: #e2e8f0; font-size: 14px; margin-top: 3px; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
              .footer { text-align: center; padding: 30px; border-top: 1px solid rgba(34, 211, 238, 0.1); }
              .footer-text { color: #64748b; font-size: 12px; }
              .social { margin-top: 15px; }
              .social a { color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="logo">W-PULL</div>
                  <div class="tagline">Card System</div>
                </div>
                <div class="content">
                  <div class="greeting">Hey ${name}! 👋</div>
                  <div class="text">
                    Thanks for reaching out to us. We've received your message and our support team will get back to you within 24 hours.
                  </div>
                  
                  <div class="summary">
                    <div class="summary-title">Your Message Summary</div>
                    <div class="summary-item">
                      <div class="summary-label">Topic</div>
                      <div class="summary-value">${reason}</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-label">Message</div>
                      <div class="summary-value">${
                        message.length > 150
                          ? message.substring(0, 150) + "..."
                          : message
                      }</div>
                    </div>
                  </div>

                  <div class="text">
                    In the meantime, you might find answers to common questions in our FAQ or Support Center.
                  </div>

                  <div class="cta">
                    <a href="${
                      process.env.NEXT_PUBLIC_APP_URL
                    }/faq" class="button">Visit FAQ</a>
                  </div>
                </div>
                <div class="footer">
                  <div class="footer-text">
                    © ${new Date().getFullYear()} W-Pull. All rights reserved.
                  </div>
                  <div class="social">
                    <a href="#">Twitter</a>
                    <a href="#">Discord</a>
                    <a href="#">Instagram</a>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (confirmError) {
      // Log but don't fail - support email was sent successfully
      console.error("Failed to send confirmation email:", confirmError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
