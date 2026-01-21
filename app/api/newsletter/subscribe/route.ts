// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, firstName } = result.data;

    // Add to Resend Audience
    const { error } = await resend.contacts.create({
      email,
      firstName: firstName || undefined,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });

    if (error) {
      // Handle duplicate email
      if (error.message?.includes("already exists")) {
        return NextResponse.json(
          { success: false, error: "You're already subscribed!" },
          { status: 400 },
        );
      }
      throw error;
    }

    // Send welcome email
    await resend.emails.send({
      from: "W-Pull <noreply@emails.teevong.com>",
      to: email,
      subject: "Welcome to W-Pull Newsletter! 🎴",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030812; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .card { background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; overflow: hidden; border: 1px solid rgba(34, 211, 238, 0.2); }
              .header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(167, 139, 250, 0.1)); padding: 40px 30px; text-align: center; }
              .logo { font-size: 28px; font-weight: bold; color: #22d3ee; letter-spacing: 3px; }
              .content { padding: 40px 30px; text-align: center; }
              .title { color: #e2e8f0; font-size: 24px; margin-bottom: 15px; }
              .text { color: #94a3b8; font-size: 15px; line-height: 1.7; }
              .benefits { background: rgba(6, 182, 212, 0.05); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: left; }
              .benefit { display: flex; align-items: center; margin-bottom: 12px; color: #e2e8f0; font-size: 14px; }
              .benefit:last-child { margin-bottom: 0; }
              .check { color: #22d3ee; margin-right: 10px; }
              .cta { margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 500; }
              .footer { padding: 25px; text-align: center; border-top: 1px solid rgba(34, 211, 238, 0.1); }
              .footer-text { color: #64748b; font-size: 11px; }
              .unsubscribe { color: #64748b; font-size: 11px; margin-top: 10px; }
              .unsubscribe a { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div class="logo">W-PULL</div>
                </div>
                <div class="content">
                  <div class="title">You're In! 🎉</div>
                  <div class="text">
                    Thanks for subscribing to the W-Pull newsletter. You'll be the first to know about:
                  </div>
                  
                  <div class="benefits">
                    <div class="benefit"><span class="check">✓</span> New pack releases & exclusive drops</div>
                    <div class="benefit"><span class="check">✓</span> Special promotions & discounts</div>
                    <div class="benefit"><span class="check">✓</span> Platform updates & new features</div>
                    <div class="benefit"><span class="check">✓</span> Community events & giveaways</div>
                  </div>

                  <div class="cta">
                    <a href="${
                      process.env.NEXT_PUBLIC_APP_URL
                    }/packs" class="button">Browse Packs</a>
                  </div>
                </div>
                <div class="footer">
                  <div class="footer-text">© ${new Date().getFullYear()} W-Pull. All rights reserved.</div>
                  <div class="unsubscribe">
                    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 },
    );
  }
}
