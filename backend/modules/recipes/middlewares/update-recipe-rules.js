const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

/**
 * Step 1: Define validation rules for updating a recipe
 * - All fields are optional (partial update)
 * - title: optional, string
 * - cuisine: optional, string
 * - ingredients: optional, array with at least 1 element
 * - cookTime: optional, positive number
 * - servings: optional, positive integer
 * - instructions: optional, string
 * - imageUrl: optional, valid URL
 *
 * Step 2: Combine rules into an array
 * - This array will be used as middleware in the PUT /recipes/:id route
 */
const updateRecipeRules = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string"),

  body("cuisine")
    .optional()
    .isString()
    .withMessage("Cuisine must be a string"),

  body("ingredients")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Ingredients must be a non-empty array"),

  body("cookTime")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Cook time must be a positive number"),

  body("servings")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Servings must be a positive integer"),

  body("instructions")
    .optional()
    .isString()
    .withMessage("Instructions must be a string"),

  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),

  checkValidation,
];

module.exports = updateRecipeRules;
