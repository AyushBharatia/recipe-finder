const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const verifyOtpRules = [
  // userId is required for login, email is required for registration
  // At least one must be present
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  // Custom validation to ensure at least userId or email is provided
  body().custom((value, { req }) => {
    if (!req.body.userId && !req.body.email) {
      throw new Error("Either userId or email is required");
    }
    return true;
  }),
  checkValidation,
];

module.exports = verifyOtpRules;
