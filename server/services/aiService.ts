import { storage } from "../storage";
import type { InsertPrediction, InsertRecommendation, InsertCO2Insight } from "@shared/schema";
import { weatherService } from "./weatherService";
import OpenAI from "openai";

interface ConsumptionData {
  water?: number;
  electricity?: number;
  gas?: number;
}

interface CO2FootprintData {
  total: number;
  breakdown: {
    electricity: number;
    gas: number;
    water: number;
  };
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  // Simple ML-like prediction algorithm
  async generatePrediction(userId: string, type: string): Promise<any> {
    try {
      // Get historical data for the user
      const readings = await storage.getUserConsumptionReadings(userId, type, 12);
      
      if (readings.length < 3) {
        // Not enough data for prediction
        return null;
      }

      const amounts = readings.map(r => parseFloat(r.amount));
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Simple trend analysis
      const recent = amounts.slice(0, 3);
      const older = amounts.slice(3, 6);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
      
      const trend = recentAvg - olderAvg;
      
      // Predict next month with seasonal adjustment and trend
      const seasonalMultiplier = this.getSeasonalMultiplier(type, new Date().getMonth());
      const predictedAmount = (average + trend * 0.5) * seasonalMultiplier;
      
      // Calculate confidence based on data consistency
      const variance = amounts.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / amounts.length;
      const confidence = Math.max(0.3, Math.min(0.95, 1 - (variance / average * 2)));
      
      const predictionData: InsertPrediction = {
        userId,
        type,
        predictedAmount: predictedAmount.toFixed(2),
        confidence: confidence.toFixed(4),
        predictionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };
      
      return await storage.createPrediction(predictionData);
    } catch (error) {
      console.error("Error generating prediction:", error);
      throw error;
    }
  }

  private getSeasonalMultiplier(type: string, month: number): number {
    // Seasonal adjustments based on resource type and month (0-11)
    const winter = [11, 0, 1, 2]; // Dec, Jan, Feb, Mar
    const summer = [5, 6, 7, 8]; // Jun, Jul, Aug, Sep
    
    switch (type) {
      case 'electricity':
        if (winter.includes(month)) return 1.2; // Higher heating in winter
        if (summer.includes(month)) return 1.1; // Higher cooling in summer
        return 1.0;
      case 'gas':
        if (winter.includes(month)) return 1.4; // Much higher heating in winter
        return 0.8; // Lower in warmer months
      case 'water':
        if (summer.includes(month)) return 1.1; // Higher usage in summer
        return 1.0;
      default:
        return 1.0;
    }
  }

