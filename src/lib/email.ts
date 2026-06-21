import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transport — configure via env vars.
// For local dev, Ethereal (https://ethereal.email) is auto-created if no SMTP
// vars are set. For production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
// ---------------------------------------------------------------------------

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Dev fallback — logs preview URL to console instead of sending
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER ?? "dev@ethereal.email",
      pass: process.env.ETHEREAL_PASS ?? "devpass",
    },
  });
}

const FROM = process.env.EMAIL_FROM ?? "MIQSX <noreply@miqsx.com>";

// Escape user-controlled values before interpolating into email HTML.
function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// Team invite email
// ---------------------------------------------------------------------------
export async function sendTeamInviteEmail({
  to,
  inviterName,
  role,
  token,
}: {
  to: string;
  inviterName: string;
  role: string;
  token: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/team/accept/${token}`;

  const transport = createTransport();

  const info = await transport.sendMail({
    from: FROM,
    to,
    subject: `${inviterName} invited you to join their MIQSX workspace`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #08090F; color: #F1F5F9; padding: 40px;">
          <div style="max-width: 520px; margin: 0 auto;">
            <h1 style="color: #7C3AED; margin-bottom: 8px;">MIQSX</h1>
            <p style="color: #94A3B8; margin-top: 0;">AI Brand Operating System</p>

            <div style="background: #0F1117; border: 1px solid #1E2435; border-radius: 12px; padding: 32px; margin-top: 24px;">
              <h2 style="margin-top: 0;">You've been invited!</h2>
              <p>
                <strong>${escapeHtml(inviterName)}</strong> has invited you to join their MIQSX workspace
                as a <strong>${escapeHtml(role)}</strong>.
              </p>
              <p style="color: #94A3B8; font-size: 14px;">
                This invite expires in 48 hours.
              </p>
              <a
                href="${acceptUrl}"
                style="
                  display: inline-block;
                  background: #7C3AED;
                  color: white;
                  padding: 12px 28px;
                  border-radius: 8px;
                  text-decoration: none;
                  font-weight: 600;
                  margin-top: 16px;
                "
              >
                Accept Invite
              </a>
            </div>

            <p style="color: #475569; font-size: 12px; margin-top: 24px;">
              If you weren't expecting this, ignore this email. No account will be created.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  // In dev (Ethereal), log the preview URL
  if (!process.env.SMTP_HOST) {
    console.log("[email] Preview URL:", nodemailer.getTestMessageUrl(info));
  }

  return info;
}

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------
function authEmailShell(heading: string, bodyHtml: string, buttonLabel: string, url: string): string {
  return `
    <!DOCTYPE html><html><body style="font-family: sans-serif; background: #08090F; color: #F1F5F9; padding: 40px;">
      <div style="max-width: 520px; margin: 0 auto;">
        <h1 style="color: #7C3AED; margin-bottom: 8px;">MIQSX</h1>
        <p style="color: #94A3B8; margin-top: 0;">AI Brand Operating System</p>
        <div style="background: #0F1117; border: 1px solid #1E2435; border-radius: 12px; padding: 32px; margin-top: 24px;">
          <h2 style="margin-top: 0;">${heading}</h2>
          ${bodyHtml}
          <a href="${url}" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px;">${buttonLabel}</a>
        </div>
        <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, you can ignore this email.</p>
      </div>
    </body></html>`;
}

export async function sendVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/auth/verify?token=${token}`;
  const transport = createTransport();
  const info = await transport.sendMail({
    from: FROM,
    to,
    subject: "Verify your MIQSX email",
    html: authEmailShell(
      "Confirm your email",
      `<p>Hi ${escapeHtml(name)}, please confirm your email to finish setting up your MIQSX account. This link expires in 24 hours.</p>`,
      "Verify email",
      url
    ),
  });
  if (!process.env.SMTP_HOST) console.log("[email] Verify preview:", nodemailer.getTestMessageUrl(info));
  return info;
}

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/auth/reset-password?token=${token}`;
  const transport = createTransport();
  const info = await transport.sendMail({
    from: FROM,
    to,
    subject: "Reset your MIQSX password",
    html: authEmailShell(
      "Reset your password",
      `<p>Hi ${escapeHtml(name)}, we received a request to reset your password. This link expires in 1 hour. If you didn't ask for this, ignore this email.</p>`,
      "Reset password",
      url
    ),
  });
  if (!process.env.SMTP_HOST) console.log("[email] Reset preview:", nodemailer.getTestMessageUrl(info));
  return info;
}

// ---------------------------------------------------------------------------
// Generic notification (reusable)
// ---------------------------------------------------------------------------
export async function sendNotificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transport = createTransport();
  return transport.sendMail({ from: FROM, to, subject, html });
}
