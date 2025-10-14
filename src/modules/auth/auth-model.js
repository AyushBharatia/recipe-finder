const fs = require("fs/promises");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../../data/users.json");

// Helper: Read users from file
async function readUsersFile() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Helper: Write users to file
async function writeUsersFile(users) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Get all users
async function getAllUsers() {
  return await readUsersFile();
}

// Get user by ID
async function getUserById(id) {
  const users = await readUsersFile();
  return users.find((user) => user._id === id);
}

// Get user by email
async function getUserByEmail(email) {
  const users = await readUsersFile();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

// Create new user (register)
async function createUser(data) {
  const users = await readUsersFile();

  // Check if user already exists
  const existingUser = await getUserByEmail(data.email);
  if (existingUser) {
    return null; // User already exists
  }

  const newUser = {
    _id: "u" + Date.now(),
    name: data.name,
    email: data.email,
    password: data.password, // Plain text for Phase 2
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsersFile(users);

  return newUser;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
};
