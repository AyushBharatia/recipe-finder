const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - The OTP code to send
 * @param {string} userName - Name of the user
 * @param {string} purpose - 'login' or 'register'
 * @returns {Promise} - Nodemailer send result
 */
async function sendOTPEmail(to, otp, userName, purpose = "login") {
  const isRegistration = purpose === "register";
  const subject = isRegistration
    ? "Verify Your Email - Recipe Finder"
    : "Your Login Verification Code - Recipe Finder";
  const actionText = isRegistration
    ? "Thank you for registering with Recipe Finder! Please verify your email address using the code below:"
    : "You are attempting to log in to your Recipe Finder account. Please use the verification code below to complete your login:";

  const mailOptions = {
    from: `"Recipe Finder" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
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
    `,
    text: `${isRegistration ? "Welcome" : "Hello"} ${userName}!\n\n${actionText}\n\nYour verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Verify email transporter configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("Email service is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email service configuration error:", error.message);
    return false;
  }
}

module.exports = { sendOTPEmail, verifyEmailConfig };
