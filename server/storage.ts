import {
  users,
  consumptionReadings,
  predictions,
  recommendations,
  co2Insights,
  regionalStats,
  type User,
  type UpsertUser,
  type ConsumptionReading,
  type InsertConsumptionReading,
  type Prediction,
  type InsertPrediction,
  type Recommendation,
  type InsertRecommendation,
  type CO2Insight,
  type InsertCO2Insight,
  type RegionalStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Consumption readings
  createConsumptionReading(reading: InsertConsumptionReading): Promise<ConsumptionReading>;
  getUserConsumptionReadings(userId: string, type?: string, limit?: number): Promise<ConsumptionReading[]>;
  getConsumptionByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ConsumptionReading[]>;
  
  // Predictions
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getUserPredictions(userId: string, limit?: number): Promise<Prediction[]>;
  
  // Recommendations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getUserRecommendations(userId: string, unreadOnly?: boolean): Promise<Recommendation[]>;
  markRecommendationAsRead(id: number): Promise<void>;
  clearUserRecommendations(userId: string): Promise<void>;
  
  // CO2 Insights
  createCO2Insight(insight: InsertCO2Insight): Promise<CO2Insight>;
  getUserCO2Insights(userId: string, unreadOnly?: boolean): Promise<CO2Insight[]>;
  clearUserCO2Insights(userId: string): Promise<void>;
  
  // Leaderboards
  getRegionalStats(month: string): Promise<RegionalStats[]>;
  updateRegionalStats(region: string, month: string, stats: Partial<RegionalStats>): Promise<void>;
  
  // User roles and registration
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithRole(userData: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string, additionalData?: Partial<User>): Promise<User>;
  completeUserRegistration(userId: string, data: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Consumption readings
  async createConsumptionReading(reading: InsertConsumptionReading): Promise<ConsumptionReading> {
    // Check if reading for this month/year already exists
    const existingReading = await db
      .select()
      .from(consumptionReadings)
      .where(
        and(
          eq(consumptionReadings.userId, reading.userId),
          eq(consumptionReadings.month, reading.month),
          eq(consumptionReadings.year, reading.year),
          reading.weekNumber ? eq(consumptionReadings.weekNumber, reading.weekNumber) : isNull(consumptionReadings.weekNumber)
        )
      )
      .limit(1);

    if (existingReading.length > 0) {
      // Update existing reading
      const [updatedReading] = await db
        .update(consumptionReadings)
        .set({
          ...reading,
          updatedAt: new Date()
        })
        .where(eq(consumptionReadings.id, existingReading[0].id))
        .returning();
      return updatedReading;
    } else {
      // Create new reading
      const [newReading] = await db
        .insert(consumptionReadings)
        .values(reading)
        .returning();
      return newReading;
    }
  }

  async getUserConsumptionReadings(userId: string, type?: string, limit = 50): Promise<ConsumptionReading[]> {
    const readings = await db
      .select()
      .from(consumptionReadings)
      .where(eq(consumptionReadings.userId, userId))
      .orderBy(desc(consumptionReadings.year), desc(consumptionReadings.month))
      .limit(limit);
    
    return readings;
  }

  async getConsumptionByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ConsumptionReading[]> {
    return await db.select().from(consumptionReadings)
      .where(
        and(
          eq(consumptionReadings.userId, userId),
          gte(consumptionReadings.readingDate, startDate),
          lte(consumptionReadings.readingDate, endDate)
        )
      )
      .orderBy(desc(consumptionReadings.readingDate));
  }

  // Predictions
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async getUserPredictions(userId: string, limit = 10): Promise<Prediction[]> {
    return await db.select().from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(desc(predictions.predictionDate))
      .limit(limit);
  }

  // Recommendations
  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const [newRecommendation] = await db.insert(recommendations).values(recommendation).returning();
    return newRecommendation;
  }

  async getUserRecommendations(userId: string, unreadOnly = false): Promise<Recommendation[]> {
    let whereClause = eq(recommendations.userId, userId);
    
    if (unreadOnly) {
      whereClause = and(eq(recommendations.userId, userId), eq(recommendations.isRead, false));
    }
    
    return await db.select().from(recommendations)
      .where(whereClause)
      .orderBy(desc(recommendations.createdAt));
  }

  async markRecommendationAsRead(id: number): Promise<void> {
    await db.update(recommendations).set({ isRead: true }).where(eq(recommendations.id, id));
  }

  async clearUserRecommendations(userId: string): Promise<void> {
    await db.delete(recommendations).where(eq(recommendations.userId, userId));
  }

  // CO2 Insights
  async createCO2Insight(insight: InsertCO2Insight): Promise<CO2Insight> {
    const [newInsight] = await db.insert(co2Insights).values(insight).returning();
    return newInsight;
  }

  async getUserCO2Insights(userId: string, unreadOnly = false): Promise<CO2Insight[]> {
    let whereClause = eq(co2Insights.userId, userId);
    
    if (unreadOnly) {
      whereClause = and(eq(co2Insights.userId, userId), eq(co2Insights.isRead, false));
    }
    
    return await db.select().from(co2Insights)
      .where(whereClause)
      .orderBy(desc(co2Insights.createdAt));
  }

  async clearUserCO2Insights(userId: string): Promise<void> {
    await db.delete(co2Insights).where(eq(co2Insights.userId, userId));
  }

  // Leaderboards
  async getRegionalStats(month: string): Promise<RegionalStats[]> {
    return await db.select().from(regionalStats)
      .where(eq(regionalStats.month, month))
      .orderBy(desc(regionalStats.co2Reduction));
  }

  async updateRegionalStats(region: string, month: string, stats: Partial<RegionalStats>): Promise<void> {
    await db.insert(regionalStats)
      .values({ region, month, ...stats })
      .onConflictDoUpdate({
        target: [regionalStats.region, regionalStats.month],
        set: stats,
      });
  }

  // User roles and registration
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithRole(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserRole(userId: string, role: string, additionalData?: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, ...additionalData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async completeUserRegistration(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, isRegistrationComplete: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
