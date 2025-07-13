import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
// Session imports removed - now configured in server/index.ts
import { insertConsumptionReadingSchema, insertRecommendationSchema, users as usersTable } from "@shared/schema";
import { aiService } from "./services/aiService";
import { weatherService } from "./services/weatherService";
import { z } from "zod";
import crypto from "crypto";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Extend the session interface to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Session middleware removed - now configured in server/index.ts

// Auth middleware to check if user is logged in
function requireAuth(req: any, res: any, next: any) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware is now configured in server/index.ts
  
  // Health check endpoint with database tables info
  app.get('/api/health', async (req, res) => {
    try {
      const tables = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      
      res.json({
        status: 'ok',
        database: 'connected',
        tables: tables.rows.map(r => r.table_name),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        database: 'connection_failed',
        error: error.message
      });
    }
  });

  // Force migration endpoint (only works if AUTO_MIGRATE env var is set)
  app.post('/api/force-migrate', async (req, res) => {
    if (process.env.AUTO_MIGRATE !== 'true') {
      return res.status(403).json({ message: 'Migration not enabled' });
    }
    
    try {
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);
      
      await execAsync('npm run db:push');
      
      // Check tables after migration
      const tables = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      
      res.json({
        status: 'migration_complete',
        tables: tables.rows.map(r => r.table_name)
      });
    } catch (error) {
      res.status(500).json({
        status: 'migration_failed',
        error: error.message
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('GET /api/auth/user - Session ID:', req.sessionID);
      console.log('GET /api/auth/user - Session userId:', req.session?.userId);
      console.log('GET /api/auth/user - Cookie:', req.headers.cookie);
      
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isRegistrationComplete: user.isRegistrationComplete,
        school: user.school,
        className: user.className,
        region: user.region,
        language: user.language
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration attempt:', { 
        firstName: req.body.firstName, 
        email: req.body.email,
        hasPassword: !!req.body.password,
        role: req.body.role,
        region: req.body.region,
        bodyKeys: Object.keys(req.body)
      });
      const { firstName, lastName, email, password, role, region } = req.body;
      
      // Check if user already exists (with error handling for missing tables)
      let existingUser;
      try {
        existingUser = await storage.getUserByEmail(email);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log('Tables not found, user creation will proceed');
          existingUser = null;
        } else {
          throw error;
        }
      }
      
      if (existingUser) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }
      
      // Validate required fields
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "Все поля обязательны для заполнения" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate user ID
      const userId = crypto.randomUUID();

      // Create user
      const userData = {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        region: region || null,
        password: hashedPassword,
        isRegistrationComplete: role !== 'student', // Students need school selection
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = await storage.createUserWithRole(userData);
      console.log('User created successfully:', { id: user.id, email: user.email });
      
      // Простое сохранение без regenerate для лучшей совместимости
      req.session.userId = user.id;
      
      req.session.save((saveErr: any) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: "Session save error" });
        }
        
        console.log('✅ Registration successful, userId saved in session:', req.session.userId);
        res.status(201).json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`, // Добавляем полное имя
            role: user.role,
            region: user.region,
            isRegistrationComplete: user.isRegistrationComplete
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Registration error", details: error.message });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Простое сохранение без regenerate - лучше работает на мобильных
      req.session.userId = user.id;
      
      // Принудительное сохранение сессии
      req.session.save((saveErr: any) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: "Session save error" });
        }
        
        console.log('✅ Login successful, userId saved in session:', req.session.userId);
        console.log('Session ID:', req.sessionID);
        
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`, // Добавляем полное имя
            role: user.role,
            region: user.region,
            isRegistrationComplete: user.isRegistrationComplete
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login error" });
    }
  });

  // Logout endpoint
  app.get('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout error" });
        }
        res.clearCookie('econest.sid', {
          httpOnly: true,
          sameSite: 'lax'
        });
        res.redirect('/');
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout error" });
    }
  });

  // Complete registration for students (school selection)
  app.post('/api/complete-registration', async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { region, language } = req.body;
      
      const updatedUser = await storage.completeUserRegistration(userId, {
        region,
        language
      });

      res.json({ 
        success: true, 
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isRegistrationComplete: updatedUser.isRegistrationComplete,

        }
      });
    } catch (error) {
      console.error("Error completing registration:", error);
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  // Consumption readings
  app.post('/api/consumption', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const data = insertConsumptionReadingSchema.parse({ ...req.body, userId });
      const reading = await storage.createConsumptionReading(data);
      
      // Generate AI predictions and recommendations after new reading
      await aiService.generatePrediction(userId, 'electricity');
      await aiService.generatePrediction(userId, 'water');
      await aiService.generatePrediction(userId, 'gas');
      await aiService.generateAIRecommendations(userId);
      
      res.json(reading);
    } catch (error) {
      console.error("Error creating consumption reading:", error);
      res.status(400).json({ message: "Invalid data", error: error.message });
    }
  });

  app.get('/api/consumption', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { type, limit } = req.query;
      const readings = await storage.getUserConsumptionReadings(
        userId, 
        type as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(readings);
    } catch (error) {
      console.error("Error fetching consumption readings:", error);
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  app.get('/api/consumption/range', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const readings = await storage.getConsumptionByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(readings);
    } catch (error) {
      console.error("Error fetching consumption by range:", error);
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  // Predictions
  app.get('/api/predictions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const predictions = await storage.getUserPredictions(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Generate prediction for specific type
  app.post('/api/predictions', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { type } = req.body;
      
      const prediction = await aiService.generatePrediction(userId, type);
      res.json(prediction);
    } catch (error) {
      console.error("Error generating prediction:", error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  // Recommendations
  app.get('/api/recommendations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Generate AI recommendations
  app.post('/api/recommendations/generate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const recommendations = await aiService.generateRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Clear user recommendations
  app.delete('/api/recommendations/clear', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.clearUserRecommendations(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing recommendations:", error);
      res.status(500).json({ message: "Failed to clear recommendations" });
    }
  });

  // CO2 Insights
  app.get('/api/co2-insights', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const insights = await storage.getUserCO2Insights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching CO2 insights:", error);
      res.status(500).json({ message: "Failed to fetch CO2 insights" });
    }
  });

  // Generate AI CO2 insights
  app.post('/api/co2-insights/generate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const insights = await aiService.generateCO2Insights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating CO2 insights:", error);
      res.status(500).json({ message: "Failed to generate CO2 insights" });
    }
  });

  // Clear user CO2 insights
  app.delete('/api/co2-insights/clear', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await storage.clearUserCO2Insights(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing CO2 insights:", error);
      res.status(500).json({ message: "Failed to clear CO2 insights" });
    }
  });

  // Weather data by region
  app.get("/api/weather/:region", async (req, res) => {
    try {
      const { region } = req.params;
      const weatherData = await weatherService.getCurrentWeatherByRegion(region);
      
      if (!weatherData) {
        return res.status(404).json({ message: "Weather data not found for this region" });
      }
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Mark recommendation as read
  app.patch('/api/recommendations/:id/read', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markRecommendationAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking recommendation as read:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent consumption readings
      const consumptionReadings = await storage.getUserConsumptionReadings(userId, undefined, 30);
      
      // Calculate current month consumption from monthly readings
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const thisMonthReading = consumptionReadings.find(reading => 
        reading.month === currentMonth && reading.year === currentYear
      );
      
      const consumption = {
        water: thisMonthReading ? parseFloat(thisMonthReading.water || '0') : 0,
        electricity: thisMonthReading ? parseFloat(thisMonthReading.electricity || '0') : 0,
        gas: thisMonthReading ? parseFloat(thisMonthReading.gas || '0') : 0
      };
      
      // Calculate CO2 footprint
      const co2Footprint = aiService.calculateCO2Footprint(consumption).total;
      
      // Get latest predictions
      const predictions = await storage.getUserPredictions(userId, 5);
      
      // Get unread recommendations
      const recommendations = await storage.getUserRecommendations(userId, true);

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          school: user.school,
          className: user.className
        },
        consumption,
        co2Footprint,
        changes: { water: 0, electricity: 0, gas: 0, co2: 0 }, // TODO: Calculate month-over-month changes
        chartData: consumptionReadings || [], // Use all consumption readings for chart
        consumptionReadings,
        predictions,
        recommendations
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // CO2 Footprint calculation
  app.get('/api/footprint', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get recent consumption data
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 30);
      
      // Calculate total consumption from monthly readings
      const consumption = readings.reduce((acc: any, reading) => {
        acc.water += parseFloat(reading.water || '0');
        acc.electricity += parseFloat(reading.electricity || '0');
        acc.gas += parseFloat(reading.gas || '0');
        return acc;
      }, { water: 0, electricity: 0, gas: 0 });

      // Calculate CO2 footprint
      const carbonFootprint = aiService.calculateCO2Footprint(consumption);

      res.json({ carbonFootprint });
    } catch (error) {
      console.error("Error calculating footprint:", error);
      res.status(500).json({ message: "Failed to calculate footprint" });
    }
  });

  // Weather data
  app.get('/api/weather', async (req, res) => {
    try {
      const { location = 'Almaty' } = req.query;
      const weather = await weatherService.getCurrentWeather(location as string);
      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/regions', async (req, res) => {
    try {
      const { month = new Date().toISOString().slice(0, 7) } = req.query;
      const regions = await storage.getRegionalStats(month as string);
      res.json(regions);
    } catch (error) {
      console.error("Error fetching regional leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch regional data" });
    }
  });



  // CO2 Emissions Leaderboard
  app.get('/api/leaderboard/co2-emissions', requireAuth, async (req, res) => {
    try {
      const users = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role
      }).from(usersTable);

      const leaderboardData = [];

      for (const user of users) {
        const readings = await storage.getUserConsumptionReadings(user.id);
        let totalCO2 = 0;

        readings.forEach(reading => {
          const electricity = parseFloat(reading.electricity || '0');
          const gas = parseFloat(reading.gas || '0');
          
          // CO2 calculation (same as in aiService)
          totalCO2 += electricity * 0.5; // 0.5 kg CO2 per kWh
          totalCO2 += gas * 2.0; // 2.0 kg CO2 per m³
        });

        if (totalCO2 > 0) {
          leaderboardData.push({
            id: user.id,
            name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
            role: user.role,
            totalCO2: Math.round(totalCO2 * 100) / 100,
            readingsCount: readings.length
          });
        }
      }

      // Sort by total CO2 (ascending - lower is better)
      leaderboardData.sort((a, b) => a.totalCO2 - b.totalCO2);

      res.json(leaderboardData);
    } catch (error) {
      console.error("Error fetching CO2 leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch CO2 leaderboard" });
    }
  });

  // Monthly Progress Leaderboard
  app.get('/api/leaderboard/monthly-progress', requireAuth, async (req, res) => {
    try {
      const users = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role
      }).from(usersTable);

      const progressData = [];

      for (const user of users) {
        const readings = await storage.getUserConsumptionReadings(user.id);
        
        if (readings.length < 2) continue; // Need at least 2 months for progress

        // Group by month and calculate CO2
        const monthlyData: Record<string, { electricity: number; gas: number }> = {};
        readings.forEach(reading => {
          const monthKey = `${reading.year}-${String(reading.month).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { electricity: 0, gas: 0 };
          }
          
          monthlyData[monthKey].electricity += parseFloat(reading.electricity || '0');
          monthlyData[monthKey].gas += parseFloat(reading.gas || '0');
        });

        const months = Object.keys(monthlyData).sort();
        if (months.length < 2) continue;

        // Calculate progress between first and last month
        const firstMonth = monthlyData[months[0]];
        const lastMonth = monthlyData[months[months.length - 1]];

        const firstCO2 = firstMonth.electricity * 0.5 + firstMonth.gas * 2.0;
        const lastCO2 = lastMonth.electricity * 0.5 + lastMonth.gas * 2.0;

        const reduction = firstCO2 > 0 ? ((firstCO2 - lastCO2) / firstCO2) * 100 : 0;

        if (Math.abs(reduction) > 0.1) { // Only include meaningful changes
          progressData.push({
            id: user.id,
            name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
            role: user.role,
            reductionPercent: Math.round(reduction * 100) / 100,
            firstMonthCO2: Math.round(firstCO2 * 100) / 100,
            lastMonthCO2: Math.round(lastCO2 * 100) / 100,
            monthsTracked: months.length
          });
        }
      }

      // Sort by reduction percentage (descending - higher reduction is better)
      progressData.sort((a, b) => b.reductionPercent - a.reductionPercent);

      res.json(progressData);
    } catch (error) {
      console.error("Error fetching monthly progress:", error);
      res.status(500).json({ message: "Failed to fetch monthly progress" });
    }
  });

  // Regions CO2 Leaderboard
  app.get('/api/leaderboard/regions', requireAuth, async (req, res) => {
    try {
      const users = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        region: usersTable.region
      }).from(usersTable).where(sql`${usersTable.region} IS NOT NULL`);

      const regionData: Record<string, { totalCO2: number, userCount: number, users: string[] }> = {};

      for (const user of users) {
        const readings = await storage.getUserConsumptionReadings(user.id);
        let userCO2 = 0;

        readings.forEach(reading => {
          const electricity = parseFloat(reading.electricity || '0');
          const gas = parseFloat(reading.gas || '0');
          userCO2 += electricity * 0.5 + gas * 2.0;
        });

        if (userCO2 > 0 && user.region) {
          if (!regionData[user.region]) {
            regionData[user.region] = { totalCO2: 0, userCount: 0, users: [] };
          }
          
          regionData[user.region].totalCO2 += userCO2;
          regionData[user.region].userCount += 1;
          regionData[user.region].users.push(`${user.firstName || 'User'} ${user.lastName || ''}`.trim());
        }
      }

      const regionLeaderboard = Object.entries(regionData).map(([region, data]) => ({
        region,
        totalCO2: Math.round(data.totalCO2 * 100) / 100,
        averageCO2: Math.round((data.totalCO2 / data.userCount) * 100) / 100,
        userCount: data.userCount,
        users: data.users
      })).sort((a, b) => a.totalCO2 - b.totalCO2);

      res.json(regionLeaderboard);
    } catch (error) {
      console.error("Error fetching regions leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch regions leaderboard" });
    }
  });



  // Analytics endpoint for chart data
  app.get('/api/analytics', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { period = 'month' } = req.query;
      
      let startDate = new Date();
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default: // month
          startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const readings = await storage.getConsumptionByDateRange(userId, startDate, new Date());
      
      // Transform readings to match expected chart format
      const chartData = readings.map(reading => ({
        id: reading.id,
        createdAt: reading.createdAt,
        readingDate: reading.readingDate,
        water: parseFloat(reading.water || '0'),
        electricity: parseFloat(reading.electricity || '0'),
        gas: parseFloat(reading.gas || '0'),
        month: reading.month,
        year: reading.year
      }));

      res.json(chartData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // New Leaderboard endpoints with month selection
  app.get("/api/leaderboard/users", requireAuth, async (req: any, res) => {
    try {
      const { month, year } = req.query;
      const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const selectedYear = year ? parseInt(year) : new Date().getFullYear();

      const users = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        role: usersTable.role
      }).from(usersTable);

      const leaderboardData = [];

      for (const user of users) {
        // Get readings for the specific month
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0);
        const readings = await storage.getConsumptionByDateRange(user.id, startDate, endDate);

        let totalCO2 = 0;
        readings.forEach(reading => {
          const electricity = parseFloat(reading.electricity || '0');
          const gas = parseFloat(reading.gas || '0');
          
          // CO2 calculation (excluding water)
          totalCO2 += electricity * 0.5 + gas * 2.0;
        });

        if (totalCO2 > 0) {
          leaderboardData.push({
            id: user.id,
            name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim(),
            role: user.role,
            totalCO2: Math.round(totalCO2 * 100) / 100,
            readingsCount: readings.length
          });
        }
      }

      // Sort by CO2 emissions (ascending - lower is better)
      leaderboardData.sort((a, b) => a.totalCO2 - b.totalCO2);

      res.json(leaderboardData);
    } catch (error) {
      console.error('Error fetching users leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch users leaderboard' });
    }
  });

  app.get("/api/leaderboard/regions-monthly", requireAuth, async (req: any, res) => {
    try {
      const { month, year } = req.query;
      const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const selectedYear = year ? parseInt(year) : new Date().getFullYear();

      // All users now have regions assigned

      const users = await db.select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        region: usersTable.region
      }).from(usersTable);

      const regionData: Record<string, { totalCO2: number, userCount: number, usersWithData: number }> = {};

      for (const user of users) {
        if (!user.region) continue;

        // Get readings for the specific month
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0);
        const readings = await storage.getConsumptionByDateRange(user.id, startDate, endDate);

        let userCO2 = 0;
        readings.forEach(reading => {
          const electricity = parseFloat(reading.electricity || '0');
          const gas = parseFloat(reading.gas || '0');
          userCO2 += electricity * 0.5 + gas * 2.0;
        });

        if (!regionData[user.region]) {
          regionData[user.region] = { totalCO2: 0, userCount: 0, usersWithData: 0 };
        }
        
        regionData[user.region].totalCO2 += userCO2;
        regionData[user.region].userCount += 1;
        if (readings.length > 0) {
          regionData[user.region].usersWithData += 1;
        }
      }

      const regionLeaderboard = Object.entries(regionData).map(([region, data]) => ({
        region,
        totalCO2: Math.round(data.totalCO2 * 100) / 100,
        averageCO2: data.usersWithData > 0 ? Math.round((data.totalCO2 / data.usersWithData) * 100) / 100 : 0,
        userCount: data.userCount,
        usersWithData: data.usersWithData
      })).sort((a, b) => a.totalCO2 - b.totalCO2);

      res.json(regionLeaderboard);
    } catch (error) {
      console.error('Error fetching regions leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch regions leaderboard' });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          message: "Name, email, subject and message are required" 
        });
      }

      // Log contact message (in production, would save to DB or send email)
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        success: true, 
        message: "Message sent successfully" 
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}