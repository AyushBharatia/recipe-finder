const { Router } = require("express");
const addFavoriteRules = require("./middlewares/add-favorite-rules");
const Favorite = require("./favorites-model");
const { protect } = require("../../shared/middlewares/auth");

const favoritesRoute = Router();

// GET user's favorite recipes (protected route)
favoritesRoute.get("/:userId/favorites", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is accessing their own favorites
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only access your own favorites" });
    }

    // Get favorites with populated recipe details
    const favorites = await Favorite.find({ userId }).populate("recipeId");

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    res.status(500).json({ message: "Failed to retrieve favorites" });
  }
});

// POST add recipe to favorites (protected route)
favoritesRoute.post("/:userId/favorites", protect, addFavoriteRules, async (req, res) => {
  try {
    const { userId } = req.params;
    const { recipeId } = req.body;

    // Verify user is adding to their own favorites
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only add to your own favorites" });
    }

    // Create new favorite
    const newFavorite = await Favorite.create({ userId, recipeId });

    // Populate recipe details
    await newFavorite.populate("recipeId");

    res.status(201).json(newFavorite);
  } catch (error) {
    console.error("Add favorite error:", error);

    // Handle duplicate key error (already favorited)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// DELETE remove recipe from favorites (protected route)
favoritesRoute.delete("/:userId/favorites/:recipeId", protect, async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    // Verify user is removing from their own favorites
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only remove from your own favorites" });
    }

    const deletedFavorite = await Favorite.findOneAndDelete({ userId, recipeId });

    if (!deletedFavorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({
      message: "Favorite removed successfully",
      favorite: deletedFavorite,
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = { favoritesRoute };
