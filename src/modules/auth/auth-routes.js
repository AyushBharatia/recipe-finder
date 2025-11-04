const { Router } = require("express");
const registerRules = require("./middlewares/register-rules");
const loginRules = require("./middlewares/login-rules");
const User = require("./auth-model");
const { generateToken } = require("../../shared/utils/jwt");

const authRoute = Router();

// POST register new user
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

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user without password and token
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle duplicate key error (in case unique constraint check fails)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to register user" });
  }
});

// POST login user
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

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user without password and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

module.exports = { authRoute };
