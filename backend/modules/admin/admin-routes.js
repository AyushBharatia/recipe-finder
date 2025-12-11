const express = require("express");
const User = require("../auth/auth-model");
const Recipe = require("../recipes/recipes-model");
const { protect } = require("../../shared/middlewares/auth");
const { authorize } = require("../../shared/middlewares/authorize");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// ==================== DASHBOARD STATS ====================

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalRecipes, totalAdmins, presetRecipes] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Recipe.countDocuments({ isPreset: true }),
    ]);

    res.json({
      totalUsers,
      totalRecipes,
      totalAdmins,
      presetRecipes,
      userRecipes: totalRecipes - presetRecipes,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === id && role !== "admin") {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Also delete user's recipes
    await Recipe.deleteMany({ createdBy: id });

    res.json({ message: "User and their recipes deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==================== RECIPE MANAGEMENT ====================

// GET /api/admin/recipes - Get ALL recipes (including private user recipes)
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// DELETE /api/admin/recipes/:id - Delete any recipe
router.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

module.exports = { adminRoute: router };
