import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists, skipping creation");
      return;
    }
    
    // Hash password
    const hashedPassword = await hashPassword("admin123");
    
    // Create admin user
    const admin = await storage.createUser({
      username: "admin",
      password: hashedPassword,
      name: "Administrator",
      role: "Admin",
      email: "admin@example.com"
    });
    
    console.log("Admin user created successfully:", admin.id);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdminUser().then(() => {
  console.log("Done");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});