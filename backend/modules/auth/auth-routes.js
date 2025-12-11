const { Router } = require("express");
const bcrypt = require("bcryptjs");
const registerRules = require("./middlewares/register-rules");
const loginRules = require("./middlewares/login-rules");
const verifyOtpRules = require("./middlewares/verify-otp-rules");
const resendOtpRules = require("./middlewares/resend-otp-rules");
const User = require("./auth-model");
const OTP = require("./otp-model");
const { generateToken } = require("../../shared/utils/jwt");
const { generateOTP, hashOTP, verifyOTP } = require("../../shared/utils/otp");
const { sendOTPEmail } = require("../../shared/services/email-service");

const authRoute = Router();

// POST register - Step 1: Validate data and send OTP (does NOT create user yet)
authRoute.post("/register", registerRules, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if there's already a pending registration for this email
    await OTP.deleteMany({ email, purpose: "register" });

    // Hash password for temporary storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    // Store OTP with pending user data (user NOT created yet)
    await OTP.create({
      email,
      otp: hashedOtp,
      purpose: "register",
      pendingUserData: {
        name,
        password: hashedPassword,
      },
    });

    // Send OTP to user's email
    await sendOTPEmail(email, otp, name, "register");

    // Return success - user needs to verify OTP to complete registration
    res.status(200).json({
      message: "Verification code sent to your email",
      otpSent: true,
      email,
      isRegistration: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to process registration" });
  }
});

// POST login - Step 1: Validate credentials and send OTP
authRoute.post("/login", loginRules, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password using bcrypt
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Delete any existing OTPs for this user (cleanup)
    await OTP.deleteMany({ userId: user._id, purpose: "login" });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    // Store hashed OTP in database
    await OTP.create({
      userId: user._id,
      email: user.email,
      otp: hashedOtp,
      purpose: "login",
    });

    // Send OTP to user's email
    await sendOTPEmail(user.email, otp, user.name, "login");

    // Return success response (no token yet - need OTP verification)
    res.status(200).json({
      message: "Verification code sent to your email",
      otpSent: true,
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to process login" });
  }
});

// POST verify OTP - Handles both login and registration verification
authRoute.post("/verify-otp", verifyOtpRules, async (req, res) => {
  try {
    const { userId, email, otp } = req.body;

    let otpRecord;

    // Find OTP record - either by userId (login) or email (registration)
    if (userId) {
      otpRecord = await OTP.findOne({ userId, purpose: "login" });
    } else if (email) {
      otpRecord = await OTP.findOne({ email, purpose: "register" });
    }

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    // Check max attempts (prevent brute force)
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "Too many failed attempts. Please try again.",
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts counter
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
        attemptsRemaining: 3 - otpRecord.attempts,
      });
    }

    // OTP is valid - handle based on purpose
    if (otpRecord.purpose === "register") {
      // Registration: Create the user now
      const { name, password } = otpRecord.pendingUserData;

      // Double-check user doesn't exist (race condition protection)
      const existingUser = await User.findOne({ email: otpRecord.email });
      if (existingUser) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      // Create user with pre-hashed password
      const user = new User({
        name,
        email: otpRecord.email,
        password, // Already hashed
      });

      // Skip the pre-save hook since password is already hashed
      user.$skipPasswordHash = true;
      await user.save();

      // Delete OTP record
      await OTP.deleteOne({ _id: otpRecord._id });

      // Generate token
      const token = generateToken(user._id);

      return res.status(201).json({
        message: "Registration successful! Welcome to Recipe Finder.",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } else {
      // Login: Get existing user
      await OTP.deleteOne({ _id: otpRecord._id });

      const user = await User.findById(otpRecord.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

// POST resend OTP - Handles both login and registration
authRoute.post("/resend-otp", resendOtpRules, async (req, res) => {
  try {
    const { userId, email } = req.body;

    let otpRecord;
    let userName;
    let userEmail;
    let purpose;

    if (userId) {
      // Login resend
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      otpRecord = await OTP.findOne({ userId, purpose: "login" });
      userName = user.name;
      userEmail = user.email;
      purpose = "login";
    } else if (email) {
      // Registration resend
      otpRecord = await OTP.findOne({ email, purpose: "register" });
      if (!otpRecord || !otpRecord.pendingUserData) {
        return res.status(404).json({
          message: "No pending registration found. Please register again.",
        });
      }
      userName = otpRecord.pendingUserData.name;
      userEmail = email;
      purpose = "register";
    } else {
      return res.status(400).json({ message: "userId or email is required" });
    }

    // Rate limiting: Check if OTP was sent recently (within 60 seconds)
    if (otpRecord) {
      const timeSinceCreation = Date.now() - otpRecord.createdAt.getTime();
      if (timeSinceCreation < 60000) {
        const waitTime = Math.ceil((60000 - timeSinceCreation) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitTime} seconds before requesting a new OTP`,
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    if (purpose === "login") {
      // Delete old and create new OTP for login
      await OTP.deleteMany({ userId, purpose: "login" });
      await OTP.create({
        userId,
        email: userEmail,
        otp: hashedOtp,
        purpose: "login",
      });
    } else {
      // Update existing registration OTP (preserve pendingUserData)
      otpRecord.otp = hashedOtp;
      otpRecord.attempts = 0;
      otpRecord.createdAt = new Date();
      await otpRecord.save();
    }

    // Send OTP email
    await sendOTPEmail(userEmail, otp, userName, purpose);

    res.status(200).json({
      message: "New verification code sent to your email",
      otpSent: true,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

module.exports = { authRoute };
