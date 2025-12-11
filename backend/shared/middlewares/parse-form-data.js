/**
 * Middleware to parse FormData fields before validation
 * Converts JSON strings back to objects/arrays and numbers
 */
const parseFormData = (req, res, next) => {
  // Only process if content-type is multipart/form-data
  if (req.is('multipart/form-data') || req.file) {
    // Parse ingredients array
    if (typeof req.body.ingredients === 'string') {
      try {
        req.body.ingredients = JSON.parse(req.body.ingredients);
      } catch (e) {
        // Leave as is if not valid JSON
      }
    }

    // Parse nutrition object
    if (typeof req.body.nutrition === 'string') {
      try {
        req.body.nutrition = JSON.parse(req.body.nutrition);
      } catch (e) {
        // Leave as is if not valid JSON
      }
    }

    // Convert numeric strings to numbers
    if (req.body.cookTime) {
      req.body.cookTime = parseInt(req.body.cookTime, 10);
    }
    if (req.body.servings) {
      req.body.servings = parseInt(req.body.servings, 10);
    }
  }

  next();
};

module.exports = { parseFormData };
