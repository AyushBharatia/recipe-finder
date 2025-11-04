const mongoose = require("mongoose");

// Nutrition Subdocument Schema
const nutritionSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      min: [0, "Calories cannot be negative"],
    },
    protein: {
      type: Number,
      min: [0, "Protein cannot be negative"],
    },
    carbs: {
      type: Number,
      min: [0, "Carbs cannot be negative"],
    },
    fat: {
      type: Number,
      min: [0, "Fat cannot be negative"],
    },
  },
  { _id: false } // Don't create separate _id for subdocument
);

// Recipe Schema
// Defines the structure and validation for Recipe documents
const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine type is required"],
      trim: true,
    },
    ingredients: {
      type: [String],
      required: [true, "Ingredients are required"],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "At least one ingredient is required",
      },
    },
    cookTime: {
      type: Number,
      required: [true, "Cook time is required"],
      min: [1, "Cook time must be at least 1 minute"],
    },
    servings: {
      type: Number,
      required: [true, "Number of servings is required"],
      min: [1, "Servings must be at least 1"],
    },
    instructions: {
      type: String,
      trim: true,
    },
    nutrition: {
      type: nutritionSchema,
      default: {},
    },
    imageUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create text index for full-text search on title and ingredients
recipeSchema.index({ title: "text", ingredients: "text" });

// Create indexes for filtering
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ cookTime: 1 });

// Create and export Recipe model
const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;
