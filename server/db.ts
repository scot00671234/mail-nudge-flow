import * as schema from "@shared/schema";

// Always export, but conditionally initialize based on environment
let pool: any = null;
let db: any = null;

// In development, use in-memory storage since we don't have a real database
if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'development') {
  // Production: Use Neon database
  const { Pool, neonConfig } = require('@neondatabase/serverless');
  const { drizzle } = require('drizzle-orm/neon-serverless');
  const ws = require("ws");
  
  neonConfig.webSocketConstructor = ws;
  
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn("DATABASE_URL not set. Using fallback for development. Set DATABASE_URL in production.");
  // In development mode, db and pool remain null - storage will use in-memory
  pool = null;
  db = null;
}

export { pool, db };
