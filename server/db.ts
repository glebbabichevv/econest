import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Clean and validate DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;

// Remove common formatting issues from copy-paste
databaseUrl = databaseUrl
  .replace(/^psql\s*['"`]/, '') // Remove psql command prefix
  .replace(/['"`]$/, '') // Remove trailing quotes
  .replace(/psql%20['"`]/, '') // Remove URL-encoded psql prefix
  .replace(/['"`]$/, '') // Remove trailing quotes again
  .replace(/^['"`]/, '') // Remove leading quotes
  .replace(/['"`]$/, '') // Remove trailing quotes
  .trim();

// Decode URL encoding if present
if (databaseUrl.includes('%20')) {
  databaseUrl = decodeURIComponent(databaseUrl);
}

// Log for debugging (show more details for troubleshooting)
console.log('Original DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('Cleaned DATABASE_URL starts with:', databaseUrl.substring(0, 50) + '...');
console.log('Contains psql prefix:', process.env.DATABASE_URL?.includes('psql'));
console.log('URL encoded characters:', process.env.DATABASE_URL?.includes('%20'));

if (!databaseUrl.startsWith('postgresql://')) {
  throw new Error(
    `Invalid DATABASE_URL format. Expected postgresql://... but got: ${databaseUrl.substring(0, 50)}...`
  );
}

// Test database connection
try {
  const testPool = new Pool({ connectionString: databaseUrl });
  await testPool.query('SELECT NOW()');
  console.log('✅ Database connection test successful');
  testPool.end();
} catch (error) {
  console.error('❌ Database connection test failed:', error.message);
  throw new Error(`Database connection failed: ${error.message}`);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });

// Verify schema tables are available
console.log('📊 Schema tables:', Object.keys(schema));
console.log('📊 Users table:', schema.users ? 'Found' : 'Missing');