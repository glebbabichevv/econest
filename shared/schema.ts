import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For traditional registration
  role: varchar("role").notNull().default("individual"), // individual, company, student
  language: varchar("language").default("en"),
  region: varchar("region"),

  isRegistrationComplete: boolean("is_registration_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Consumption readings - monthly data structure
export const consumptionReadings = pgTable("consumption_readings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  // Monthly consumption data
  electricity: decimal("electricity", { precision: 10, scale: 2 }).default("0"), // kWh
  water: decimal("water", { precision: 10, scale: 2 }).default("0"), // m³
  gas: decimal("gas", { precision: 10, scale: 2 }).default("0"), // m³
  // Date information
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  readingDate: timestamp("reading_date").notNull(),
  // Advanced user settings
  isAdvancedMode: boolean("is_advanced_mode").default(false), // For weekly tracking
  weekNumber: integer("week_number"), // 1-4, only for advanced users
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI predictions
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // water, electricity, gas
  predictedAmount: decimal("predicted_amount", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  predictionDate: timestamp("prediction_date").notNull(),
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // energy, water, gas, general
  potentialSavings: decimal("potential_savings", { precision: 10, scale: 2 }),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

// CO2 environmental insights
export const co2Insights = pgTable("co2_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // electricity, gas, water, environmental
  potentialSavings: text("potential_savings"), // CO2 reduction potential
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

// Regional leaderboard
export const regionalStats = pgTable("regional_stats", {
  id: serial("id").primaryKey(),
  region: varchar("region").notNull(),
  month: varchar("month").notNull(), // YYYY-MM format
  participantCount: integer("participant_count").default(0),
  avgWaterConsumption: decimal("avg_water_consumption", { precision: 10, scale: 2 }),
  avgElectricityConsumption: decimal("avg_electricity_consumption", { precision: 10, scale: 2 }),
  avgGasConsumption: decimal("avg_gas_consumption", { precision: 10, scale: 2 }),
  co2Reduction: decimal("co2_reduction", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});



// Relations
export const usersRelations = relations(users, ({ many }) => ({
  consumptionReadings: many(consumptionReadings),
  predictions: many(predictions),
  recommendations: many(recommendations),
  co2Insights: many(co2Insights),
}));

export const consumptionReadingsRelations = relations(consumptionReadings, ({ one }) => ({
  user: one(users, {
    fields: [consumptionReadings.userId],
    references: [users.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
}));

export const co2InsightsRelations = relations(co2Insights, ({ one }) => ({
  user: one(users, {
    fields: [co2Insights.userId],
    references: [users.id],
  }),
}));



// Insert schemas
export const insertConsumptionReadingSchema = createInsertSchema(consumptionReadings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  electricity: z.union([z.string(), z.number()]).transform(val => String(val)),
  water: z.union([z.string(), z.number()]).transform(val => String(val)),
  gas: z.union([z.string(), z.number()]).transform(val => String(val)),
  readingDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  )
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});



export const insertCO2InsightSchema = createInsertSchema(co2Insights).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ConsumptionReading = typeof consumptionReadings.$inferSelect;
export type InsertConsumptionReading = z.infer<typeof insertConsumptionReadingSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type CO2Insight = typeof co2Insights.$inferSelect;
export type InsertCO2Insight = z.infer<typeof insertCO2InsightSchema>;
export type RegionalStats = typeof regionalStats.$inferSelect;

// Export all tables for Drizzle Kit
export default [
  sessions,
  users,
  consumptionReadings,
  predictions,
  recommendations,
  co2Insights,
  regionalStats
];
