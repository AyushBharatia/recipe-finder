const { body, param } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

/**
 * Step 1: Define validation rules for adding a favorite
 * - userId: required, string (from params)
 * - recipeId: required, string (from body)
 *
 * Step 2: Combine rules into an array
 * - This array will be used as middleware in the POST /users/:userId/favorites route
 */
const addFavoriteRules = [
  param("userId")
    .isString()
    .withMessage("User ID must be a string")
    .notEmpty()
    .withMessage("User ID is required"),

  body("recipeId")
    .isString()
    .withMessage("Recipe ID must be a string")
    .notEmpty()
    .withMessage("Recipe ID is required"),

  checkValidation,
];

module.exports = addFavoriteRules;
