# Recipe Finder - Full-Stack MERN Application

> **Student:** Ayush Bharatia
> **GitHub:** https://github.com/AyushBharatia/recipe-finder

---

## Overview

Recipe Finder is a full-featured web application built with the MERN stack for browsing and managing recipes. The application features secure user authentication with email-based Multi-Factor Authentication (MFA), Role-Based Access Control (RBAC), and a modern React frontend.

**Key Features:**
- **Recipes Module** - Browse, filter, search, sort, create, update, and delete recipes
- **Auth Module** - Secure user registration and login with OTP-based MFA
- **Favorites Module** - Save and manage favorite recipes (protected routes)
- **MongoDB Integration** - Mongoose schemas with validation and indexes
- **Security** - Password hashing with bcrypt, JWT authentication, MFA via email OTP
- **Advanced Search** - Text search, filtering, sorting, and pagination
- **Image Upload** - Cloudinary integration for recipe images
- **Role-Based Access Control** - Admin and User roles with different permissions

---

## Project Structure

```
recipe-finder/
├── package.json                    # Root package.json (backend dependencies & scripts)
├── .env                            # Environment variables (not committed)
├── README.md                       # This documentation file
│
├── backend/                        # Backend Express API
│   ├── server.js                   # Main application entry point
│   ├── data/
│   │   └── backup/                 # JSON backup/seed files
│   │       ├── recipes.json        # 22 preset recipes
│   │       ├── users.json
│   │       └── favorites.json
│   ├── modules/                    # Feature modules
│   │   ├── recipes/
│   │   │   ├── recipes-model.js    # Mongoose Recipe schema
│   │   │   ├── recipes-routes.js   # Recipe CRUD endpoints
│   │   │   └── middlewares/
│   │   │       ├── create-recipe-rules.js
│   │   │       └── update-recipe-rules.js
│   │   ├── auth/
│   │   │   ├── auth-model.js       # Mongoose User schema (with roles)
│   │   │   ├── auth-routes.js      # Auth endpoints (MFA-enabled)
│   │   │   ├── otp-model.js        # OTP schema with TTL
│   │   │   └── middlewares/
│   │   │       ├── register-rules.js
│   │   │       ├── login-rules.js
│   │   │       ├── verify-otp-rules.js
│   │   │       └── resend-otp-rules.js
│   │   └── favorites/
│   │       ├── favorites-model.js  # Mongoose Favorite schema
│   │       ├── favorites-routes.js # Favorites endpoints
│   │       └── middlewares/
│   │           └── add-favorite-rules.js
│   ├── scripts/
│   │   ├── seed.js                 # Database seeding script
│   │   └── create-admin.js         # Admin user management CLI
│   └── shared/
│       ├── middlewares/
│       │   ├── auth.js             # JWT protect & optionalAuth
│       │   ├── authorize.js        # RBAC middleware
│       │   ├── check-ownership.js  # Recipe ownership check
│       │   ├── check-validation.js # Validation error handler
│       │   ├── connect-db.js       # MongoDB connection
│       │   ├── parse-form-data.js  # FormData parser for uploads
│       │   ├── rate-limit.js       # Rate limiting middleware
│       │   └── upload.js           # Multer file upload handler
│       ├── services/
│       │   ├── cloudinary-service.js  # Image upload/delete
│       │   └── email-service.js       # OTP email sending
│       └── utils/
│           ├── jwt.js              # JWT token functions
│           ├── otp.js              # OTP generation/verification
│           └── errorHandler.js     # Custom error classes
│
└── frontend/                       # React Frontend Application (Vite)
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite configuration
    ├── index.html                  # Entry HTML (in root for Vite)
    └── src/
        ├── App.jsx                 # Main app with React Router
        ├── index.jsx               # Entry point
        ├── pages/                  # Page components
        │   ├── Home.jsx            # Landing page with hero
        │   ├── Login.jsx           # Login form
        │   ├── Register.jsx        # Registration form
        │   ├── VerifyOTP.jsx       # OTP verification page
        │   ├── Recipes.jsx         # Recipe listing with filters
        │   ├── RecipeDetail.jsx    # Single recipe view
        │   ├── CreateRecipe.jsx    # Create recipe form
        │   ├── EditRecipe.jsx      # Edit recipe form
        │   └── Favorites.jsx       # User's favorite recipes
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx      # Navigation with user dropdown
        │   │   ├── Navbar.css
        │   │   ├── ProtectedRoute.jsx # Route guard for auth
        │   │   ├── RoleGuard.jsx   # Role-based UI visibility
        │   │   ├── Message.jsx     # Toast notifications
        │   │   └── Message.css
        │   └── recipes/
        │       ├── RecipeCard.jsx  # Recipe card component
        │       ├── RecipeForm.jsx  # Shared form for create/edit
        │       ├── SearchFilter.jsx # Search and filter controls
        │       └── Recipes.css
        ├── services/
        │   ├── api.js              # Axios instance with interceptors
        │   ├── recipeService.js    # Recipe API calls
        │   ├── authService.js      # Auth API calls
        │   └── favoriteService.js  # Favorites API calls
        ├── context/
        │   └── AuthContext.jsx     # Auth state management
        └── styles/
            ├── App.css
            ├── Home.css
            └── Auth.css
```

