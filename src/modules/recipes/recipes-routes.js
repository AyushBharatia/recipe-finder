const { Router } = require("express");
const createRecipeRules = require("./middlewares/create-recipe-rules");
const updateRecipeRules = require("./middlewares/update-recipe-rules");
const RecipeModel = require("./recipes-model");

const recipesRoute = Router();

// Helper: paginate results
function paginate(array, page = 1, limit = 10) {
  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.max(parseInt(limit) || 10, 1);
  const start = (p - 1) * l;
  return {
    page: p,
    limit: l,
    total: array.length,
    results: array.slice(start, start + l),
  };
}

// GET all recipes with optional filters and pagination
recipesRoute.get("/", async (req, res) => {
  try {
    const { page, limit, cuisine, maxTime, ingredients } = req.query;

    // Apply filters
    const filtered = await RecipeModel.filterRecipes({
      cuisine,
      maxTime,
      ingredients,
    });

    // Apply pagination
    const paginated = paginate(filtered, page, limit);

    res.status(200).json(paginated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve recipes" });
  }
});

// GET recipe by ID
recipesRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeModel.getRecipeById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve recipe" });
  }
});

// POST create new recipe
recipesRoute.post("/", createRecipeRules, async (req, res) => {
  try {
    const newRecipe = await RecipeModel.addNewRecipe(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create recipe" });
  }
});

// PUT update recipe by ID
recipesRoute.put("/:id", updateRecipeRules, async (req, res) => {
  try {
    const { id } = req.params;

    const recipeExists = await RecipeModel.getRecipeById(id);
    if (!recipeExists) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const updatedRecipe = await RecipeModel.updateExistingRecipe(id, req.body);

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// DELETE recipe by ID
recipesRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipeExists = await RecipeModel.getRecipeById(id);
    if (!recipeExists) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const deletedRecipe = await RecipeModel.deleteRecipe(id);
    res.status(200).json(deletedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

// GET search recipes (explicit search endpoint)
recipesRoute.get("/search", async (req, res) => {
  try {
    const { page, limit, cuisine, maxTime, ingredients } = req.query;

    // Apply filters
    const filtered = await RecipeModel.filterRecipes({
      cuisine,
      maxTime,
      ingredients,
    });

    // Apply pagination
    const paginated = paginate(filtered, page, limit);

    res.status(200).json(paginated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to search recipes" });
  }
});

module.exports = { recipesRoute };
