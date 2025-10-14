const fs = require("fs/promises");
const path = require("path");

const RECIPES_FILE = path.join(__dirname, "../../data/recipes.json");

// Helper: Read recipes from file
async function readRecipesFile() {
  try {
    const data = await fs.readFile(RECIPES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Helper: Write recipes to file
async function writeRecipesFile(recipes) {
  try {
    await fs.writeFile(RECIPES_FILE, JSON.stringify(recipes, null, 2), "utf-8");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Get all recipes
async function getAllRecipes() {
  return await readRecipesFile();
}

// Get recipe by ID
async function getRecipeById(id) {
  const recipes = await readRecipesFile();
  return recipes.find((recipe) => recipe._id === id);
}

// Filter recipes by cuisine, maxTime, and ingredients
async function filterRecipes({ cuisine, maxTime, ingredients }) {
  let recipes = await readRecipesFile();

  if (cuisine) {
    recipes = recipes.filter(
      (r) => r.cuisine?.toLowerCase() === String(cuisine).toLowerCase()
    );
  }

  if (maxTime) {
    const mt = parseInt(maxTime);
    if (!isNaN(mt)) {
      recipes = recipes.filter((r) => (r.cookTime || 0) <= mt);
    }
  }

  if (ingredients) {
    const wanted = String(ingredients)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (wanted.length) {
      recipes = recipes.filter((r) => {
        const have = (r.ingredients || []).map((i) => i.toLowerCase());
        return wanted.every((w) => have.includes(w));
      });
    }
  }

  return recipes;
}

// Add new recipe
async function addNewRecipe(data) {
  const recipes = await readRecipesFile();

  const newRecipe = {
    _id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  await writeRecipesFile(recipes);

  return newRecipe;
}

// Update existing recipe
async function updateExistingRecipe(id, data) {
  const recipes = await readRecipesFile();
  const index = recipes.findIndex((r) => r._id === id);

  if (index === -1) {
    return null;
  }

  recipes[index] = {
    ...recipes[index],
    ...data,
    _id: id, // Preserve original ID
    updatedAt: new Date().toISOString(),
  };

  await writeRecipesFile(recipes);
  return recipes[index];
}

// Delete recipe
async function deleteRecipe(id) {
  const recipes = await readRecipesFile();
  const index = recipes.findIndex((r) => r._id === id);

  if (index === -1) {
    return false;
  }

  const deleted = recipes[index];
  recipes.splice(index, 1);
  await writeRecipesFile(recipes);

  return deleted;
}

module.exports = {
  getAllRecipes,
  getRecipeById,
  filterRecipes,
  addNewRecipe,
  updateExistingRecipe,
  deleteRecipe,
};
