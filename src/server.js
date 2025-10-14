require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { recipesRoute } = require("./modules/recipes/recipes-routes");
const { authRoute } = require("./modules/auth/auth-routes");
const { favoritesRoute } = require("./modules/favorites/favorites-routes");

const port = process.env.PORT || 3000;
const hostname = "localhost";

const server = express();

// built-in middlewares to parse request body in application-level
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Health check endpoint
server.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "recipe-finder",
    timestamp: new Date().toISOString(),
  });
});

// Mount all the routes
server.use("/api/recipes", recipesRoute);
server.use("/api/auth", authRoute);
server.use("/api/users", favoritesRoute);

// error-handling middleware to logs the error for debugging.
server.use((error, req, res, next) => {
  console.log(error);
  res.status(500).send("Oops! Internal server error!");
});

// Middleware to handle route not found error.
server.use((req, res, next) => {
  res.status(404).send(`404! ${req.method} ${req.path} Not Found.`);
});

// Start server
server.listen(port, hostname, (error) => {
  if (error) console.log(error.message);
  else console.log(`Server running on http://${hostname}:${port}`);
});
