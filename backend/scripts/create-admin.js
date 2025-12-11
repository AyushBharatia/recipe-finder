/**
 * Admin User Creation/Promotion Script
 *
 * Usage:
 *   Create new admin: node src/scripts/create-admin.js create <email> <password> <name>
 *   Promote existing user: node src/scripts/create-admin.js promote <email>
 *
 * Examples:
 *   node src/scripts/create-admin.js create admin@example.com mypassword123 "Admin User"
 *   node src/scripts/create-admin.js promote existinguser@example.com
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../modules/auth/auth-model");

const DB_URL = process.env.DB_URL;

async function connectDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

async function createAdmin(email, password, name) {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    console.log(`Current role: ${existingUser.role}`);

    if (existingUser.role === "admin") {
      console.log("User is already an admin.");
      return existingUser;
    }

    // Prompt to promote instead
    console.log('Use "promote" command to upgrade this user to admin.');
    return null;
  }

  // Create new admin user
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  console.log("\nAdmin user created successfully!");
  console.log("---------------------------");
  console.log(`Name: ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log(`ID: ${admin._id}`);
  console.log("---------------------------");

  return admin;
}

async function promoteToAdmin(email) {
  const user = await User.findOne({ email });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return null;
  }

  if (user.role === "admin") {
    console.log(`User ${email} is already an admin.`);
    return user;
  }

  user.role = "admin";
  await user.save();

  console.log("\nUser promoted to admin successfully!");
  console.log("---------------------------");
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`ID: ${user._id}`);
  console.log("---------------------------");

  return user;
}

async function listAdmins() {
  const admins = await User.find({ role: "admin" });

  if (admins.length === 0) {
    console.log("No admin users found.");
    return;
  }

  console.log(`\nFound ${admins.length} admin user(s):`);
  console.log("---------------------------");
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.name} (${admin.email})`);
  });
  console.log("---------------------------");
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log("Usage:");
    console.log(
      '  node src/scripts/create-admin.js create <email> <password> <name>'
    );
    console.log("  node src/scripts/create-admin.js promote <email>");
    console.log("  node src/scripts/create-admin.js list");
    process.exit(1);
  }

  await connectDB();

  try {
    switch (command) {
      case "create": {
        const [, email, password, ...nameParts] = args;
        const name = nameParts.join(" ");

        if (!email || !password || !name) {
          console.log("Usage: create <email> <password> <name>");
          console.log('Example: create admin@example.com pass123 "Admin User"');
          process.exit(1);
        }

        await createAdmin(email, password, name);
        break;
      }

      case "promote": {
        const [, email] = args;

        if (!email) {
          console.log("Usage: promote <email>");
          process.exit(1);
        }

        await promoteToAdmin(email);
        break;
      }

      case "list": {
        await listAdmins();
        break;
      }

      default:
        console.log(`Unknown command: ${command}`);
        console.log("Available commands: create, promote, list");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
}

main();
