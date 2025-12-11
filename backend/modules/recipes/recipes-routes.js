const { Router } = require("express");
const createRecipeRules = require("./middlewares/create-recipe-rules");
const updateRecipeRules = require("./middlewares/update-recipe-rules");
const Recipe = require("./recipes-model");
const { protect, optionalAuth } = require("../../shared/middlewares/auth");
const { checkRecipeOwnership } = require("../../shared/middlewares/check-ownership");
const { handleUpload } = require("../../shared/middlewares/upload");
const { parseFormData } = require("../../shared/middlewares/parse-form-data");
const { uploadImage, deleteImage } = require("../../shared/services/cloudinary-service");

const recipesRoute = Router();

// GET all unique cuisines from recipes (Public)
recipesRoute.get("/cuisines", async (req, res) => {
  try {
    const cuisines = await Recipe.distinct("cuisine");
    res.status(200).json(cuisines.sort());
  } catch (error) {
    console.error("Get cuisines error:", error);
    res.status(500).json({ message: "Failed to retrieve cuisines" });
  }
});

// GET all recipes with optional filters, search, sort, and pagination
// Shows: preset recipes (for everyone) + user's own recipes (if logged in)
recipesRoute.get("/", optionalAuth, async (req, res) => {
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

    // Filter by visibility: preset recipes OR user's own recipes
    if (req.user) {
      // Logged in: show preset recipes + user's own recipes
      query.$or = [
        { isPreset: true },
        { createdBy: req.user._id }
      ];
    } else {
      // Not logged in: show only preset recipes
      query.isPreset = true;
    }

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

// GET recipe by ID (Public)
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

// POST create new recipe (Protected - any authenticated user)
recipesRoute.post("/", protect, handleUpload, parseFormData, createRecipeRules, async (req, res) => {
  try {
    let recipeData = { ...req.body };

    // Handle image upload to Cloudinary
    if (req.file) {
      const { url, publicId } = await uploadImage(req.file.buffer);
      recipeData.imageUrl = url;
      recipeData.cloudinaryId = publicId;
    }

    // Add createdBy from authenticated user
    recipeData.createdBy = req.user._id;

    const newRecipe = await Recipe.create(recipeData);
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

// PUT update recipe by ID (Protected - owner or admin only)
recipesRoute.put("/:id", protect, checkRecipeOwnership, handleUpload, parseFormData, updateRecipeRules, async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Handle image upload to Cloudinary
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (req.recipe.cloudinaryId) {
        await deleteImage(req.recipe.cloudinaryId);
      }

      // Upload new image
      const { url, publicId } = await uploadImage(req.file.buffer);
      updateData.imageUrl = url;
      updateData.cloudinaryId = publicId;
    }

    // req.recipe is already fetched and validated by checkRecipeOwnership
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return updated doc and run validators
    );

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

// DELETE recipe by ID (Protected - owner or admin only)
recipesRoute.delete("/:id", protect, checkRecipeOwnership, async (req, res) => {
  try {
    // Delete image from Cloudinary if exists
    if (req.recipe.cloudinaryId) {
      await deleteImage(req.recipe.cloudinaryId);
    }

    // req.recipe is already fetched and validated by checkRecipeOwnership
    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Recipe deleted successfully",
      recipe: req.recipe,
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