---

## Authentication & MFA Flow

Recipe Finder implements secure Multi-Factor Authentication (MFA) using email-based One-Time Passwords (OTP).

### Registration Flow

```
1. User submits registration form (name, email, password)
          ↓
2. Backend validates input and checks if email exists
          ↓
3. Password is hashed and stored temporarily in OTP collection
   (User is NOT created in database yet)
          ↓
4. 6-digit OTP is generated, hashed, and stored in MongoDB
          ↓
5. OTP is sent to user's email via Nodemailer (Gmail SMTP)
          ↓
6. User enters OTP on verification page
          ↓
7. Backend verifies OTP (max 3 attempts, 5-minute expiry)
          ↓
8. On success: User document is created, JWT token is issued
```

### Login Flow

```
1. User submits login form (email, password)
          ↓
2. Backend validates credentials against stored hash
          ↓
3. 6-digit OTP is generated and sent to user's email
          ↓
4. User enters OTP on verification page
          ↓
5. Backend verifies OTP (max 3 attempts, 5-minute expiry)
          ↓
6. On success: JWT token is issued
```

### OTP Security Features

- **Hashed Storage**: OTPs are bcrypt-hashed before storing in database
- **Time-Limited**: OTPs expire after 5 minutes (MongoDB TTL index)
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Rate Limiting**: Resend OTP limited to once per 60 seconds
- **Secure Delivery**: Sent via authenticated SMTP (Gmail App Password)

---

## Role-Based Access Control (RBAC)

### User Roles

| Role | Description |
|------|-------------|
| `user` | Default role for registered users |
| `admin` | Full administrative access |

### Permissions Matrix

| Action | Guest | User | Admin |
|--------|-------|------|-------|
| View preset recipes | Yes | Yes | Yes |
| View own recipes | - | Yes | Yes |
| View all user recipes | No | No | Yes |
| Create recipe | No | Yes | Yes |
| Edit own recipe | - | Yes | Yes |
| Edit any recipe | No | No | Yes |
| Delete own recipe | - | Yes | Yes |
| Delete any recipe | No | No | Yes |
| Manage favorites | No | Yes | Yes |

### Recipe Visibility

- **Preset Recipes**: Visible to everyone (marked with `isPreset: true`)
- **User Recipes**: Private by default, only visible to creator
- **Admin Access**: Admins can view and manage all recipes

### Creating Admin Users

Use the admin management CLI script:

```bash
# Create new admin user
node backend/scripts/create-admin.js create admin@example.com password123 "Admin Name"

# Promote existing user to admin
node backend/scripts/create-admin.js promote user@example.com

# List all admin users
node backend/scripts/create-admin.js list
```

---

## Environment Setup

### 1. Install Dependencies

```bash
# Install backend dependencies (from root)
npm install

# Install frontend dependencies
cd frontend
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

# Email Configuration (Gmail SMTP for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password

# Cloudinary Configuration (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important Notes:**
- Replace MongoDB credentials with your actual MongoDB Atlas credentials
- For Gmail, you need to create an [App Password](https://myaccount.google.com/apppasswords) (requires 2FA enabled)
- Get Cloudinary credentials from your [Cloudinary Dashboard](https://cloudinary.com/console)

### 3. Seed the Database (Optional)

Populate MongoDB with sample data (22 preset recipes + 3 test users):

```bash
npm run seed
```

---

## How to Run

### Backend Server

```bash
# Development mode (with auto-restart via nodemon)
npm run dev

# Production mode
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Application (Vite)

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3001` (opens automatically)

---

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Recipes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/recipes` | Get recipes with filters/search/pagination | Optional |
| GET | `/api/recipes/cuisines` | Get all unique cuisines | No |
| GET | `/api/recipes/:id` | Get recipe by ID | No |
| POST | `/api/recipes` | Create new recipe | Required |
| PUT | `/api/recipes/:id` | Update recipe | Required + Owner/Admin |
| DELETE | `/api/recipes/:id` | Delete recipe | Required + Owner/Admin |

