const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

/**
 * Step 1: Define validation rules for user registration
 * - name: required, string, min length 2
 * - email: required, valid email
 * - password: required, string, min length 6
 *
 * Step 2: Combine rules into an array
 * - This array will be used as middleware in the POST /auth/register route
 */
const registerRules = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .notEmpty()
    .withMessage("Email is required"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),

  checkValidation,
];

module.exports = registerRules;
