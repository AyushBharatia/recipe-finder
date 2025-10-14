const { Router } = require("express");
const addFavoriteRules = require("./middlewares/add-favorite-rules");
const FavoriteModel = require("./favorites-model");

const favoritesRoute = Router();

// GET user's favorite recipes
favoritesRoute.get("/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await FavoriteModel.getUserFavorites(userId);

    res.status(200).json(favorites);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve favorites" });
  }
});

// POST add recipe to favorites
favoritesRoute.post("/:userId/favorites", addFavoriteRules, async (req, res) => {
  try {
    const { userId } = req.params;
    const { recipeId } = req.body;

    const newFavorite = await FavoriteModel.addFavorite(userId, recipeId);

    if (!newFavorite) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    res.status(201).json(newFavorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// DELETE remove recipe from favorites
favoritesRoute.delete("/:userId/favorites/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const favoriteExists = await FavoriteModel.checkFavoriteExists(userId, recipeId);
    if (!favoriteExists) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    const deletedFavorite = await FavoriteModel.removeFavorite(userId, recipeId);
    res.status(200).json(deletedFavorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

module.exports = { favoritesRoute };
