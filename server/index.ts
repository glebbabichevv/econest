import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import { promisify } from "util";
import cookieSession from 'cookie-session';
import cors from 'cors';

const execAsync = promisify(exec);

const app = express();

// 1. CORS - обязательно для кросс-доменных запросов
app.use(cors({
  origin: [
    "https://econest-q3hj.onrender.com", // frontend origin
    "http://localhost:5173",             // для локальной разработки
    "http://localhost:5000",             // для Replit
    "http://127.0.0.1:5000"
  ],
  credentials: true // обязательно для передачи cookies
}));

// 2. Cookie-based сессии для лучшей кросс-доменной работы
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'dev-secret-key-very-long-and-secure'],
  maxAge: 24 * 60 * 60 * 1000, // 24 часа
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // кросс-домен только в production
  secure: process.env.NODE_ENV === 'production', // HTTPS только в production
  httpOnly: true // дополнительная безопасность
}));

// 3. Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Auto-migrate database on startup if AUTO_MIGRATE is set
  if (process.env.AUTO_MIGRATE === 'true') {
    console.log('📦 Starting database migration...');
    log("Auto-migrating database...");
    try {
      await execAsync('npm run db:push');
      log("Database migration completed successfully");
      
      // Verify tables exist
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      const tables = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      log("Tables in database:", tables.rows.map(r => r.table_name));
      
      // Test users table specifically
      try {
        const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
        log("Users table accessible, count:", userCount.rows[0]?.count || 0);
      } catch (error) {
        log("❌ Users table test failed:", error.message);
      }
      
      // If no tables, force creation
      if (tables.rows.length === 0) {
        log("No tables found, attempting to create schema...");
        await execAsync('npm run db:push --force');
        log("Force schema creation completed");
      }
    } catch (error) {
      log("Database migration failed:", error.message);
      log("Continuing startup without migration...");
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    console.error('Express error:', err);
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment or fallback to 5000
  const port = process.env.PORT || 5000;
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
    console.log(`✅ Server is running on port ${port}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    console.log(`✅ Server bound to 0.0.0.0:${port}`);
  });
})();
