const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

/**
 * Step 1: Define validation rules for creating a recipe
 * - title: required, string
 * - cuisine: required, string
 * - ingredients: required, array with at least 1 element
 * - cookTime: required, positive number
 * - servings: required, positive integer
 * - instructions: optional, string
 * - imageUrl: optional, valid URL
 *
 * Step 2: Combine rules into an array
 * - This array will be used as middleware in the POST /recipes route
 */
const createRecipeRules = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required"),

  body("cuisine")
    .isString()
    .withMessage("Cuisine must be a string")
    .notEmpty()
    .withMessage("Cuisine is required"),

  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("Ingredients must be a non-empty array"),

  body("cookTime")
    .isInt({ min: 1 })
    .withMessage("Cook time must be a positive number")
    .notEmpty()
    .withMessage("Cook time is required"),

  body("servings")
    .isInt({ min: 1 })
    .withMessage("Servings must be a positive integer")
    .notEmpty()
    .withMessage("Servings is required"),

  body("instructions")
    .optional()
    .isString()
    .withMessage("Instructions must be a string"),

  body("imageUrl").optional().isURL().withMessage("Image URL must be a valid URL"),

  checkValidation,
];

module.exports = createRecipeRules;
