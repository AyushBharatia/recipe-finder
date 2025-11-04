const mongoose = require("mongoose");

// MongoDB Connection Middleware
// Connects to MongoDB Atlas using Mongoose
async function connectDB(req, res, next) {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Get database URL from environment variables
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
      throw new Error("DB_URL environment variable is not defined");
    }

    // Connect to MongoDB
    await mongoose.connect(dbUrl);

    console.log("Database connected successfully!");
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw new Error("Database connection failed!");
  }
}

module.exports = connectDB;
