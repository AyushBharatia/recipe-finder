# Recipe Finder - Phase 3: MongoDB Integration

> **Student:** Ayush Bharatia
> **GitHub:** https://github.com/AyushBharatia/recipe-finder

---

## Overview

Recipe Finder is a full-featured RESTful API built with the MERN stack for browsing and managing recipes. Phase 3 integrates MongoDB Atlas for persistent data storage, implements JWT-based authentication, and adds advanced search capabilities.

**Key Features:**
- **Recipes Module** - Browse, filter, search, sort, create, update, and delete recipes
- **Auth Module** - Secure user registration and login with JWT tokens
- **Favorites Module** - Save and manage favorite recipes (protected routes)
- **MongoDB Integration** - Mongoose schemas with validation and indexes
- **Security** - Password hashing with bcrypt, JWT authentication middleware
- **Advanced Search** - Text search, filtering, sorting, and pagination

---

## Project Structure

```
src/
├── server.js                                    # Main application entry point
├── data/
│   └── backup/                                  # JSON backup files
│       ├── recipes.json
│       ├── users.json
│       └── favorites.json
├── shared/                                      # Shared utilities
│   ├── middlewares/
│   │   ├── check-validation.js                 # Validation error handler
│   │   ├── connect-db.js                       # MongoDB connection
│   │   └── auth.js                             # JWT authentication
│   └── utils/
│       ├── jwt.js                              # JWT token functions
│       └── errorHandler.js                     # Custom error classes
├── modules/                                     # Feature modules
│   ├── recipes/
│   │   ├── recipes-model.js                    # Mongoose Recipe schema
│   │   ├── recipes-routes.js                   # Recipe endpoints
│   │   └── middlewares/
│   │       ├── create-recipe-rules.js
│   │       └── update-recipe-rules.js
│   ├── auth/
│   │   ├── auth-model.js                       # Mongoose User schema
│   │   ├── auth-routes.js                      # Auth endpoints
│   │   └── middlewares/
│   │       ├── register-rules.js
│   │       └── login-rules.js
│   └── favorites/
│       ├── favorites-model.js                  # Mongoose Favorite schema
│       ├── favorites-routes.js                 # Favorites endpoints
│       └── middlewares/
│           └── add-favorite-rules.js
└── scripts/
    └── seed.js                                 # Database seeding script
```

---

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000

# MongoDB Atlas Connection
DB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/recipe-finder?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
```

**Important:** Replace `<username>`, `<password>`, and cluster URL with your actual MongoDB Atlas credentials.

### 3. Seed the Database (Optional)
Populate MongoDB with sample data:
```bash
npm run seed
```

---

## How to Run

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

---

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Recipes
- `GET /api/recipes` - Get all recipes with filtering, search, sort, and pagination
  - Query params:
    - `page` - Page number (default: 1)
    - `limit` - Results per page (default: 10)
    - `cuisine` - Filter by cuisine (case-insensitive)
    - `maxTime` - Filter by max cook time in minutes
    - `ingredients` - Filter by ingredients (comma-separated, must have all)
    - `search` - Text search in title and ingredients
    - `sortBy` - Sort field (cookTime, title, createdAt, -createdAt for desc)
- `GET /api/recipes/cuisines` - Get all unique cuisines from database
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Authentication
- `POST /api/auth/register` - Register new user (returns JWT token)
- `POST /api/auth/login` - Login user (returns JWT token)

### Favorites (Protected Routes - Requires JWT)
- `GET /api/users/:userId/favorites` - Get user's favorites
- `POST /api/users/:userId/favorites` - Add recipe to favorites
- `DELETE /api/users/:userId/favorites/:recipeId` - Remove from favorites

---

## Testing with Postman

### Setup
1. Create a new collection called "Recipe Finder"
2. Set base URL: `http://localhost:3000/api`

### Example Requests

**1. Register User**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- Response: Returns user info and JWT token

**2. Login User**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- Response: Returns user info and JWT token
- **Save the token** for protected routes!

**3. Get All Recipes (with filters and search)**
- Method: `GET`
- URL: `http://localhost:3000/api/recipes?search=pasta&cuisine=Italian&maxTime=30&sortBy=cookTime&page=1&limit=5`

**4. Create Recipe**
- Method: `POST`
- URL: `http://localhost:3000/api/recipes`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "title": "Spaghetti Carbonara",
  "cuisine": "Italian",
  "ingredients": ["spaghetti", "eggs", "bacon", "parmesan", "black pepper"],
  "cookTime": 20,
  "servings": 2,
  "instructions": "Cook pasta. Mix eggs and cheese. Combine with hot pasta and bacon.",
  "nutrition": {
    "calories": 450,
    "protein": 20,
    "carbs": 55,
    "fat": 18
  },
  "imageUrl": "https://example.com/carbonara.jpg"
}
```

**5. Get User Favorites (Protected)**
- Method: `GET`
- URL: `http://localhost:3000/api/users/<USER_ID>/favorites`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`

**6. Add Recipe to Favorites (Protected)**
- Method: `POST`
- URL: `http://localhost:3000/api/users/<USER_ID>/favorites`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- Body:
```json
{
  "recipeId": "<RECIPE_OBJECT_ID>"
}
```

---

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

---

## Frontend Integration (Phase 4)

### What Was Implemented

#### 1. Backend: Cuisines API Endpoint
- **File:** `src/modules/recipes/recipes-routes.js`
- Added `GET /api/recipes/cuisines` endpoint
- Returns all unique cuisines from the database, sorted alphabetically

#### 2. Frontend: Dynamic Cuisine Fetching
- **File:** `frontend/src/services/recipeService.js`
- Added `getCuisines()` function to fetch cuisines from API

#### 3. Frontend: SearchFilter Component
- **File:** `frontend/src/components/recipes/SearchFilter.js`
- Removed hardcoded CUISINES array
- Now fetches cuisines dynamically from the API on component mount

#### 4. Frontend: RecipeForm Component
- **File:** `frontend/src/components/recipes/RecipeForm.js`
- Removed hardcoded CUISINES array
- Fetches cuisines dynamically from API
- Added "Other" option with custom text input for new cuisine types
- Users can add recipes with cuisines not yet in the database (e.g., "Dessert")

#### 5. Database Seeded
- Ran `npm run seed` to populate MongoDB with 6 preset recipes:
  - Chana Masala (Indian)
  - Pesto Pasta (Italian)
  - Tacos al Pastor (Mexican)
  - Kung Pao Chicken (Chinese)
  - Classic Burger (American)
  - Pad Thai (Thai)

### Frontend Project Structure

```
frontend/
├── src/
│   ├── pages/                    # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Recipes.js
│   │   ├── RecipeDetail.js
│   │   ├── CreateRecipe.js
│   │   ├── EditRecipe.js
│   │   └── Favorites.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Message.js
│   │   └── recipes/
│   │       ├── RecipeCard.js
│   │       ├── RecipeForm.js
│   │       └── SearchFilter.js
│   ├── services/
│   │   ├── api.js
│   │   ├── recipeService.js
│   │   ├── authService.js
│   │   └── favoriteService.js
│   ├── context/
│   │   └── AuthContext.js
│   └── App.js
```

### How to Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3001` (or next available port)

---