  // Generate AI-powered recommendations using OpenAI
  async generateAIRecommendations(userId: string): Promise<any[]> {
    try {
      // Get user's consumption data
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 6);
      
      if (readings.length === 0) {
        return this.generateRecommendations(userId); // Fallback to basic recommendations
      }

      // Calculate consumption summary from monthly readings
      const consumptionSummary = readings.reduce((acc, reading) => {
        acc.water += parseFloat(reading.water || '0');
        acc.electricity += parseFloat(reading.electricity || '0');
        acc.gas += parseFloat(reading.gas || '0');
        return acc;
      }, { water: 0, electricity: 0, gas: 0 });

      // Get weather context and forecast
      const weatherService = require('./weatherService').weatherService;
      let weatherContext = "";
      
      try {
        const weather = await weatherService.getCurrentWeatherByRegion("Almaty");
        const forecast = await weatherService.getWeatherForecast("Almaty", 7);
        
        if (weather) {
          weatherContext = `Current weather in Almaty: ${weather.temperature}°C, ${weather.description}. ${weather.impact}`;
          
          if (forecast && forecast.length > 0) {
            const nextWeekTemp = forecast.slice(1, 4).map((f: any) => f.temperature || f.temp || weather.temperature).reduce((a: number, b: number) => a + b, 0) / 3;
            const tempTrend = nextWeekTemp > weather.temperature ? "warmer" : "cooler";
            weatherContext += ` Weather forecast: Next 3 days will be ${tempTrend} (avg ${Math.round(nextWeekTemp)}°C).`;
          }
        }
      } catch (e) {
        // Weather service unavailable, continue without weather context
        weatherContext = "Weather data unavailable, using general seasonal recommendations.";
      }

      const prompt = `
        IMPORTANT: Respond ONLY in English. Do not use any other language.

        Analyze the user's resource consumption data and provide 3-5 personalized recommendations to reduce consumption and environmental footprint.

        Consumption data for the last 6 months:
        - Electricity: ${consumptionSummary.electricity || 0} kWh
        - Water: ${consumptionSummary.water || 0} m³
        - Gas: ${consumptionSummary.gas || 0} m³

        Weather context: ${weatherContext}

        Requirements for recommendations:
        1. Write ALL text in English language only
        2. Specific and actionable advice based on current and forecasted weather
        3. Potential savings in dollars per month (estimate realistic amounts)
        4. Environmental impact consideration
        5. Priority level (high/medium/low)
        6. Consider both current weather and upcoming weather forecast for seasonal recommendations
        7. Reference specific weather conditions in your recommendations when relevant

        Respond in JSON format with ALL text in English:
        {
          "recommendations": [
            {
              "title": "Brief English title",
              "description": "Detailed English action description that references weather when relevant",
              "category": "electricity/water/gas/general",
              "potentialSavings": "15-25",
              "priority": "high/medium/low"
            }
          ]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in ecology and energy conservation. You MUST respond ONLY in English language - never use Russian, Kazakh, or any other language. Provide practical advice for users to reduce their environmental impact and save money on utilities. Consider current weather conditions and weather forecasts in your recommendations to make them more relevant and actionable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const aiResult = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      // Save AI recommendations to database
      const savedRecommendations = [];
      for (const rec of aiResult.recommendations) {
        const recommendation: InsertRecommendation = {
          userId,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          potentialSavings: typeof rec.potentialSavings === 'number' ? rec.potentialSavings : parseFloat(rec.potentialSavings) || 0,
          priority: rec.priority
        };
        
        const saved = await storage.createRecommendation(recommendation);
        savedRecommendations.push(saved);
      }

      return savedRecommendations;
    } catch (error) {
      console.error("AI recommendations error:", error);
      // Fallback to basic recommendations if AI fails
      return this.generateRecommendations(userId);
    }
  }

  async generateRecommendations(userId: string): Promise<any[]> {
    try {
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 30);
      const user = await storage.getUser(userId);
      
      const recommendations: InsertRecommendation[] = [];
      
      // Analyze consumption patterns
      const consumptionByType = readings.reduce((acc, reading) => {
        if (!acc[reading.type]) acc[reading.type] = [];
        acc[reading.type].push(parseFloat(reading.amount));
        return acc;
      }, {} as Record<string, number[]>);

      // Generate recommendations based on consumption patterns
      for (const [type, amounts] of Object.entries(consumptionByType)) {
        const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const recent = amounts.slice(0, 5);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        
        if (recentAvg > average * 1.1) {
          // Usage increased significantly
          const recommendation = this.getIncreaseRecommendation(type, recentAvg, average);
          if (recommendation) {
            recommendations.push({
              userId,
              ...recommendation,
            });
          }
        } else if (recentAvg < average * 0.9) {
          // Good conservation
          const recommendation = this.getConservationPraise(type, average - recentAvg);
          if (recommendation) {
            recommendations.push({
              userId,
              ...recommendation,
            });
          }
        }
      }

      // Add general recommendations
      const generalRecs = this.getGeneralRecommendations(userId);
      recommendations.push(...generalRecs);

      // Save recommendations to database
      const savedRecommendations = [];
      for (const rec of recommendations.slice(0, 5)) { // Limit to 5 recommendations
        try {
          const saved = await storage.createRecommendation(rec);
          savedRecommendations.push(saved);
        } catch (error) {
          console.error("Error saving recommendation:", error);
        }
      }

      return savedRecommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }

  private getIncreaseRecommendation(type: string, current: number, average: number): Partial<InsertRecommendation> | null {
    const increase = ((current - average) / average * 100).toFixed(1);
    const savings = (current - average).toFixed(1);
    
    switch (type) {
      case 'electricity':
        return {
          title: `Electricity usage increased by ${increase}%`,
          description: `Your electricity consumption is higher than usual. Consider adjusting your thermostat by 2°C and unplugging devices when not in use.`,
          category: 'energy',
          potentialSavings: savings,
          priority: 'high',
        };
      case 'water':
        return {
          title: `Water usage increased by ${increase}%`,
          description: `Your water consumption is above average. Check for leaks and consider shorter showers to reduce usage.`,
          category: 'water',
          potentialSavings: savings,
          priority: 'medium',
        };
      case 'gas':
        return {
          title: `Gas usage increased by ${increase}%`,
          description: `Your gas consumption is higher than usual. Consider lowering your heating temperature and improving home insulation.`,
          category: 'gas',
          potentialSavings: savings,
          priority: 'high',
        };
      default:
        return null;
    }
  }

  private getConservationPraise(type: string, savings: number): Partial<InsertRecommendation> | null {
    const savingsStr = savings.toFixed(1);
    
    return {
      title: `Great job on ${type} conservation! 🌱`,
      description: `You've saved ${savingsStr} units compared to your average. Keep up the excellent work!`,
      category: 'general',
      potentialSavings: savingsStr,
      priority: 'low',
    };
  }

  private getGeneralRecommendations(userId: string): InsertRecommendation[] {
    const tips = [
      {
        title: "Peak hours optimization",
        description: "Shift your high-energy activities to off-peak hours (11 PM - 6 AM) to save on electricity costs.",
        category: "energy",
        potentialSavings: "15.00",
        priority: "medium" as const,
      },
      {
        title: "Smart home integration",
        description: "Consider installing smart thermostats and LED bulbs to automatically optimize your energy usage.",
        category: "energy",
        potentialSavings: "25.00",
        priority: "low" as const,
      },
      {
        title: "Water-efficient appliances",
        description: "Upgrade to water-efficient appliances and fixtures to reduce your water consumption by up to 20%.",
        category: "water",
        potentialSavings: "30.00",
        priority: "low" as const,
      },
    ];

    return tips.map(tip => ({
      userId,
      ...tip,
    }));
  }

  calculateCO2Footprint(consumption: ConsumptionData): CO2FootprintData {
    // CO2 emission factors (kg CO2 per unit) - water excluded
    const factors = {
      electricity: 0.5, // kg CO2 per kWh
      gas: 2.3, // kg CO2 per m³
      // water excluded from CO2 calculations
    };

    const breakdown = {
      electricity: (consumption.electricity || 0) * factors.electricity,
      gas: (consumption.gas || 0) * factors.gas,
      water: 0, // Water excluded from CO2 calculations
    };

    const total = breakdown.electricity + breakdown.gas; // Water excluded

    return {
      total: parseFloat((total / 1000).toFixed(3)), // Convert to tonnes
      breakdown: {
        electricity: parseFloat((breakdown.electricity / 1000).toFixed(3)),
        gas: parseFloat((breakdown.gas / 1000).toFixed(3)),
        water: parseFloat((breakdown.water / 1000).toFixed(3)), // Will be 0
      },
    };
  }

  // Regional awareness methods
  private getRegionalContext(region: string) {
    const contexts: Record<string, any> = {
      'almaty': {
        name: 'Алматы',
        electricityTip: 'В Алматы зимой потребление электричества увеличивается на 30%.',
        gasTip: 'Горный климат требует эффективного отопления.',
        waterTip: 'В горных районах важно экономить воду.',
        praise: 'Отличный результат в горном климате!',
        winterTip: 'Утеплите окна для защиты от горных холодов.',
        winterTemp: -8
      },
      'astana': {
        name: 'Астана',
        electricityTip: 'В столичном регионе зимы особенно суровые.',
        gasTip: 'Континентальный климат требует больше газа для отопления.',
        waterTip: 'В степном климате важен каждый литр воды.',
        praise: 'Превосходно для столичного региона!',
        winterTip: 'Подготовьтесь к морозам до -20°C.',
        winterTemp: -18
      },
      'shymkent': {
        name: 'Шымкент',
        electricityTip: 'Южный климат мягче, но зимой все равно нужно отопление.',
        gasTip: 'Умеренный климат позволяет экономить на газе.',
        waterTip: 'В южных регионах больше возможностей для экономии воды.',
        praise: 'Отличный результат в южном регионе!',
        winterTip: 'Мягкие зимы позволяют снизить расходы на отопление.',
        winterTemp: -2
      }
    };
    
    return contexts[region] || contexts['astana'];
  }

  async generateCO2Insights(userId: string): Promise<any[]> {
    try {
      // Clear existing CO2 insights
      await storage.clearUserCO2Insights(userId);

      // Get user consumption data
      const consumption = await storage.getUserConsumptionReadings(userId, undefined, 10);
      
      if (consumption.length === 0) {
        return []; // No data to analyze
      }

      // Calculate CO2 emissions
      const co2Factors = {
        electricity: 0.4532, // kg CO2 per kWh
        gas: 2.0425, // kg CO2 per m³
        water: 0.298, // kg CO2 per m³
      };

      let totalCO2 = 0;
      let electricityCO2 = 0;
      let gasCO2 = 0;
      let waterCO2 = 0;

      consumption.forEach((item: any) => {
        electricityCO2 += (parseFloat(item.electricity) || 0) * co2Factors.electricity;
        gasCO2 += (parseFloat(item.gas) || 0) * co2Factors.gas;
        waterCO2 += (parseFloat(item.water) || 0) * co2Factors.water;
      });

      totalCO2 = electricityCO2 + gasCO2 + waterCO2;

      // Get weather context
      let weatherContext = "";
      try {
        const weather = await weatherService.getCurrentWeatherByRegion("Almaty");
        const forecast = await weatherService.getWeatherForecast("Almaty", 7);
        
        if (weather) {
          weatherContext = `Current weather in Almaty: ${weather.temperature}°C, ${weather.description}. ${weather.impact}`;
          
          if (forecast && forecast.length > 0) {
            const nextWeekTemp = forecast.slice(1, 4).map((f: any) => f.temperature || f.temp || weather.temperature).reduce((a: number, b: number) => a + b, 0) / 3;
            const tempTrend = nextWeekTemp > weather.temperature ? "warmer" : "cooler";
            weatherContext += ` Weather forecast: Next 3 days will be ${tempTrend} (avg ${Math.round(nextWeekTemp)}°C).`;
          }
        }
      } catch (error) {
        console.error("Weather service error for CO2 insights:", error);
      }

      // Generate AI analysis using OpenAI
      const prompt = `You are an environmental AI assistant analyzing CO2 emissions data. Please provide EXACTLY 3-4 insights in English only. DO NOT use Russian language.

User's CO2 emissions data:
- Total CO2 emissions: ${totalCO2.toFixed(2)} kg
- Electricity: ${electricityCO2.toFixed(2)} kg CO2
- Gas: ${gasCO2.toFixed(2)} kg CO2  
- Water: ${waterCO2.toFixed(2)} kg CO2

${weatherContext}

Please provide insights about:
1. Overall environmental impact and how it compares to average household
2. Which utility contributes most to CO2 and specific actions to reduce it
3. Weather-related environmental impact and seasonal recommendations
4. Benefits and positive impact the user has made

For each insight, provide:
- title: Brief descriptive title
- description: Detailed explanation and specific recommendations
- category: electricity, gas, water, or environmental
- priority: high, medium, or low
- potentialSavings: Estimated CO2 reduction potential (e.g., "15kg CO2 per month")

Respond in JSON format as an array of insights. Use ONLY English language.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an environmental AI assistant. Always respond in English only. Provide practical, actionable CO2 reduction insights based on consumption data and weather conditions."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const aiResponse = response.choices[0].message.content;
      let insights = [];
      
      try {
        const parsed = JSON.parse(aiResponse || "{}");
        insights = parsed.insights || [];
      } catch (error) {
        console.error("Error parsing AI response:", error);
        insights = [];
      }

      // Save insights to database
      const savedInsights = [];
      for (const insight of insights.slice(0, 4)) { // Limit to 4 insights
        try {
          const insightData: InsertCO2Insight = {
            userId,
            title: insight.title || "Environmental Insight",
            description: insight.description || "Analysis of your environmental impact.",
            category: insight.category || "environmental",
            potentialSavings: insight.potentialSavings || null,
            priority: insight.priority || "medium",
            isRead: false,
          };

          const saved = await storage.createCO2Insight(insightData);
          savedInsights.push(saved);
        } catch (error) {
          console.error("Error saving CO2 insight:", error);
        }
      }

      return savedInsights;
    } catch (error) {
      console.error("Error generating CO2 insights:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
