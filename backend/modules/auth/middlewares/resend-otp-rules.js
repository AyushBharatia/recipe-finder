const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const resendOtpRules = [
  // userId is required for login resend, email is required for registration resend
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format"),
  // Custom validation to ensure at least userId or email is provided
  body().custom((value, { req }) => {
    if (!req.body.userId && !req.body.email) {
      throw new Error("Either userId or email is required");
    }
    return true;
  }),
  checkValidation,
];

module.exports = resendOtpRules;
