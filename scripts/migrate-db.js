import { execSync } from 'child_process';
import * as fs from 'fs';

// Generate a temporary config file that forces auto-apply
const tempConfigContent = `
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres"
  },
  // Force apply all changes
  verbose: true,
  strict: true,
  push: {
    autoApply: true // This forces all changes to be applied without prompting
  }
} satisfies Config;
`;

// Write the temporary config
fs.writeFileSync('drizzle.temp.config.ts', tempConfigContent);

try {
  // Run drizzle-kit push with the temporary config
  console.log('Running database migration...');
  execSync('npx drizzle-kit push --config=drizzle.temp.config.ts', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary config file
  fs.unlinkSync('drizzle.temp.config.ts');
}