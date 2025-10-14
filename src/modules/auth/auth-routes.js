const { Router } = require("express");
const registerRules = require("./middlewares/register-rules");
const loginRules = require("./middlewares/login-rules");
const AuthModel = require("./auth-model");

const authRoute = Router();

// POST register new user
authRoute.post("/register", registerRules, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await AuthModel.createUser({ name, email, password });

    if (!newUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// POST login user
authRoute.post("/login", loginRules, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password (plain text for Phase 2)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user without password and a dummy token
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful",
      token: "dummy-jwt-token-" + Date.now(),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login" });
  }
});

module.exports = { authRoute };
