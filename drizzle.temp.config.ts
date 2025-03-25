
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
