const { Router } = require("express");
const createRecipeRules = require("./middlewares/create-recipe-rules");
const updateRecipeRules = require("./middlewares/update-recipe-rules");
const Recipe = require("./recipes-model");

const recipesRoute = Router();

// GET all recipes with optional filters, search, sort, and pagination
recipesRoute.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cuisine,
      maxTime,
      ingredients,
      search,
      sortBy = "-createdAt",
    } = req.query;

    // Build query object
    const query = {};

    // Text search (searches in title and ingredients)
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by cuisine (case-insensitive)
    if (cuisine) {
      query.cuisine = new RegExp(`^${cuisine}$`, "i");
    }

    // Filter by max cook time
    if (maxTime) {
      query.cookTime = { $lte: parseInt(maxTime) };
    }

    // Filter by ingredients (must have all specified ingredients)
    if (ingredients) {
      const ingredientArray = ingredients.split(",").map((i) => i.trim());
      query.ingredients = { $all: ingredientArray };
    }

    // Calculate pagination
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination and sorting
    const recipes = await Recipe.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const total = await Recipe.countDocuments(query);

    res.status(200).json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      results: recipes,
    });
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ message: "Failed to retrieve recipes" });
  }
});

// GET recipe by ID
recipesRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Get recipe error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    res.status(500).json({ message: "Failed to retrieve recipe" });
  }
});

// POST create new recipe
recipesRoute.post("/", createRecipeRules, async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Create recipe error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to create recipe" });
  }
});

// PUT update recipe by ID
recipesRoute.put("/:id", updateRecipeRules, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // Return updated doc and run validators
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Update recipe error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// DELETE recipe by ID
recipesRoute.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecipe = await Recipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({
      message: "Recipe deleted successfully",
      recipe: deletedRecipe,
    });
  } catch (error) {
    console.error("Delete recipe error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

module.exports = { recipesRoute };
