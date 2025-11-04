require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import models
const User = require("../modules/auth/auth-model");
const Recipe = require("../modules/recipes/recipes-model");
const Favorite = require("../modules/favorites/favorites-model");

// Database Seeding Script
// Populates MongoDB with sample data from JSON files
// Usage: node src/scripts/seed.js

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Connect to MongoDB
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error("DB_URL environment variable is not defined");
    }

    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Favorite.deleteMany({});
    console.log("Existing data cleared");

    // Read JSON files
    const usersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/backup/users.json"), "utf-8")
    );
    const recipesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/backup/recipes.json"), "utf-8")
    );
    const favoritesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/backup/favorites.json"), "utf-8")
    );

    // Seed Users
    console.log("Seeding users...");
    const userMap = {}; // Map old IDs to new ObjectIds
    for (const userData of usersData) {
      const { _id: oldId, ...rest } = userData;
      const user = await User.create(rest);
      userMap[oldId] = user._id;
      console.log(`Created user: ${user.email}`);
    }

    // Seed Recipes
    console.log("Seeding recipes...");
    const recipeMap = {}; // Map old IDs to new ObjectIds
    for (const recipeData of recipesData) {
      const { _id: oldId, ...rest } = recipeData;
      const recipe = await Recipe.create(rest);
      recipeMap[oldId] = recipe._id;
      console.log(`Created recipe: ${recipe.title}`);
    }

    // Seed Favorites
    console.log("Seeding favorites...");
    for (const favoriteData of favoritesData) {
      const userId = userMap[favoriteData.userId];
      const recipeId = recipeMap[favoriteData.recipeId];

      if (userId && recipeId) {
        const favorite = await Favorite.create({ userId, recipeId });
        console.log(`Created favorite: User ${userId} -> Recipe ${recipeId}`);
      } else {
        console.log(`Skipping favorite: User or Recipe not found`);
      }
    }

    console.log("\nDatabase seeded successfully!");
    console.log(`Users created: ${Object.keys(userMap).length}`);
    console.log(`Recipes created: ${Object.keys(recipeMap).length}`);
    console.log(`Favorites created: ${favoritesData.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