**Query Parameters for GET /api/recipes:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 9)
- `cuisine` - Filter by cuisine (case-insensitive)
- `maxTime` - Filter by max cook time in minutes
- `search` - Text search in title and ingredients
- `sortBy` - Sort field (cookTime, title, createdAt, -createdAt)

### Authentication (MFA-Enabled)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user (sends OTP) |
| POST | `/api/auth/login` | Login user (sends OTP after credential check) |
| POST | `/api/auth/verify-otp` | Verify OTP and receive JWT |
| POST | `/api/auth/resend-otp` | Resend OTP (60s cooldown) |

### Favorites (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/favorites` | Get user's favorites |
| POST | `/api/users/:userId/favorites` | Add recipe to favorites |
| DELETE | `/api/users/:userId/favorites/:recipeId` | Remove from favorites |

---

## Testing with Postman

### Example Requests

**1. Register User**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `{ "otpSent": true, "email": "john@example.com", "isRegistration": true }`

**2. Verify OTP (Registration)**
```
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```
Response: `{ "token": "eyJ...", "user": {...} }`

**3. Login User**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `{ "otpSent": true, "userId": "...", "email": "john@example.com" }`

**4. Verify OTP (Login)**
```
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "userId": "<USER_ID_FROM_LOGIN>",
  "otp": "123456"
}
```
Response: `{ "token": "eyJ...", "user": {...} }`

**5. Get Recipes with Filters**
```
GET http://localhost:3000/api/recipes?cuisine=Italian&maxTime=30&sortBy=cookTime&page=1
```

**6. Create Recipe (Protected)**
```
POST http://localhost:3000/api/recipes
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

{
  "title": "Spaghetti Carbonara",
  "cuisine": "Italian",
  "ingredients": ["spaghetti", "eggs", "bacon", "parmesan"],
  "cookTime": 20,
  "servings": 2,
  "instructions": "1. Cook pasta\n2. Mix eggs and cheese\n3. Combine with hot pasta",
  "nutrition": { "calories": 450, "protein": 20, "carbs": 55, "fat": 18 }
}
```

**7. Add to Favorites (Protected)**
```
POST http://localhost:3000/api/users/<USER_ID>/favorites
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

{
  "recipeId": "<RECIPE_ID>"
}
```

---


## Preset Recipes (22 Total)

The database comes seeded with 22 professionally-written preset recipes across various cuisines:

| # | Recipe | Cuisine | Cook Time |
|---|--------|---------|-----------|
| 1 | Chana Masala | Indian | 35 min |
| 2 | Classic Basil Pesto Pasta | Italian | 25 min |
| 3 | Tacos al Pastor | Mexican | 45 min |
| 4 | Kung Pao Chicken | Chinese | 25 min |
| 5 | Classic Smash Burger | American | 15 min |
| 6 | Authentic Pad Thai | Thai | 30 min |
| 7 | Beef Stroganoff | Russian | 40 min |
| 8 | Chicken Tikka Masala | Indian | 45 min |
| 9 | Greek Moussaka | Greek | 90 min |
| 10 | Teriyaki Glazed Salmon | Japanese | 25 min |
| 11 | Beef Bourguignon | French | 180 min |
| 12 | Korean Bibimbap | Korean | 45 min |
| 13 | Moroccan Lamb Tagine | Moroccan | 120 min |
| 14 | Vietnamese Pho | Vietnamese | 60 min |
| 15 | Spanish Seafood Paella | Spanish | 50 min |
| 16 | Lebanese Falafel | Lebanese | 35 min |
| 17 | Butter Chicken | Indian | 40 min |
| 18 | Tonkotsu Ramen | Japanese | 45 min |
| 19 | Classic Caesar Salad | American | 20 min |
| 20 | Margherita Pizza | Italian | 30 min |
| 21 | Fish and Chips | British | 35 min |
| 22 | Chicken Shawarma | Middle Eastern | 30 min |

Each recipe includes:
- 9-16 ingredients with exact measurements
- 10 detailed step-by-step instructions
- Nutrition information (calories, protein, carbs, fat)
- High-quality Unsplash images

---

## NPM Scripts

```bash
# Backend scripts (from root directory)
npm run dev      # Start backend with nodemon (auto-restart)
npm start        # Start backend in production mode
npm run seed     # Seed database with sample data

# Frontend scripts (from frontend directory)
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

--