const Recipe = require("../../modules/recipes/recipes-model");

/**
 * Middleware to check if user owns the recipe or is an admin
 * Must be used after the protect middleware (requires req.user)
 *
 * Attaches the found recipe to req.recipe for reuse in route handler
 *
 * @example
 * router.put('/:id', protect, checkRecipeOwnership, updateRecipe);
 * router.delete('/:id', protect, checkRecipeOwnership, deleteRecipe);
 */
async function checkRecipeOwnership(req, res, next) {
  try {
    const { id } = req.params;

    // Find the recipe
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Allow if user is admin (admin can modify any recipe)
    if (req.user.role === "admin") {
      req.recipe = recipe;
      return next();
    }

    // Check ownership - if recipe has createdBy field, verify it matches current user
    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only modify your own recipes.",
      });
    }

    // For recipes without createdBy (legacy recipes), allow the action
    // This maintains backward compatibility with existing data
    req.recipe = recipe;
    next();
  } catch (error) {
    console.error("Ownership check error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid recipe ID format" });
    }

    res.status(500).json({ message: "Failed to verify ownership" });
  }
}

module.exports = { checkRecipeOwnership };
