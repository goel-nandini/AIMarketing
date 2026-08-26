import nodemailer from 'nodemailer';

export interface SendInvitationEmailParams {
  toEmail: string;
  role: string;
  invitedByName: string;
  passcode?: string;
  invitationUrl: string;
  message?: string;
}

/**
 * Real Email Delivery Service for Agent AI.
 * Delivers invitation emails with secure passcodes and join links via SMTP (Gmail, SendGrid, etc.) or Resend.
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<{ success: boolean; delivered: boolean; messageId?: string; info?: string }> {
  const smtpUser = process.env.SMTP_USER || 'harshitsingh19622@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'gbvqcaojszvhuvei';
  const emailFrom = process.env.EMAIL_FROM || `Agent AI Marketing <${smtpUser}>`;

  const { toEmail, role, invitedByName, passcode, invitationUrl, message } = params;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #2563eb; color: #ffffff; width: 52px; height: 52px; line-height: 52px; border-radius: 14px; font-weight: 800; font-size: 26px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">A</div>
        <h2 style="color: #0f172a; margin-top: 14px; margin-bottom: 4px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Agent AI Marketing</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 0;">Super Admin Workspace Invitation</p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">You've been invited to join the team</h3>
        <p style="color: #334155; font-size: 14px; margin: 6px 0;"><strong>Invited by:</strong> ${invitedByName}</p>
        <p style="color: #334155; font-size: 14px; margin: 6px 0;"><strong>Assigned Role:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">${role}</span></p>
        <p style="color: #334155; font-size: 14px; margin: 6px 0;"><strong>Destination Email:</strong> ${toEmail}</p>
        ${message ? `<p style="color: #475569; font-size: 13px; font-style: italic; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">"${message}"</p>` : ''}
      </div>

      ${passcode ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center;">
        <p style="color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Your Team Access Passcode</p>
        <div style="font-family: monospace; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #1e3a8a; background: #ffffff; border: 1px solid #93c5fd; border-radius: 8px; padding: 10px; display: inline-block;">
          ${passcode}
        </div>
        <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0;">Enter this passcode on the sign-up page to activate your role.</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 24px; margin-bottom: 28px;">
        <a href="${invitationUrl}" style="background-color: #2563eb; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
          ACCEPT INVITATION & REGISTER
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        If you were not expecting this invitation, you can safely ignore this email.<br/>
        Direct Link: <a href="${invitationUrl}" style="color: #2563eb; word-break: break-all;">${invitationUrl}</a>
      </p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: emailFrom,
      to: toEmail,
      subject: `You've been invited to Agent AI by ${invitedByName} [Passcode: ${passcode || 'INVITE'}]`,
      html: htmlContent,
    });

    console.log(`[Gmail Success]: Invitation sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, delivered: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Gmail Delivery Error]: Failed to send to ${toEmail}:`, error.message || error);
    return {
      success: false,
      delivered: false,
      info: error.message || 'SMTP transmission error',
    };
  }
}
