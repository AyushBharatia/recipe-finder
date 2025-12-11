const { google } = require("googleapis");

// Set up OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

/**
 * Send OTP verification email using Gmail API
 * @param {string} to - Recipient email address
 * @param {string} otp - The OTP code to send
 * @param {string} userName - Name of the user
 * @param {string} purpose - 'login' or 'register'
 * @returns {Promise} - Gmail API send result
 */
async function sendOTPEmail(to, otp, userName, purpose = "login") {
  const isRegistration = purpose === "register";
  const subject = isRegistration
    ? "Verify Your Email - Recipe Finder"
    : "Your Login Verification Code - Recipe Finder";
  const actionText = isRegistration
    ? "Thank you for registering with Recipe Finder! Please verify your email address using the code below:"
    : "You are attempting to log in to your Recipe Finder account. Please use the verification code below to complete your login:";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Recipe Finder</h1>
      </div>

      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">${isRegistration ? "Welcome" : "Hello"}, ${userName}!</h2>

        <p style="color: #666; font-size: 16px; line-height: 1.5;">
          ${actionText}
        </p>

        <div style="background: #f8f9fa; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px; border: 2px dashed #4CAF50;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">${otp}</span>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.5;">
          <strong>This code will expire in 5 minutes.</strong>
        </p>

        <p style="color: #999; font-size: 13px; line-height: 1.5; margin-top: 20px;">
          If you didn't request this code, please ignore this email. Someone may have entered your email address by mistake.
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">

        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from Recipe Finder. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  // Construct RFC 2822 formatted email
  const rawEmail = [
    `From: "Recipe Finder" <${process.env.GOOGLE_SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlContent,
  ].join("\r\n");

  // Base64 URL-safe encode
  const encodedEmail = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });
    console.log("Email sent successfully via Gmail API");
    return result;
  } catch (error) {
    console.error("Gmail API error:", error.message);
    throw error;
  }
}

/**
 * Verify Gmail API configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
async function verifyEmailConfig() {
  try {
    // Test by getting user profile
    await gmail.users.getProfile({ userId: "me" });
    console.log("Gmail API service is ready to send messages");
    return true;
  } catch (error) {
    console.error("Gmail API configuration error:", error.message);
    return false;
  }
}

module.exports = { sendOTPEmail, verifyEmailConfig };
