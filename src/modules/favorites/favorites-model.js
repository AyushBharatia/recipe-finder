const fs = require("fs/promises");
const path = require("path");

const FAVORITES_FILE = path.join(__dirname, "../../data/favorites.json");

// Helper: Read favorites from file
async function readFavoritesFile() {
  try {
    const data = await fs.readFile(FAVORITES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Helper: Write favorites to file
async function writeFavoritesFile(favorites) {
  try {
    await fs.writeFile(FAVORITES_FILE, JSON.stringify(favorites, null, 2), "utf-8");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Get user favorites
async function getUserFavorites(userId) {
  const favorites = await readFavoritesFile();
  return favorites.filter((fav) => fav.userId === userId);
}

// Check if favorite exists
async function checkFavoriteExists(userId, recipeId) {
  const favorites = await readFavoritesFile();
  return favorites.some((fav) => fav.userId === userId && fav.recipeId === recipeId);
}

// Add favorite
async function addFavorite(userId, recipeId) {
  const favorites = await readFavoritesFile();

  // Check if already exists
  const exists = await checkFavoriteExists(userId, recipeId);
  if (exists) {
    return null; // Already favorited
  }

  const newFavorite = {
    _id: "f" + Date.now(),
    userId,
    recipeId,
    createdAt: new Date().toISOString(),
  };

  favorites.push(newFavorite);
  await writeFavoritesFile(favorites);

  return newFavorite;
}

// Remove favorite
async function removeFavorite(userId, recipeId) {
  const favorites = await readFavoritesFile();
  const index = favorites.findIndex(
    (fav) => fav.userId === userId && fav.recipeId === recipeId
  );

  if (index === -1) {
    return false;
  }

  const deleted = favorites[index];
  favorites.splice(index, 1);
  await writeFavoritesFile(favorites);

  return deleted;
}

module.exports = {
  getUserFavorites,
  checkFavoriteExists,
  addFavorite,
  removeFavorite,
};
