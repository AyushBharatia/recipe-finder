const mongoose = require("mongoose");

// Favorite Schema
// Junction table connecting Users and Recipes
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: [true, "Recipe ID is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound unique index to prevent duplicate favorites
// A user can only favorite a recipe once
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

// Index for faster queries by userId
favoriteSchema.index({ userId: 1 });

// Create and export Favorite model
const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
