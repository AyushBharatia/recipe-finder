const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

/**
 * Step 1: Define validation rules for user login
 * - email: required, valid email
 * - password: required, string
 *
 * Step 2: Combine rules into an array
 * - This array will be used as middleware in the POST /auth/login route
 */
const loginRules = [
  body("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .notEmpty()
    .withMessage("Email is required"),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required"),

  checkValidation,
];

module.exports = loginRules;
