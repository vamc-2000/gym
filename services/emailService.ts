import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"GymStreak" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

// Branded Templates
export const getBrandedTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: 800; background: linear-gradient(to right, #00f5ff, #00ff9f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .content { background-color: #1a1a1a; border: 1px solid #333333; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #00f5ff; font-size: 24px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
        p { color: #cccccc; line-height: 1.6; font-size: 16px; }
        .otp { font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 10px; margin: 30px 0; padding: 20px; background: rgba(0,245,255,0.1); border-radius: 12px; display: inline-block; border: 1px dashed #00f5ff; }
        .button { display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #ffd700, #ff8c00); color: #000000; text-decoration: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; margin-top: 30px; }
        .footer { text-align: center; margin-top: 40px; color: #666666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GYMSTREAK</div>
        </div>
        <div class="content">
            <h1>${title}</h1>
            ${content}
        </div>
        <div class="footer">
            &copy; 2026 GymStreak AI Fitness. All rights reserved.<br>
            Push your limits. Stay consistent.
        </div>
    </div>
</body>
</html>
`;

export const getResetOTPTemplate = (otp: string) => getBrandedTemplate(`
    <p>We received a request to reset your GymStreak password. Use the secure code below to proceed:</p>
    <div class="otp">${otp}</div>
    <p>This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
`, "Reset Your Password");

export const getResetLinkTemplate = (resetUrl: string) => getBrandedTemplate(`
    <p>We received a request to reset your GymStreak password. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p style="margin-top: 20px; font-size: 12px; color: #666;">Or copy this link: <br> ${resetUrl}</p>
    <p>This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
`, "Reset Your Password");

export const getPasswordChangedTemplate = () => getBrandedTemplate(`
    <p>Your password has been successfully updated. You can now log in to your account with your new credentials.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login Now</a>
`, "Password Updated");

export const getAnnouncementTemplate = (subject: string, message: string) => getBrandedTemplate(`
    <p>${message.replace(/\n/g, '<br>')}</p>
`, subject);
