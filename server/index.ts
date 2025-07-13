import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import { promisify } from "util";
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';

const execAsync = promisify(exec);

const app = express();

// 1. CORS - разрешаем кросс-доменные запросы ПЕРВЫМ
const allowedOrigins = [
  "https://econest-q3hj.onrender.com", // frontend origin
  "http://localhost:5173",             // для локальной разработки
  "http://localhost:5000",             // для Replit
  "http://127.0.0.1:5000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 2. Сессии - ПОСЛЕ CORS
const PGStore = connectPgSimple(session);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // для Neon / Render
  },
});

app.use(
  session({
    store: new PGStore({ 
      pool,
      createTableIfMissing: true, // Автоматически создаст таблицу sessions
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key-very-long-and-secure',
    resave: false,
    saveUninitialized: false,
    name: 'econest.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',           // HTTPS в production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',       // кросс-доменные запросы
      maxAge: 1000 * 60 * 60, // 1 час
    },
  })
);

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
  const server = await registerRoutes(app);
  
  // Start server first, then run migration in background
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log(`🚀 Server running on port ${port}`);
    
    // Run migration in background after server starts
    if (process.env.AUTO_MIGRATE === 'true') {
      console.log('📦 Starting background database migration...');
      execAsync('npm run db:push')
        .then(() => log("Database migration completed successfully"))
        .catch(error => log("Database migration failed:", error.message));
    }
  });

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
  
  // Check if we're running from dist (production build) or directly via tsx (development)
  const isProductionBuild = process.argv[1]?.includes('dist/index.js');
  
  if (!isProductionBuild && process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
