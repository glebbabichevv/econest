import { storage } from "../storage";
import type { InsertPrediction, InsertRecommendation, InsertCO2Insight } from "@shared/schema";
import { weatherService } from "./weatherService";
import OpenAI from "openai";

interface ConsumptionData {
  coldWater?: number;
  hotWater?: number;
  sewage?: number;
  heating?: number;
  electricity?: number;
  gas?: number;
  // Legacy for compatibility
  water?: number;
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

  // Updated utility rate constants for Kazakhstan (in Tenge)
  private readonly UTILITY_RATES = {
    coldWater: 100, // ₸ per m³
    hotWater: 658, // ₸ per m³ 
    sewage: 130, // ₸ per m³
    heating: 8683, // ₸ per Gcal
    gas: 45, // ₸ per m³
    // Electricity tiered pricing
    electricity: {
      tier1: { limit: 100, rate: 17.98 }, // up to 100 kWh
      tier2: { limit: 180, rate: 23.89 }, // 100-180 kWh  
      tier3: { rate: 26.76 }, // over 180 kWh
    }
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Calculate electricity cost based on tiered pricing
  private calculateElectricityCost(kWh: number): number {
    let cost = 0;
    let remaining = kWh;
    
    // Tier 1: up to 100 kWh
    if (remaining > 0) {
      const tier1Usage = Math.min(remaining, this.UTILITY_RATES.electricity.tier1.limit);
      cost += tier1Usage * this.UTILITY_RATES.electricity.tier1.rate;
      remaining -= tier1Usage;
    }
    
    // Tier 2: 100-180 kWh
    if (remaining > 0) {
      const tier2Limit = this.UTILITY_RATES.electricity.tier2.limit - this.UTILITY_RATES.electricity.tier1.limit;
      const tier2Usage = Math.min(remaining, tier2Limit);
      cost += tier2Usage * this.UTILITY_RATES.electricity.tier2.rate;
      remaining -= tier2Usage;
    }
    
    // Tier 3: over 180 kWh
    if (remaining > 0) {
      cost += remaining * this.UTILITY_RATES.electricity.tier3.rate;
    }
    
    return cost;
  }

  // Calculate monthly cost for all utilities
  private calculateTotalCost(consumption: ConsumptionData): number {
    let totalCost = 0;
    
    if (consumption.coldWater) totalCost += consumption.coldWater * this.UTILITY_RATES.coldWater;
    if (consumption.hotWater) totalCost += consumption.hotWater * this.UTILITY_RATES.hotWater;
    if (consumption.sewage) totalCost += consumption.sewage * this.UTILITY_RATES.sewage;
    if (consumption.heating) totalCost += consumption.heating * this.UTILITY_RATES.heating;
    if (consumption.gas) totalCost += consumption.gas * this.UTILITY_RATES.gas;
    if (consumption.electricity) totalCost += this.calculateElectricityCost(consumption.electricity);
    
    return totalCost;
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

      const amounts = readings.map(r => parseFloat(r.electricity || '0')); // Use electricity as main metric
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
  async generateAIRecommendations(userId: string, language: string = 'en'): Promise<any[]> {
    try {
      // Get user's consumption data
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 6);
      
      if (readings.length === 0) {
        return this.generateFallbackRecommendations(userId); // Fallback to basic recommendations
      }

      // Calculate consumption summary from monthly readings
      const consumptionSummary = readings.reduce((acc, reading) => {
        acc.coldWater += parseFloat(reading.coldWater || '0');
        acc.hotWater += parseFloat(reading.hotWater || '0');
        acc.sewage += parseFloat(reading.sewage || '0');
        acc.heating += parseFloat(reading.heating || '0');
        acc.electricity += parseFloat(reading.electricity || '0');
        acc.gas += parseFloat(reading.gas || '0');
        return acc;
      }, { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 });

      // Calculate monthly averages
      const avgConsumption = Object.keys(consumptionSummary).reduce((acc, key) => {
        acc[key as keyof typeof acc] = consumptionSummary[key as keyof typeof consumptionSummary] / readings.length;
        return acc;
      }, { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 });

      // Calculate current and previous costs
      const currentCost = this.calculateTotalCost(avgConsumption);
      const previousMonthCost = readings.length > 1 ? this.calculateTotalCost({
        coldWater: parseFloat(readings[1].coldWater || '0'),
        hotWater: parseFloat(readings[1].hotWater || '0'),
        sewage: parseFloat(readings[1].sewage || '0'),
        heating: parseFloat(readings[1].heating || '0'),
        electricity: parseFloat(readings[1].electricity || '0'),
        gas: parseFloat(readings[1].gas || '0')
      }) : currentCost;

      // Get weather context (simplified to avoid module issues)
      let weatherContext = "";
      const currentMonth = new Date().getMonth();
      const isWinter = currentMonth < 3 || currentMonth > 10; // Dec, Jan, Feb, Nov
      const isSummer = currentMonth > 4 && currentMonth < 9; // May-Aug
      
      if (isWinter) {
        weatherContext = "Kazakhstan winter period: cold weather increases heating and electricity needs. Focus on insulation and efficient heating.";
      } else if (isSummer) {
        weatherContext = "Kazakhstan summer period: warmer weather reduces heating but may increase electricity for cooling. Good time for energy-saving upgrades.";
      } else {
        weatherContext = "Kazakhstan transition season: moderate weather is ideal for implementing energy-saving measures and home improvements.";
      }

      // Calculate regional averages for comparison (mock data - in future from database)
      const almatyAverages = {
        coldWater: 8.5, // m³
        hotWater: 4.2, // m³
        electricity: 220, // kWh
        gas: 85, // m³
        heating: 1.8, // Gcal
        sewage: 12.7 // m³
      };

      const prompt = `
        IMPORTANT: ${language === 'ru' ? 'Отвечай ТОЛЬКО на русском языке. Используй формальные, профессиональные консультативные паттерны.' : language === 'kk' ? 'Жауапты ТЕКСЕН қазақ тілінде беріңіз. Ресми, кәсіби кеңес беру үлгілерін қолданыңыз.' : 'Respond ONLY in English. Use formal, professional advisory patterns.'}

        ${language === 'ru' ? 'Проанализируйте данные о потреблении ресурсов пользователя и предоставьте 3-5 формальных рекомендаций по оптимизации затрат.' : language === 'kk' ? 'Пайдаланушының ресурс тұтыну деректерін талдап, шығындарды оңтайландыру бойынша 3-5 ресми ұсыныс беріңіз.' : 'Analyze the user\'s resource consumption data and provide 3-5 formal recommendations for cost optimization.'}

        User's monthly consumption and costs:
        - Cold Water: ${avgConsumption.coldWater.toFixed(1)} m³ (${(avgConsumption.coldWater * this.UTILITY_RATES.coldWater).toFixed(0)} ₸)
        - Hot Water: ${avgConsumption.hotWater.toFixed(1)} m³ (${(avgConsumption.hotWater * this.UTILITY_RATES.hotWater).toFixed(0)} ₸)
        - Sewage: ${avgConsumption.sewage.toFixed(1)} m³ (${(avgConsumption.sewage * this.UTILITY_RATES.sewage).toFixed(0)} ₸)
        - Heating: ${avgConsumption.heating.toFixed(1)} Gcal (${(avgConsumption.heating * this.UTILITY_RATES.heating).toFixed(0)} ₸)
        - Electricity: ${avgConsumption.electricity.toFixed(1)} kWh (${this.calculateElectricityCost(avgConsumption.electricity).toFixed(0)} ₸)
        - Gas: ${avgConsumption.gas.toFixed(1)} m³ (${(avgConsumption.gas * this.UTILITY_RATES.gas).toFixed(0)} ₸)
        
        Total monthly cost: ${currentCost.toFixed(0)} ₸
        Previous month cost: ${previousMonthCost.toFixed(0)} ₸

        Almaty regional averages:
        - Cold Water: ${almatyAverages.coldWater} m³, Hot Water: ${almatyAverages.hotWater} m³
        - Electricity: ${almatyAverages.electricity} kWh, Gas: ${almatyAverages.gas} m³
        - Heating: ${almatyAverages.heating} Gcal, Sewage: ${almatyAverages.sewage} m³

        Seasonal context: ${weatherContext}

        MANDATORY: Copy EXACTLY these formal structures. NO creative variations allowed.

        ${language === 'ru' ? 
          'ПРИМЕР 1 (ТОЧНЫЙ РАСЧЕТ):\nНазвание: "Оптимизация потребления электроэнергии"\nОписание: "Вы потребили 274.0 кВт⋅ч электроэнергии общей стоимостью 3617 ₸. Снижение потребления на 27.4 кВт⋅ч сэкономит 362 ₸ ежемесячно."\n\nПРИМЕР 2 (РЕГИОНАЛЬНОЕ СРАВНЕНИЕ):\nНазвание: "Оценка потребления холодной воды"\nОписание: "Средний житель Алматы потребляет 8.5 м³, ваше потребление составляет 5.9 м³. Это на 31% ниже среднего. Текущая эффективность демонстрирует грамотное управление ресурсами."\n\nКОПИРУЙТЕ эти структуры ТОЧНО. БЕЗ эмодзи, БЕЗ восклицаний, БЕЗ разговорного языка.' 
          : language === 'kk' ? 
          'МЫСАЛ 1 (ДӘЛЬ ЕСЕПТЕУ):\nАтауы: "Электр энергиясын тұтынуды оңтайландыру"\nСипаттамасы: "Сіз 274.0 кВт⋅сағ электр энергиясын 3617 ₸ жалпы құнға тұтындыңыз. Тұтынуды 27.4 кВт⋅сағға азайту айына 362 ₸ үнемдейді."\n\nМЫСАЛ 2 (АЙМАҚТЫҚ САЛЫСТЫРУ):\nАтауы: "Суық су тұтынуын бағалау"\nСипаттамасы: "Алматының орташа тұрғыны 8.5 м³ тұтынады, сіздің тұтынуыңыз 5.9 м³. Бұл орташадан 31% төмен."\n\nОСЫ құрылымдарды ДӘЛЕ көшіріңіз. Эмодзи ЖОҚ, леп ЖОҚ, сөйлесу тілі ЖОҚ.' 
          : 
          'EXAMPLE 1 (PRECISE CALCULATION):\nTitle: "Electricity Consumption Optimization"\nDescription: "You consumed 274.0 kWh of electricity, totaling 3617 ₸. Reducing consumption by 27.4 kWh would save 362 ₸ monthly."\n\nEXAMPLE 2 (REGIONAL COMPARISON):\nTitle: "Cold Water Usage Assessment"\nDescription: "Average Almaty resident consumes 8.5 m³, your usage is 5.9 m³. This represents 31% below average. Current efficiency demonstrates effective resource management."\n\nCOPY these structures EXACTLY. NO emojis, NO exclamations, NO casual language.'}

        Respond in JSON format with these recommendations:
        {
          "recommendations": [
            {
              "title": "Formal advisory title (NO emojis)",
              "description": "MUST use one of the 5 patterns above. Professional language only.",
              "category": "coldWater/hotWater/electricity/gas/heating/sewage",
              "potentialSavings": number,
              "priority": "high/medium/low"
            }
          ]
        }
      `;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo", // Updated to support JSON format
        messages: [
          {
            role: "system",
            content: language === 'ru' ? "Вы формальный бизнес-консультант по оптимизации коммунальных расходов в Казахстане. КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:\n\n1. Пишите ТОЛЬКО на профессиональном русском языке\n2. НЕТ эмодзи, НЕТ восклицаний, НЕТ разговорного языка\n3. Используйте ТОЛЬКО 5 паттернов из промпта\n4. Каждая рекомендация ДОЛЖНА начинаться с одного из этих паттернов\n5. Предоставляйте точные расчеты и конкретные цифры\n6. Поддерживайте формальный деловой тон\n\nЕсли используете эмодзи или разговорный язык, ответ будет отклонен." : language === 'kk' ? "Сіз Қазақстандағы коммуналдық шығындарды оңтайландыру бойынша ресми бизнес-кеңесшісіз. МАҢЫЗДЫ ТАЛАПТАР:\n\n1. Тек кәсіби қазақ тілінде жазыңыз\n2. Эмодзи ЖОҚ, леп ЖОҚ, сөйлесу тілі ЖОҚ\n3. Промпттағы тек 5 үлгіні қолданыңыз\n4. Әр ұсыныс осы үлгілердің бірінен басталуы КЕРЕК\n5. Дәл есептеулер мен нақты сандарды беріңіз\n6. Ресми іскерлік үнді сақтаңыз\n\nЕгер эмодзи немесе сөйлесу тілін қолдансаңыз, жауап қабылданбайды." : "You are a formal business advisor for utility cost optimization in Kazakhstan. CRITICAL REQUIREMENTS:\n\n1. Write ONLY in professional business English\n2. NO emojis, NO exclamations, NO casual language\n3. Use ONLY the 5 patterns provided in the prompt\n4. Every recommendation MUST start with one of these patterns\n5. Provide exact calculations and specific numbers\n6. Maintain formal business tone throughout\n\nIf you use ANY emojis or casual language, the response will be rejected. Use formal business communication exclusively."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Low creativity for formal business tone
        max_tokens: 1000 // Reduced for faster generation
      });

      // Clean and parse AI response
      const aiResponse = response.choices[0].message.content || '{"recommendations": []}';
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const aiResult = JSON.parse(cleanResponse);
      
      // Save AI recommendations to database
      const savedRecommendations = [];
      for (const rec of aiResult.recommendations) {
        const recommendation: InsertRecommendation = {
          userId,
          title: rec.title || "Energy Saving Tip",
          description: rec.description || "Consider optimizing your utility usage for better savings.",
          category: rec.category || "general",
          potentialSavings: typeof rec.potentialSavings === 'number' ? rec.potentialSavings : parseFloat(rec.potentialSavings) || 0,
          priority: rec.priority || "medium"
        };
        
        const saved = await storage.createRecommendation(recommendation);
        savedRecommendations.push(saved);
      }

      return savedRecommendations;
    } catch (error) {
      console.error("AI recommendations error:", error);
      console.error("Full error details:", error);
      // Generate fallback recommendations without using old schema
      return this.generateFallbackRecommendations(userId);
    }
  }

  async generateFallbackRecommendations(userId: string): Promise<any[]> {
    try {
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 30);
      const user = await storage.getUser(userId);
      
      const recommendations: InsertRecommendation[] = [];
      
      // Analyze consumption patterns with new schema
      const consumptionSummary = readings.reduce((acc, reading) => {
        acc.coldWater += parseFloat(reading.coldWater || '0');
        acc.hotWater += parseFloat(reading.hotWater || '0');
        acc.sewage += parseFloat(reading.sewage || '0');
        acc.heating += parseFloat(reading.heating || '0');
        acc.electricity += parseFloat(reading.electricity || '0');
        acc.gas += parseFloat(reading.gas || '0');
        return acc;
      }, { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 });

      // Calculate averages
      const avgConsumption = Object.keys(consumptionSummary).reduce((acc, key) => {
        acc[key as keyof typeof acc] = consumptionSummary[key as keyof typeof consumptionSummary] / readings.length;
        return acc;
      }, { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 });

      // Generate different types of recommendations with variety
      const varietyOptions = [
        {
          title: `Reduce Hot Water Usage`,
          description: `Your hot water usage is ${avgConsumption.hotWater.toFixed(1)} m³/month. Try shorter showers (5-7 minutes) and fix any leaks. This could save you ${(avgConsumption.hotWater * 0.2 * this.UTILITY_RATES.hotWater).toFixed(0)} ₸ monthly.`,
          category: 'hotWater',
          potentialSavings: (avgConsumption.hotWater * 0.2 * this.UTILITY_RATES.hotWater).toString(),
          priority: 'high'
        },
        {
          title: `Optimize Electricity Usage`,
          description: `With ${avgConsumption.electricity.toFixed(1)} kWh monthly, switching to LED bulbs and unplugging devices could reduce consumption by 15%. Potential savings: ${(this.calculateElectricityCost(avgConsumption.electricity) * 0.15).toFixed(0)} ₸.`,
          category: 'electricity',
          potentialSavings: (this.calculateElectricityCost(avgConsumption.electricity) * 0.15).toString(),
          priority: 'medium'
        },
        {
          title: `Heating Efficiency Boost`,
          description: `Your heating costs ${(avgConsumption.heating * this.UTILITY_RATES.heating).toFixed(0)} ₸/month. Better insulation and smart thermostat use could cut this by 20-30%.`,
          category: 'heating',
          potentialSavings: (avgConsumption.heating * this.UTILITY_RATES.heating * 0.25).toString(),
          priority: 'high'
        },
        {
          title: `Water Conservation Tips`,
          description: `Cold water usage at ${avgConsumption.coldWater.toFixed(1)} m³. Installing water-saving fixtures could reduce usage by 25% saving ${(avgConsumption.coldWater * 0.25 * this.UTILITY_RATES.coldWater).toFixed(0)} ₸ monthly.`,
          category: 'coldWater',
          potentialSavings: avgConsumption.coldWater * 0.25 * this.UTILITY_RATES.coldWater,
          priority: 'medium'
        }
      ];

      // Select 2-3 random recommendations for variety
      const selectedRecs = varietyOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .map(rec => ({ userId, ...rec }));

      recommendations.push(...selectedRecs);

      // Add a random general recommendation
      const generalRecs = [
        {
          userId,
          title: 'Smart Meter Monitoring',
          description: 'Track your daily consumption to identify peak usage times and adjust habits accordingly.',
          category: 'general',
          potentialSavings: 500,
          priority: 'medium'
        }
      ];
      if (Math.random() > 0.5) recommendations.push(...generalRecs);

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
    // CO2 emission factors (kg CO2 per unit) - updated Kazakhstan coefficients
    const factors = {
      electricity: 0.9, // kg CO2 per kWh (Kazakhstan updated)
      gas: 2.0, // kg CO2 per m³
      heating: 230.0, // kg CO2 per Gcal (updated)
      coldWater: 0.34, // kg CO2 per m³ for cold water supply
      hotWater: 0.34, // kg CO2 per m³ for hot water supply  
      sewage: 0.7, // kg CO2 per m³ for sewage treatment
    };

    const breakdown = {
      electricity: (consumption.electricity || 0) * factors.electricity,
      gas: (consumption.gas || 0) * factors.gas, 
      heating: (consumption.heating || 0) * factors.heating,
      coldWater: (consumption.coldWater || 0) * factors.coldWater,
      hotWater: (consumption.hotWater || 0) * factors.hotWater,
      sewage: (consumption.sewage || 0) * factors.sewage,
    };

    const total = breakdown.electricity + breakdown.gas + breakdown.heating + breakdown.coldWater + breakdown.hotWater + breakdown.sewage;

    return {
      total: parseFloat(total.toFixed(1)), // Keep in kilograms
      breakdown: {
        electricity: parseFloat(breakdown.electricity.toFixed(1)),
        gas: parseFloat(breakdown.gas.toFixed(1)),
        heating: parseFloat(breakdown.heating.toFixed(1)),
        coldWater: parseFloat(breakdown.coldWater.toFixed(1)),
        hotWater: parseFloat(breakdown.hotWater.toFixed(1)),
        sewage: parseFloat(breakdown.sewage.toFixed(1)),
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

  // New Footprint Assistant with emotional patterns
  async generateFootprintInsights(userId: string, language: string = 'en'): Promise<any[]> {
    try {
      // Get user's consumption data
      const readings = await storage.getUserConsumptionReadings(userId, undefined, 6);
      
      if (readings.length === 0) {
        return [];
      }

      // Calculate CO2 data
      const currentReading = readings[0];
      const previousReading = readings.length > 1 ? readings[1] : null;
      
      // Convert string values to numbers for CO2 calculation
      const currentConsumption = {
        electricity: parseFloat(currentReading.electricity || '0'),
        gas: parseFloat(currentReading.gas || '0'),
        heating: parseFloat(currentReading.heating || '0'),
        coldWater: parseFloat(currentReading.coldWater || '0'),
        hotWater: parseFloat(currentReading.hotWater || '0'),
        sewage: parseFloat(currentReading.sewage || '0')
      };
      
      const currentCO2 = this.calculateCO2Footprint(currentConsumption);
      
      let previousCO2 = null;
      if (previousReading) {
        const previousConsumption = {
          electricity: parseFloat(previousReading.electricity || '0'),
          gas: parseFloat(previousReading.gas || '0'),
          heating: parseFloat(previousReading.heating || '0'),
          coldWater: parseFloat(previousReading.coldWater || '0'),
          hotWater: parseFloat(previousReading.hotWater || '0'),
          sewage: parseFloat(previousReading.sewage || '0')
        };
        previousCO2 = this.calculateCO2Footprint(previousConsumption);
      }
      
      // Get user region and calculate city average (when we have 10+ users)
      const user = await storage.getUser(userId);
      const userRegion = user?.region || 'Almaty';
      
      // Calculate city average CO2 (placeholder logic - will implement when we have more users)
      const allUsers = await storage.getAllUsers(); // You'll need to implement this
      const cityUsers = allUsers?.filter(u => u.region === userRegion) || [];
      const shouldUseCityAverage = cityUsers.length >= 10;
      
      let cityAverageCO2 = 0;
      if (shouldUseCityAverage) {
        // Calculate actual city average (simplified)
        cityAverageCO2 = 285; // Will be replaced with real calculation
      }

      // Style variety patterns
      const styles = ['точный', 'лайтовый', 'эквивалент', 'эмоциональный'];
      const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
      
      // Calculate percentage change
      let percentChange = 0;
      if (previousCO2) {
        percentChange = ((currentCO2.total - previousCO2.total) / previousCO2.total) * 100;
      }

      // Calculate equivalents
      const fuelLiters = (currentCO2.total * 0.43).toFixed(1); // 1 kg CO2 ≈ 0.43L fuel
      const treesNeeded = Math.ceil(currentCO2.total / 20);
      const flights = (currentCO2.total / 85).toFixed(1); // Almaty-Astana ≈ 85kg CO2
      const yearlyProjection = (currentCO2.total * 12 / 1000).toFixed(1); // in tonnes
      const households = (currentCO2.total * 12 / 2400).toFixed(1); // average household ≈ 2.4t/year

      // Get weather context for seasonal recommendations
      let weatherContext = "";
      const currentMonth = new Date().getMonth();
      const isWinter = currentMonth < 3 || currentMonth > 10;
      
      if (isWinter) {
        weatherContext = "Kazakhstan winter period: cold weather increases heating and electricity consumption.";
      }

      const prompt = `You are the Footprint Assistant (Impact), an expert on environmental influence. Your task: explain environmental impact and translate numbers into understandable images.

Style: ${selectedStyle} — serious but visual and emotional.

USER DATA:
- Total monthly CO₂ footprint: ${currentCO2.total.toFixed(1)} kg
- Change from previous month: ${percentChange.toFixed(1)}%
- Breakdown: electricity ${currentCO2.breakdown.electricity.toFixed(1)} kg (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%), heating ${currentCO2.breakdown.heating.toFixed(1)} kg (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%), gas ${currentCO2.breakdown.gas.toFixed(1)} kg (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%), water ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} kg (${(((currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage)/currentCO2.total)*100).toFixed(1)}%)
- Equivalents: ${fuelLiters} liters of gasoline, ${treesNeeded} trees, ${flights} Almaty-Astana flights
- Yearly projection: ${yearlyProjection} tonnes CO₂ (= ${households} households)
${shouldUseCityAverage ? `- Average for ${userRegion}: ${cityAverageCO2} kg` : ''}
- Season: ${weatherContext}

RESPONSE PATTERNS (use RANDOMLY):

🔹 CO₂ calculation: "Your monthly carbon footprint was {CO2_total} kg CO₂. That's {percent}% more/less than last month."

🔹 Category breakdown: "Main contributors: heating ({heat_CO2} kg CO₂, {share}%), electricity ({el_CO2} kg CO₂, {share}%), water and sewage ({water_CO2} kg CO₂, {share}%)."

🔹 Comparison: ${shouldUseCityAverage ? `"You have {CO2_total} kg CO₂, ${userRegion} average is {city_avg_CO2} kg. That's {percent_diff}% difference."` : '"Not enough data for city comparison yet (need 10+ users)."'}

🔹 Equivalents: "{CO2_total} kg CO₂ = {liters_fuel} liters of gasoline or {trees_needed} trees to plant 🌱. This footprint equals {flights} Almaty-Astana flights ✈️."

🔹 Emotional conclusion: "At this pace, your yearly footprint will be {CO2_year} tonnes CO₂. That's comparable to {households} households' carbon footprint."

REQUIREMENTS:
- DON'T always use the same style
- Combine: sometimes numbers + emotion, sometimes just metaphor
- Be vivid and visual
- Use emojis for emotions
- ${language === 'ru' ? 'Отвечай на русском языке' : language === 'kk' ? 'Жауапты қазақ тілінде беріңіз' : 'Respond in English'}
- Give EXACTLY 3-4 insights

Respond ONLY with valid JSON format. No markdown, no backticks, no extra text:
{
  "insights": [
    {
      "title": "Brief title",
      "description": "Emotional description with specific numbers and images",
      "category": "electricity/gas/heating/water/environmental",
      "priority": "high/medium/low",
      "potentialSavings": "15kg CO2 per month"
    }
  ]
}`;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: language === 'ru' ? "Вы Помощник по Экологическому Следу. Вы эксперт по воздействию на окружающую среду. Ваша задача - объяснять экологические воздействие через образы и эмоции. Всегда отвечайте на русском языке. Используйте различные стили общения для разнообразия." : language === 'kk' ? "Сіз Экологиялық Із жөніндегі Көмекшісіз. Сіз қоршаған ортаға әсер ету жөніндегі сарапшысыз. Сіздің міндетіңіз - экологиялық әсерді бейнелер мен эмоциялар арқылы түсіндіру. Әрқашан қазақ тілінде жауап беріңіз. Әртүрлілік үшін әр түрлі қатынас стильдерін қолданыңыз." : "You are the Footprint Assistant (Impact). You are an expert on environmental influence. Your task is to explain environmental impact through images and emotions. Always respond in English. Use random communication styles for variety."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Balanced creativity and speed  
        max_tokens: 800 // Reduced for faster generation
      });

      const aiResponse = response.choices[0].message.content;
      let insights = [];
      
      try {
        // Clean the response - remove markdown and extra formatting
        let cleanResponse = (aiResponse || "").trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        const parsed = JSON.parse(cleanResponse);
        insights = parsed.insights || parsed || [];
      } catch (error) {
        console.error("Error parsing Footprint AI response:", error);
        insights = [];
      }

      // Save insights to database (reuse CO2 insights table)
      const savedInsights = [];
      for (const insight of insights.slice(0, 4)) {
        try {
          const insightData = {
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
          console.error("Error saving footprint insight:", error);
        }
      }

      return savedInsights;
    } catch (error) {
      console.error("Error generating footprint insights:", error);
      throw error;
    }
  }

  async generateCO2Insights(userId: string): Promise<any[]> {
    try {
      // Clear existing CO2 insights
      await storage.clearUserCO2Insights(userId);

      // Get user consumption data sorted by date descending (most recent first)
      const consumption = await storage.getUserConsumptionReadings(userId, undefined, 10);
      
      if (consumption.length === 0) {
        return []; // No data to analyze
      }

      // Sort by date to ensure proper order (most recent first)
      const sortedConsumption = consumption.sort((a: any, b: any) => {
        const dateA = a.readingDate ? new Date(a.readingDate) : new Date(a.year || 2024, (a.month || 1) - 1);
        const dateB = b.readingDate ? new Date(b.readingDate) : new Date(b.year || 2024, (b.month || 1) - 1);
        return dateB.getTime() - dateA.getTime();
      });

      // Get current month (most recent) data
      const currentMonth = sortedConsumption[0];
      const previousMonth = sortedConsumption.length > 1 ? sortedConsumption[1] : null;

      // Calculate CO2 emissions for current month using updated factors
      const currentCO2 = this.calculateCO2Footprint({
        electricity: parseFloat(currentMonth.electricity || '0'),
        gas: parseFloat(currentMonth.gas || '0'),
        heating: parseFloat(currentMonth.heating || '0'),
        coldWater: parseFloat(currentMonth.coldWater || '0'),
        hotWater: parseFloat(currentMonth.hotWater || '0'),
        sewage: parseFloat(currentMonth.sewage || '0')
      });

      // Calculate previous month CO2 if available
      let previousCO2 = null;
      let monthComparisonText = "";
      
      if (previousMonth) {
        previousCO2 = this.calculateCO2Footprint({
          electricity: parseFloat(previousMonth.electricity || '0'),
          gas: parseFloat(previousMonth.gas || '0'),
          heating: parseFloat(previousMonth.heating || '0'),
          coldWater: parseFloat(previousMonth.coldWater || '0'),
          hotWater: parseFloat(previousMonth.hotWater || '0'),
          sewage: parseFloat(previousMonth.sewage || '0')
        });

        const percentChange = ((currentCO2.total - previousCO2.total) / previousCO2.total * 100);
        const trend = percentChange > 0 ? "increased" : "decreased";
        monthComparisonText = `Compared to last month: CO2 emissions ${trend} by ${Math.abs(percentChange).toFixed(1)}% (from ${previousCO2.total}kg to ${currentCO2.total}kg).`;
      } else {
        monthComparisonText = "This is your first month of data, so no comparison with previous month is available.";
      }

      // Calculate environmental equivalents
      const fuelLiters = (currentCO2.total * 0.43).toFixed(1); // 1kg CO2 ≈ 0.43L gasoline
      const treesNeeded = Math.ceil(currentCO2.total / 20); // 1 tree absorbs ~20kg CO2/year
      const flightsAlmatyAstana = (currentCO2.total / 85).toFixed(1); // ~85kg CO2 per flight
      const yearlyProjection = (currentCO2.total * 12 / 1000).toFixed(1); // Yearly in tonnes
      const householdsEquivalent = (currentCO2.total * 12 / 2400).toFixed(1); // Average household 2.4t/year

      // Mock regional average (in future can be real data from database)
      const almatyAverage = 320; // kg CO2 per month average for Almaty
      const percentDiff = (((currentCO2.total - almatyAverage) / almatyAverage) * 100).toFixed(1);
      const comparisonType = currentCO2.total > almatyAverage ? "above" : "below";

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
      const prompt = `You are an environmental AI assistant analyzing CO2 emissions data. Please provide EXACTLY 3-4 insights in English only. Use the specific patterns provided below.

User's CO2 emissions data (current month):
- Total CO2 emissions: ${currentCO2.total.toFixed(1)} kg
- Electricity: ${currentCO2.breakdown.electricity.toFixed(1)} kg CO2 (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
- Gas: ${currentCO2.breakdown.gas.toFixed(1)} kg CO2 (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
- Heating: ${currentCO2.breakdown.heating.toFixed(1)} kg CO2 (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
- Water: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} kg CO2 (${(((currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage)/currentCO2.total)*100).toFixed(1)}%)

Regional comparison:
- Your emissions: ${currentCO2.total.toFixed(1)} kg CO2
- Almaty average: ${almatyAverage} kg CO2
- You are ${Math.abs(parseFloat(percentDiff))}% ${comparisonType} average

Environmental equivalents:
- ${fuelLiters} liters of gasoline
- ${treesNeeded} trees needed to offset per year
- ${flightsAlmatyAstana} Almaty-Astana flights
- Yearly projection: ${yearlyProjection} tonnes CO2
- Equivalent to ${householdsEquivalent} households

Month-to-month comparison:
${monthComparisonText}

${weatherContext}

Use these EXACT patterns in your responses:
1. CO₂ calculation: "Your monthly carbon footprint was {total} kg CO₂. That's {percent}% {direction} than last month."
2. Category breakdown: "Main contributors: {category1} ({amount} kg CO₂, {share}%), {category2} ({amount} kg CO₂, {share}%)."
3. Regional comparison: "You have {total} kg CO₂, Almaty average is {average} kg. That's {percent}% {direction}."
4. Equivalents: "{total} kg CO₂ = {liters} liters of gasoline or {trees} trees needed to offset per year 🌱"
5. Emotional conclusion: "At this pace, your yearly footprint will be {yearly} tonnes CO₂. This equals the impact of {households} households."

For each insight, provide:
- title: Brief descriptive title (poetic/emotional style)
- description: Use the patterns above with actual calculated values
- category: electricity, gas, heating, water, or environmental
- priority: high, medium, or low
- potentialSavings: Estimated CO2 reduction potential (e.g., "15kg CO2 per month")

Respond in JSON format as an array of insights. Use ONLY ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'} language.`;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo", // Updated to support JSON format
        messages: [
          {
            role: "system",
            content: `You are an environmental AI assistant. Always respond in ${language === 'ru' ? 'Russian' : language === 'kk' ? 'Kazakh' : 'English'} only. Use the exact patterns provided to create insights with specific environmental equivalents and emotional metaphors.`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
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
