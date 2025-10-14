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

      // Get weather context (localized)
      let weatherContext = "";
      const currentMonth = new Date().getMonth();
      const isWinter = currentMonth < 3 || currentMonth > 10; // Dec, Jan, Feb, Nov
      const isSummer = currentMonth > 4 && currentMonth < 9; // May-Aug
      
      if (language === 'ru') {
        if (isWinter) {
          weatherContext = "Зимний период Казахстана: холодная погода увеличивает расходы на отопление и электричество. Фокус на утепление и эффективное отопление.";
        } else if (isSummer) {
          weatherContext = "Летний период Казахстана: теплая погода снижает отопление, но может увеличить расходы на охлаждение. Хорошее время для энергосберегающих улучшений.";
        } else {
          weatherContext = "Переходный сезон Казахстана: умеренная погода идеальна для внедрения энергосберегающих мер и улучшений дома.";
        }
      } else if (language === 'kk') {
        if (isWinter) {
          weatherContext = "Қазақстанның қыс кезеңі: суық ауа-райы жылыту мен электр шығындарын арттырады. Жылытқыш пен тиімді жылытуға назар аударыңыз.";
        } else if (isSummer) {
          weatherContext = "Қазақстанның жаз кезеңі: жылы ауа-райы жылытуды азайтады, бірақ салқындатуға шығындарды арттыруы мүмкін. Энергия үнемдеуге жақсы уақыт.";
        } else {
          weatherContext = "Қазақстанның өтпелі маусымы: қоңыржай ауа-райы энергия үнемдеу шараларын енгізуге өте қолайлы.";
        }
      } else {
        if (isWinter) {
          weatherContext = "Kazakhstan winter period: cold weather increases heating and electricity needs. Focus on insulation and efficient heating.";
        } else if (isSummer) {
          weatherContext = "Kazakhstan summer period: warmer weather reduces heating but may increase electricity for cooling. Good time for energy-saving upgrades.";
        } else {
          weatherContext = "Kazakhstan transition season: moderate weather is ideal for implementing energy-saving measures and home improvements.";
        }
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

      const percentChange = previousMonthCost > 0 ? ((currentCost - previousMonthCost) / previousMonthCost * 100).toFixed(1) : '0';

      const prompt = `
        CRITICAL: ${language === 'ru' ? 'Отвечай ТОЛЬКО на русском языке.' : language === 'kk' ? 'Жауапты ТЕКСЕН қазақ тілінде беріңіз.' : 'Respond ONLY in English.'}

        ${language === 'ru' ? 'Проанализируй данные о потреблении и создай 4-5 РАЗНЫХ типов рекомендаций из списка ниже.' : language === 'kk' ? 'Тұтыну деректерін талдап, төмендегі тізімнен 4-5 ТҮРЛІ ұсыныс жасаңыз.' : 'Analyze consumption data and create 4-5 DIFFERENT types of recommendations from the list below.'}

        ${language === 'ru' ? `Данные пользователя за последние месяцы:
        - Холодная вода: ${avgConsumption.coldWater.toFixed(1)} м³ (${(avgConsumption.coldWater * this.UTILITY_RATES.coldWater).toFixed(0)} ₸)
        - Горячая вода: ${avgConsumption.hotWater.toFixed(1)} м³ (${(avgConsumption.hotWater * this.UTILITY_RATES.hotWater).toFixed(0)} ₸)
        - Канализация: ${avgConsumption.sewage.toFixed(1)} м³ (${(avgConsumption.sewage * this.UTILITY_RATES.sewage).toFixed(0)} ₸)
        - Отопление: ${avgConsumption.heating.toFixed(1)} Гкал (${(avgConsumption.heating * this.UTILITY_RATES.heating).toFixed(0)} ₸)
        - Электричество: ${avgConsumption.electricity.toFixed(1)} кВт⋅ч (${this.calculateElectricityCost(avgConsumption.electricity).toFixed(0)} ₸)
        - Газ: ${avgConsumption.gas.toFixed(1)} м³ (${(avgConsumption.gas * this.UTILITY_RATES.gas).toFixed(0)} ₸)
        
        Общая стоимость: ${currentCost.toFixed(0)} ₸
        Прошлый месяц: ${previousMonthCost.toFixed(0)} ₸
        Изменение: ${percentChange}%

        Средние показатели Алматы:
        - Холодная вода: ${almatyAverages.coldWater} м³, Горячая вода: ${almatyAverages.hotWater} м³
        - Электричество: ${almatyAverages.electricity} кВт⋅ч, Газ: ${almatyAverages.gas} м³
        - Отопление: ${almatyAverages.heating} Гкал, Канализация: ${almatyAverages.sewage} м³

        Сезонный контекст: ${weatherContext}` 
        : language === 'kk' ? 
        `Соңғы айлар бойынша пайдаланушы деректері:
        - Суық су: ${avgConsumption.coldWater.toFixed(1)} м³ (${(avgConsumption.coldWater * this.UTILITY_RATES.coldWater).toFixed(0)} ₸)
        - Ыстық су: ${avgConsumption.hotWater.toFixed(1)} м³ (${(avgConsumption.hotWater * this.UTILITY_RATES.hotWater).toFixed(0)} ₸)
        - Кәріз: ${avgConsumption.sewage.toFixed(1)} м³ (${(avgConsumption.sewage * this.UTILITY_RATES.sewage).toFixed(0)} ₸)
        - Жылыту: ${avgConsumption.heating.toFixed(1)} Гкал (${(avgConsumption.heating * this.UTILITY_RATES.heating).toFixed(0)} ₸)
        - Электр: ${avgConsumption.electricity.toFixed(1)} кВт⋅сағ (${this.calculateElectricityCost(avgConsumption.electricity).toFixed(0)} ₸)
        - Газ: ${avgConsumption.gas.toFixed(1)} м³ (${(avgConsumption.gas * this.UTILITY_RATES.gas).toFixed(0)} ₸)
        
        Жалпы құн: ${currentCost.toFixed(0)} ₸
        Өткен ай: ${previousMonthCost.toFixed(0)} ₸
        Өзгеріс: ${percentChange}%

        Алматы орташа көрсеткіштері:
        - Суық су: ${almatyAverages.coldWater} м³, Ыстық су: ${almatyAverages.hotWater} м³
        - Электр: ${almatyAverages.electricity} кВт⋅сағ, Газ: ${almatyAverages.gas} м³
        - Жылыту: ${almatyAverages.heating} Гкал, Кәріз: ${almatyAverages.sewage} м³

        Маусымдық контекст: ${weatherContext}` 
        : 
        `User's monthly consumption data:
        - Cold Water: ${avgConsumption.coldWater.toFixed(1)} m³ (${(avgConsumption.coldWater * this.UTILITY_RATES.coldWater).toFixed(0)} ₸)
        - Hot Water: ${avgConsumption.hotWater.toFixed(1)} m³ (${(avgConsumption.hotWater * this.UTILITY_RATES.hotWater).toFixed(0)} ₸)
        - Sewage: ${avgConsumption.sewage.toFixed(1)} m³ (${(avgConsumption.sewage * this.UTILITY_RATES.sewage).toFixed(0)} ₸)
        - Heating: ${avgConsumption.heating.toFixed(1)} Gcal (${(avgConsumption.heating * this.UTILITY_RATES.heating).toFixed(0)} ₸)
        - Electricity: ${avgConsumption.electricity.toFixed(1)} kWh (${this.calculateElectricityCost(avgConsumption.electricity).toFixed(0)} ₸)
        - Gas: ${avgConsumption.gas.toFixed(1)} m³ (${(avgConsumption.gas * this.UTILITY_RATES.gas).toFixed(0)} ₸)
        
        Total monthly cost: ${currentCost.toFixed(0)} ₸
        Previous month: ${previousMonthCost.toFixed(0)} ₸
        Change: ${percentChange}%

        Almaty regional averages:
        - Cold Water: ${almatyAverages.coldWater} m³, Hot Water: ${almatyAverages.hotWater} m³
        - Electricity: ${almatyAverages.electricity} kWh, Gas: ${almatyAverages.gas} m³
        - Heating: ${almatyAverages.heating} Gcal, Sewage: ${almatyAverages.sewage} m³

        Seasonal context: ${weatherContext}`}

        7 ТИПОВ РЕКОМЕНДАЦИЙ (используй РАЗНЫЕ типы каждый раз):

        ${language === 'ru' ? 
          `1. ИНФОРМАЦИОННЫЕ (Descriptive) - констатация фактов:
          Формат: [Период] + [тип ресурса] + [значение]
          Пример: "В прошлом месяце ты израсходовал ${avgConsumption.electricity.toFixed(1)} кВт⋅ч электроэнергии"

          2. РЕКОМЕНДАТЕЛЬНЫЕ (Advisory) - конкретные советы:
          Формат: [Совет] + [ожидаемый эффект]
          Пример: "Сократи время работы бойлера на 15 минут в день — расход газа снизится на 5%"

          3. ДИНАМИЧЕСКИЕ (Progress Tracking) - показывают изменения:
          Формат: [Изменение] + [процент] + [причина]
          Пример: "По сравнению с прошлым месяцем расход электричества снизился на 12%"

          4. ОБЪЯСНИТЕЛЬНО-АНАЛИТИЧЕСКИЕ (Causal/Insight) - анализ причин:
          Формат: [Причина/наблюдение] + [доказательная часть]
          Пример: "Пик потребления электричества пришёлся на первую неделю — возможно, из-за отопительных приборов"

          5. МОТИВАЦИОННЫЕ (Engagement) - поощрение прогресса:
          Формат: [Похвала] + [результат]
          Пример: "Отличный результат — расход электричества снизился на 10%"

          6. ОБЗОРНЫЕ (Summary) - месячные итоги:
          Формат: [Изменение по каждому ресурсу] + [оценка]
          Пример: "В этом месяце: электроэнергия −12%, газ +4%, вода стабильна. Общий баланс положительный"

          7. ПЛАНИРОВОЧНЫЕ (Forecast) - прогноз и цели:
          Формат: [Прогноз/цель] + [ожидаемый результат]
          Пример: "При текущем темпе потребление электроэнергии снизится ещё на 10% к концу года"

          ВАЖНО: Генерируй РАЗНЫЕ типы каждый раз! Используй РЕАЛЬНЫЕ данные пользователя из промпта!` 
          : language === 'kk' ? 
          `1. АҚПАРАТТЫҚ (Descriptive) - фактілерді баяндау:
          Формат: [Кезең] + [ресурс түрі] + [мән]
          Мысал: "Өткен айда ${avgConsumption.electricity.toFixed(1)} кВт⋅сағ электр энергиясын тұтындыңыз"

          2. ҰСЫНЫМДЫҚ (Advisory) - нақты кеңестер:
          Формат: [Кеңес] + [күтілетін әсер]
          Мысал: "Бойлер жұмысын күніне 15 минутқа азайт — газ шығыны 5% төмендейді"

          3. ДИНАМИКАЛЫҚ (Progress Tracking) - өзгерістерді көрсету:
          Формат: [Өзгеріс] + [пайыз] + [себеп]
          Мысал: "Өткен айға қарағанда электр шығыны 12% азайды"

          4. ТҮСІНДІРМЕЛІ-ТАЛДАМАЛЫҚ (Causal/Insight) - себептерді талдау:
          Формат: [Себеп/бақылау] + [дәлелдеу бөлігі]
          Мысал: "Электр тұтынудың шыңы бірінші аптаға келді — жылыту құрылғылары себебінен"

          5. МОТИВАЦИЯЛЫҚ (Engagement) - үдерісті мадақтау:
          Формат: [Мадақтау] + [нәтиже]
          Мысал: "Керемет нәтиже — электр шығыны 10% азайды"

          6. ШОЛУ (Summary) - айлық қорытынды:
          Формат: [Әр ресурс бойынша өзгеріс] + [баға]
          Мысал: "Осы айда: электр −12%, газ +4%, су тұрақты. Жалпы баланс оң"

          7. ЖОСПАРЛАУ (Forecast) - болжам және мақсаттар:
          Формат: [Болжам/мақсат] + [күтілетін нәтиже]
          Мысал: "Қазіргі қарқында электр тұтыну жыл соңына дейін тағы 10% азаяды"

          МАҢЫЗДЫ: Әр рет ТҮРЛІ типтер қолдан! Промпттағы НАҚТЫ деректерді пайдалан!` 
          : 
          `1. DESCRIPTIVE (Informational) - state facts:
          Format: [Period] + [resource type] + [value]
          Example: "Last month you consumed ${avgConsumption.electricity.toFixed(1)} kWh of electricity"

          2. ADVISORY (Recommendations) - specific advice:
          Format: [Advice] + [expected effect]
          Example: "Reduce boiler runtime by 15 minutes daily — gas consumption will decrease by 5%"

          3. PROGRESS TRACKING (Dynamic) - show changes:
          Format: [Change] + [percentage] + [reason]
          Example: "Compared to last month, electricity consumption decreased by 12%"

          4. CAUSAL/INSIGHT (Analytical) - analyze causes:
          Format: [Cause/observation] + [evidence]
          Example: "Peak electricity consumption occurred in the first week — likely due to heating devices"

          5. ENGAGEMENT (Motivational) - encourage progress:
          Format: [Praise] + [result]
          Example: "Excellent result — electricity consumption decreased by 10%"

          6. SUMMARY (Overview) - monthly recap:
          Format: [Change per resource] + [assessment]
          Example: "This month: electricity −12%, gas +4%, water stable. Overall balance positive"

          7. FORECAST (Planning) - predictions and goals:
          Format: [Forecast/goal] + [expected result]
          Example: "At current pace, electricity consumption will decrease another 10% by year end"

          IMPORTANT: Generate DIFFERENT types each time! Use REAL user data from the prompt!`}

        Respond in JSON format:
        {
          "recommendations": [
            {
              "title": "${language === 'ru' ? 'Заголовок рекомендации' : language === 'kk' ? 'Ұсыныс тақырыбы' : 'Recommendation title'}",
              "description": "${language === 'ru' ? 'Описание с РЕАЛЬНЫМИ данными пользователя' : language === 'kk' ? 'НАҚТЫ пайдаланушы деректерімен сипаттама' : 'Description with REAL user data'}",
              "category": "coldWater/hotWater/electricity/gas/heating/sewage/general",
              "potentialSavings": ${language === 'ru' ? 'число (экономия в тенге)' : language === 'kk' ? 'сан (теңгемен үнемдеу)' : 'number (savings in tenge)'},
              "priority": "high/medium/low"
            }
          ]
        }
      `;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: language === 'ru' 
              ? "Ты ИИ-консультант Econest по оптимизации потребления ресурсов. Твоя задача:\n\n1. Отвечать ТОЛЬКО на русском языке\n2. Генерировать РАЗНООБРАЗНЫЕ типы рекомендаций из 7 доступных типов\n3. Каждый раз использовать РАЗНЫЕ типы (не повторяться!)\n4. Использовать РЕАЛЬНЫЕ данные пользователя из промпта\n5. Делать точные расчеты с конкретными цифрами\n\nКаждая генерация должна содержать разные комбинации типов рекомендаций!" 
              : language === 'kk' 
              ? "Сіз Econest ресурстарды тұтынуды оңтайландыру бойынша ЖИ-кеңесшісіз. Сіздің міндетіңіз:\n\n1. Жауапты ТЕК қазақ тілінде беру\n2. 7 қолжетімді типтен ӘРТҮРЛІ ұсыныстар жасау\n3. Әр рет БАСҚА типтерді қолдану (қайталамау!)\n4. Промпттан пайдаланушының НАҚТЫ деректерін пайдалану\n5. Нақты сандармен дәл есептеулер жасау\n\nӘр генерация әртүрлі ұсыныс типтерінің комбинацияларын қамтуы керек!" 
              : "You are Econest AI advisor for resource consumption optimization. Your task:\n\n1. Respond ONLY in English\n2. Generate DIVERSE types of recommendations from 7 available types\n3. Each time use DIFFERENT types (don't repeat!)\n4. Use REAL user data from the prompt\n5. Make precise calculations with specific numbers\n\nEach generation must contain different combinations of recommendation types!"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Higher creativity for diverse recommendations
        max_tokens: 1200
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
      
      // Clear old recommendations first for streaming effect
      await storage.clearUserRecommendations(userId);
      
      // Save AI recommendations to database ONE BY ONE for streaming effect
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
        
        // Small delay between saves for streaming appearance
        await new Promise(resolve => setTimeout(resolve, 300));
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
      
      // Calculate percentage change with safety check
      let percentChange = 0;
      if (previousCO2 && previousCO2.total > 0) {
        percentChange = ((currentCO2.total - previousCO2.total) / previousCO2.total) * 100;
      }

      // Calculate equivalents
      const fuelLiters = (currentCO2.total * 0.43).toFixed(1); // 1 kg CO2 ≈ 0.43L fuel
      const treesNeeded = Math.ceil(currentCO2.total / 20);
      const flights = (currentCO2.total / 85).toFixed(1); // Almaty-Astana ≈ 85kg CO2
      const yearlyProjection = (currentCO2.total * 12 / 1000).toFixed(1); // in tonnes
      const households = (currentCO2.total * 12 / 2400).toFixed(1); // average household ≈ 2.4t/year

      // Get weather context for seasonal recommendations (localized)
      let weatherContext = "";
      const currentMonth = new Date().getMonth();
      const isWinter = currentMonth < 3 || currentMonth > 10;
      
      if (isWinter) {
        if (language === 'ru') {
          weatherContext = "Зимний период Казахстана: холодная погода увеличивает расходы на отопление и электричество.";
        } else if (language === 'kk') {
          weatherContext = "Қазақстанның қыс кезеңі: суық ауа-райы жылыту мен электр шығындарын арттырады.";
        } else {
          weatherContext = "Kazakhstan winter period: cold weather increases heating and electricity consumption.";
        }
      }

      const prompt = `
        CRITICAL: ${language === 'ru' ? 'Отвечай ТОЛЬКО на русском языке.' : language === 'kk' ? 'Жауапты ТЕКСЕН қазақ тілінде беріңіз.' : 'Respond ONLY in English.'}

        ${language === 'ru' ? 'Проанализируй углеродный след и создай 3-4 РАЗНЫХ типа инсайтов из списка ниже.' : language === 'kk' ? 'Көміртегі ізін талдап, төмендегі тізімнен 3-4 ТҮРЛІ түсініктеме жасаңыз.' : 'Analyze carbon footprint and create 3-4 DIFFERENT types of insights from the list below.'}

        ${language === 'ru' ? `Данные CO2 выбросов:
        - Общий след: ${currentCO2.total.toFixed(1)} кг CO2
        - Изменение: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% за месяц
        - Электричество: ${currentCO2.breakdown.electricity.toFixed(1)} кг (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Отопление: ${currentCO2.breakdown.heating.toFixed(1)} кг (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Газ: ${currentCO2.breakdown.gas.toFixed(1)} кг (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Вода: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} кг
        
        Эквиваленты:
        - ${fuelLiters} л бензина
        - ${treesNeeded} деревьев для компенсации
        - ${flights} рейсов Алматы-Астана
        - Годовой прогноз: ${yearlyProjection} т CO2
        ${shouldUseCityAverage ? `- Средний по ${userRegion}: ${cityAverageCO2} кг` : ''}
        ${weatherContext}` 
        : language === 'kk' ? 
        `CO2 шығарындылары деректері:
        - Жалпы із: ${currentCO2.total.toFixed(1)} кг CO2
        - Өзгеріс: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% ай бойы
        - Электр: ${currentCO2.breakdown.electricity.toFixed(1)} кг (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Жылыту: ${currentCO2.breakdown.heating.toFixed(1)} кг (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Газ: ${currentCO2.breakdown.gas.toFixed(1)} кг (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Су: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} кг
        
        Эквиваленттер:
        - ${fuelLiters} л бензин
        - ${treesNeeded} ағаш өтемақы үшін
        - ${flights} Алматы-Астана рейсі
        - Жылдық болжам: ${yearlyProjection} т CO2
        ${shouldUseCityAverage ? `- ${userRegion} орташа: ${cityAverageCO2} кг` : ''}
        ${weatherContext}` 
        : 
        `CO2 emissions data:
        - Total footprint: ${currentCO2.total.toFixed(1)} kg CO2
        - Change: ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% per month
        - Electricity: ${currentCO2.breakdown.electricity.toFixed(1)} kg (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Heating: ${currentCO2.breakdown.heating.toFixed(1)} kg (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Gas: ${currentCO2.breakdown.gas.toFixed(1)} kg (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Water: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} kg
        
        Equivalents:
        - ${fuelLiters}L gasoline
        - ${treesNeeded} trees to offset
        - ${flights} Almaty-Astana flights
        - Yearly projection: ${yearlyProjection} t CO2
        ${shouldUseCityAverage ? `- ${userRegion} average: ${cityAverageCO2} kg` : ''}
        ${weatherContext}`}

        7 ТИПОВ ИНСАЙТОВ (используй РАЗНЫЕ типы каждый раз):

        ${language === 'ru' ? 
          `1. ИНФОРМАЦИОННЫЕ - констатация фактов:
          Пример: "Твой углеродный след составил ${currentCO2.total.toFixed(1)} кг CO2 за месяц"

          2. РЕКОМЕНДАТЕЛЬНЫЕ - советы:
          Пример: "Снижение электричества на 10% уменьшит выбросы на ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} кг CO2"

          3. ДИНАМИЧЕСКИЕ - изменения:
          Пример: "Выбросы ${percentChange > 0 ? 'выросли на' : 'снизились на'} ${Math.abs(percentChange).toFixed(1)}% за месяц"

          4. ОБЪЯСНИТЕЛЬНО-АНАЛИТИЧЕСКИЕ - анализ:
          Пример: "Основной источник — ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'электричество' : 'газ'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} кг)"

          5. МОТИВАЦИОННЫЕ - похвала:
          Пример: "Отлично! ${currentCO2.total.toFixed(1)} кг CO2 — это ${shouldUseCityAverage ? 'ниже среднего по городу' : 'хороший результат'}"

          6. ОБЗОРНЫЕ - итоги с эквивалентами:
          Пример: "${currentCO2.total.toFixed(1)} кг CO2 = ${fuelLiters} л бензина или ${treesNeeded} деревьев для компенсации 🌱"

          7. ПЛАНИРОВОЧНЫЕ - прогноз:
          Пример: "Годовой прогноз: ${yearlyProjection} т CO2 при текущем темпе"

          ВАЖНО: Генерируй РАЗНЫЕ типы каждый раз! Используй РЕАЛЬНЫЕ данные из промпта! Добавляй эмодзи для эмоций.` 
          : language === 'kk' ? 
          `1. АҚПАРАТТЫҚ - фактілер:
          Мысал: "Көміртегі ізіңіз ${currentCO2.total.toFixed(1)} кг CO2 айына"

          2. ҰСЫНЫМДЫҚ - кеңестер:
          Мысал: "Электрді 10% азайту ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} кг CO2 азайтады"

          3. ДИНАМИКАЛЫҚ - өзгерістер:
          Мысал: "Шығарындылар ай ішінде ${percentChange > 0 ? 'өсті' : 'азайды'} ${Math.abs(percentChange).toFixed(1)}%"

          4. ТҮСІНДІРМЕЛІ - талдау:
          Мысал: "Негізгі көз — ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'электр' : 'газ'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} кг)"

          5. МОТИВАЦИЯЛЫҚ - мадақтау:
          Мысал: "Керемет! ${currentCO2.total.toFixed(1)} кг CO2 — ${shouldUseCityAverage ? 'қала орташасынан төмен' : 'жақсы нәтиже'}"

          6. ШОЛУ - эквиваленттермен:
          Мысал: "${currentCO2.total.toFixed(1)} кг CO2 = ${fuelLiters} л бензин немесе ${treesNeeded} ағаш 🌱"

          7. ЖОСПАРЛАУ - болжам:
          Мысал: "Жылдық болжам: ${yearlyProjection} т CO2 қазіргі қарқында"

          МАҢЫЗДЫ: Әр рет ТҮРЛІ типтер! НАҚТЫ деректер! Эмоциялар үшін эмодзи қос.` 
          : 
          `1. DESCRIPTIVE - facts:
          Example: "Your carbon footprint was ${currentCO2.total.toFixed(1)} kg CO2 this month"

          2. ADVISORY - advice:
          Example: "Reducing electricity by 10% would cut ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} kg CO2"

          3. PROGRESS - changes:
          Example: "Emissions ${percentChange > 0 ? 'increased' : 'decreased'} ${Math.abs(percentChange).toFixed(1)}% this month"

          4. CAUSAL - analysis:
          Example: "Main source is ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'electricity' : 'gas'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} kg)"

          5. ENGAGEMENT - praise:
          Example: "Great! ${currentCO2.total.toFixed(1)} kg CO2 is ${shouldUseCityAverage ? 'below city average' : 'good result'}"

          6. SUMMARY - equivalents:
          Example: "${currentCO2.total.toFixed(1)} kg CO2 = ${fuelLiters}L gasoline or ${treesNeeded} trees 🌱"

          7. FORECAST - prediction:
          Example: "Yearly projection: ${yearlyProjection} tonnes CO2 at current pace"

          IMPORTANT: Different types each time! Real data! Add emojis for emotions.`}

        Respond in JSON format:
        {
          "insights": [
            {
              "title": "${language === 'ru' ? 'Эмоциональный заголовок' : language === 'kk' ? 'Эмоционалды тақырып' : 'Emotional title'}",
              "description": "${language === 'ru' ? 'Описание с данными и эмодзи' : language === 'kk' ? 'Деректер мен эмодзимен сипаттама' : 'Description with data and emojis'}",
              "category": "electricity/gas/heating/water/environmental",
              "potentialSavings": "${language === 'ru' ? 'потенциал снижения' : language === 'kk' ? 'азайту мүмкіндігі' : 'reduction potential'}",
              "priority": "high/medium/low"
            }
          ]
        }
      `;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: language === 'ru' 
              ? "Ты ИИ-консультант Econest по углеродному следу. Генерируй РАЗНООБРАЗНЫЕ инсайты с эмоциями и образами. Каждый раз используй РАЗНЫЕ типы. Добавляй эмодзи для визуализации. Отвечай ТОЛЬКО на русском языке." 
              : language === 'kk' 
              ? "Сіз Econest көміртегі ізі бойынша ЖИ-кеңесшісіз. Эмоциялар мен бейнелермен ӘРТҮРЛІ түсініктемелер жасаңыз. Әр рет БАСҚА типтерді қолданыңыз. Визуализация үшін эмодзи қосыңыз. Жауапты ТЕК қазақ тілінде беріңіз." 
              : "You are Econest AI advisor for carbon footprint. Generate DIVERSE insights with emotions and images. Each time use DIFFERENT types. Add emojis for visualization. Respond ONLY in English."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 1000
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

        const percentChange = previousCO2.total > 0 ? ((currentCO2.total - previousCO2.total) / previousCO2.total * 100) : 0;
        const trend = percentChange > 0 ? "increased" : "decreased";
        
        if (language === 'ru') {
          const trendRu = percentChange > 0 ? "выросли" : "снизились";
          monthComparisonText = `По сравнению с прошлым месяцем: выбросы CO2 ${trendRu} на ${Math.abs(percentChange).toFixed(1)}% (с ${previousCO2.total}кг до ${currentCO2.total}кг).`;
        } else if (language === 'kk') {
          const trendKk = percentChange > 0 ? "өсті" : "азайды";
          monthComparisonText = `Өткен айға қарағанда: CO2 шығарындылары ${trendKk} ${Math.abs(percentChange).toFixed(1)}% (${previousCO2.total}кг-дан ${currentCO2.total}кг-ға дейін).`;
        } else {
          monthComparisonText = `Compared to last month: CO2 emissions ${trend} by ${Math.abs(percentChange).toFixed(1)}% (from ${previousCO2.total}kg to ${currentCO2.total}kg).`;
        }
      } else {
        if (language === 'ru') {
          monthComparisonText = "Это ваш первый месяц данных, сравнение с предыдущим месяцем недоступно.";
        } else if (language === 'kk') {
          monthComparisonText = "Бұл сіздің бірінші деректер айы, өткен аймен салыстыру қол жетімді емес.";
        } else {
          monthComparisonText = "This is your first month of data, so no comparison with previous month is available.";
        }
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

      // Get weather context (localized)
      let weatherContext = "";
      try {
        const weather = await weatherService.getCurrentWeatherByRegion("Almaty");
        const forecast = await weatherService.getWeatherForecast("Almaty", 7);
        
        if (weather) {
          if (language === 'ru') {
            weatherContext = `Текущая погода в Алматы: ${weather.temperature}°C, ${weather.description}. ${weather.impact}`;
            if (forecast && forecast.length > 0) {
              const nextWeekTemp = forecast.slice(1, 4).map((f: any) => f.temperature || f.temp || weather.temperature).reduce((a: number, b: number) => a + b, 0) / 3;
              const tempTrend = nextWeekTemp > weather.temperature ? "теплее" : "прохладнее";
              weatherContext += ` Прогноз: ближайшие 3 дня будет ${tempTrend} (средняя ${Math.round(nextWeekTemp)}°C).`;
            }
          } else if (language === 'kk') {
            weatherContext = `Алматыдағы ағымдағы ауа-райы: ${weather.temperature}°C, ${weather.description}. ${weather.impact}`;
            if (forecast && forecast.length > 0) {
              const nextWeekTemp = forecast.slice(1, 4).map((f: any) => f.temperature || f.temp || weather.temperature).reduce((a: number, b: number) => a + b, 0) / 3;
              const tempTrend = nextWeekTemp > weather.temperature ? "жылырақ" : "салқындау";
              weatherContext += ` Болжам: келесі 3 күн ${tempTrend} болады (орташа ${Math.round(nextWeekTemp)}°C).`;
            }
          } else {
            weatherContext = `Current weather in Almaty: ${weather.temperature}°C, ${weather.description}. ${weather.impact}`;
            if (forecast && forecast.length > 0) {
              const nextWeekTemp = forecast.slice(1, 4).map((f: any) => f.temperature || f.temp || weather.temperature).reduce((a: number, b: number) => a + b, 0) / 3;
              const tempTrend = nextWeekTemp > weather.temperature ? "warmer" : "cooler";
              weatherContext += ` Weather forecast: Next 3 days will be ${tempTrend} (avg ${Math.round(nextWeekTemp)}°C).`;
            }
          }
        }
      } catch (error) {
        console.error("Weather service error for CO2 insights:", error);
      }

      // Generate AI analysis using OpenAI with 7 diverse insight types
      const prompt = `
        CRITICAL: ${language === 'ru' ? 'Отвечай ТОЛЬКО на русском языке.' : language === 'kk' ? 'Жауапты ТЕКСЕН қазақ тілінде беріңіз.' : 'Respond ONLY in English.'}

        ${language === 'ru' ? 'Проанализируй углеродный след и создай 3-4 РАЗНЫХ типа инсайтов из списка ниже.' : language === 'kk' ? 'Көміртегі ізін талдап, төмендегі тізімнен 3-4 ТҮРЛІ түсініктеме жасаңыз.' : 'Analyze carbon footprint and create 3-4 DIFFERENT types of insights from the list below.'}

        ${language === 'ru' ? `Данные CO2 выбросов (текущий месяц):
        - Общие выбросы CO2: ${currentCO2.total.toFixed(1)} кг
        - Электричество: ${currentCO2.breakdown.electricity.toFixed(1)} кг CO2 (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Газ: ${currentCO2.breakdown.gas.toFixed(1)} кг CO2 (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Отопление: ${currentCO2.breakdown.heating.toFixed(1)} кг CO2 (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Вода: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} кг CO2

        Региональное сравнение:
        - Ваши выбросы: ${currentCO2.total.toFixed(1)} кг CO2
        - Средний по Алматы: ${almatyAverage} кг CO2
        - Вы на ${Math.abs(parseFloat(percentDiff))}% ${comparisonType === 'above' ? 'выше' : 'ниже'} среднего

        Эквиваленты:
        - ${fuelLiters} литров бензина
        - ${treesNeeded} деревьев для компенсации в год
        - ${flightsAlmatyAstana} рейсов Алматы-Астана
        - Годовой прогноз: ${yearlyProjection} тонн CO2

        Изменение за месяц: ${monthComparisonText}
        Погода: ${weatherContext}` 
        : language === 'kk' ? 
        `CO2 шығарындылары деректері (ағымдағы ай):
        - Жалпы CO2 шығарындылары: ${currentCO2.total.toFixed(1)} кг
        - Электр: ${currentCO2.breakdown.electricity.toFixed(1)} кг CO2 (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Газ: ${currentCO2.breakdown.gas.toFixed(1)} кг CO2 (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Жылыту: ${currentCO2.breakdown.heating.toFixed(1)} кг CO2 (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Су: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} кг CO2

        Аймақтық салыстыру:
        - Сіздің шығарындыларыңыз: ${currentCO2.total.toFixed(1)} кг CO2
        - Алматы орташа: ${almatyAverage} кг CO2
        - Сіз орташадан ${Math.abs(parseFloat(percentDiff))}% ${comparisonType === 'above' ? 'жоғары' : 'төмен'}

        Эквиваленттер:
        - ${fuelLiters} литр бензин
        - ${treesNeeded} ағаш өтемақы үшін жылына
        - ${flightsAlmatyAstana} Алматы-Астана рейсі
        - Жылдық болжам: ${yearlyProjection} тонна CO2

        Ай бойынша өзгеріс: ${monthComparisonText}
        Ауа-райы: ${weatherContext}` 
        : 
        `CO2 emissions data (current month):
        - Total CO2 emissions: ${currentCO2.total.toFixed(1)} kg
        - Electricity: ${currentCO2.breakdown.electricity.toFixed(1)} kg CO2 (${((currentCO2.breakdown.electricity/currentCO2.total)*100).toFixed(1)}%)
        - Gas: ${currentCO2.breakdown.gas.toFixed(1)} kg CO2 (${((currentCO2.breakdown.gas/currentCO2.total)*100).toFixed(1)}%)
        - Heating: ${currentCO2.breakdown.heating.toFixed(1)} kg CO2 (${((currentCO2.breakdown.heating/currentCO2.total)*100).toFixed(1)}%)
        - Water: ${(currentCO2.breakdown.coldWater + currentCO2.breakdown.hotWater + currentCO2.breakdown.sewage).toFixed(1)} kg CO2

        Regional comparison:
        - Your emissions: ${currentCO2.total.toFixed(1)} kg CO2
        - Almaty average: ${almatyAverage} kg CO2
        - You are ${Math.abs(parseFloat(percentDiff))}% ${comparisonType === 'above' ? 'above' : 'below'} average

        Equivalents:
        - ${fuelLiters} liters of gasoline
        - ${treesNeeded} trees to offset per year
        - ${flightsAlmatyAstana} Almaty-Astana flights
        - Yearly projection: ${yearlyProjection} tonnes CO2

        Monthly change: ${monthComparisonText}
        Weather: ${weatherContext}`}

        7 ТИПОВ ИНСАЙТОВ (используй РАЗНЫЕ типы каждый раз):

        ${language === 'ru' ? 
          `1. ИНФОРМАЦИОННЫЕ - констатация фактов:
          Пример: "Твой углеродный след за месяц составил ${currentCO2.total.toFixed(1)} кг CO2"

          2. РЕКОМЕНДАТЕЛЬНЫЕ - конкретные советы:
          Пример: "Снижение потребления электричества на 10% уменьшит выбросы на ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} кг CO2"

          3. ДИНАМИЧЕСКИЕ - показывают изменения:
          Пример: "По сравнению с прошлым месяцем выбросы ${currentCO2.total > (previousCO2?.total || currentCO2.total) ? 'увеличились' : 'снизились'}"

          4. ОБЪЯСНИТЕЛЬНО-АНАЛИТИЧЕСКИЕ - анализ причин:
          Пример: "Основной источник выбросов — ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'электричество' : 'газ'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} кг CO2)"

          5. МОТИВАЦИОННЫЕ - поощрение прогресса:
          Пример: "Отличная работа! Твои выбросы ${comparisonType === 'below' ? 'ниже' : 'близки к'} среднему по региону"

          6. ОБЗОРНЫЕ - месячные итоги с эквивалентами:
          Пример: "${currentCO2.total.toFixed(1)} кг CO2 = ${fuelLiters} л бензина или ${treesNeeded} деревьев для компенсации"

          7. ПЛАНИРОВОЧНЫЕ - прогноз и цели:
          Пример: "При текущем темпе годовой след будет ${yearlyProjection} тонн CO2"

          ВАЖНО: Генерируй РАЗНЫЕ типы каждый раз! Используй РЕАЛЬНЫЕ данные из промпта!` 
          : language === 'kk' ? 
          `1. АҚПАРАТТЫҚ - фактілерді баяндау:
          Мысал: "Сіздің айлық көміртегі ізі ${currentCO2.total.toFixed(1)} кг CO2 құрады"

          2. ҰСЫНЫМДЫҚ - нақты кеңестер:
          Мысал: "Электр тұтынуды 10% азайту ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} кг CO2 азайтады"

          3. ДИНАМИКАЛЫҚ - өзгерістерді көрсету:
          Мысал: "Өткен айға қарағанда шығарындылар ${currentCO2.total > (previousCO2?.total || currentCO2.total) ? 'өсті' : 'азайды'}"

          4. ТҮСІНДІРМЕЛІ-ТАЛДАМАЛЫҚ - себептерді талдау:
          Мысал: "Негізгі көз — ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'электр' : 'газ'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} кг CO2)"

          5. МОТИВАЦИЯЛЫҚ - үдерісті мадақтау:
          Мысал: "Керемет! Шығарындыларыңыз аймақ бойынша ${comparisonType === 'below' ? 'төмен' : 'орташа деңгейде'}"

          6. ШОЛУ - айлық қорытынды эквиваленттермен:
          Мысал: "${currentCO2.total.toFixed(1)} кг CO2 = ${fuelLiters} л бензин немесе ${treesNeeded} ағаш өтемақы үшін"

          7. ЖОСПАРЛАУ - болжам және мақсаттар:
          Мысал: "Қазіргі қарқында жылдық із ${yearlyProjection} тонна CO2 болады"

          МАҢЫЗДЫ: Әр рет ТҮРЛІ типтер қолдан! Промпттағі НАҚТЫ деректерді пайдалан!` 
          : 
          `1. DESCRIPTIVE - state facts:
          Example: "Your monthly carbon footprint was ${currentCO2.total.toFixed(1)} kg CO2"

          2. ADVISORY - specific advice:
          Example: "Reducing electricity by 10% would cut emissions by ${(currentCO2.breakdown.electricity * 0.1).toFixed(1)} kg CO2"

          3. PROGRESS TRACKING - show changes:
          Example: "Compared to last month, emissions ${currentCO2.total > (previousCO2?.total || currentCO2.total) ? 'increased' : 'decreased'}"

          4. CAUSAL/INSIGHT - analyze causes:
          Example: "Main source is ${currentCO2.breakdown.electricity > currentCO2.breakdown.gas ? 'electricity' : 'gas'} (${Math.max(currentCO2.breakdown.electricity, currentCO2.breakdown.gas).toFixed(1)} kg CO2)"

          5. ENGAGEMENT - encourage progress:
          Example: "Great work! Your emissions are ${comparisonType === 'below' ? 'below' : 'near'} regional average"

          6. SUMMARY - monthly recap with equivalents:
          Example: "${currentCO2.total.toFixed(1)} kg CO2 = ${fuelLiters}L gasoline or ${treesNeeded} trees to offset"

          7. FORECAST - predictions and goals:
          Example: "At current pace, yearly footprint will be ${yearlyProjection} tonnes CO2"

          IMPORTANT: Generate DIFFERENT types each time! Use REAL data from prompt!`}

        Respond in JSON format:
        {
          "insights": [
            {
              "title": "${language === 'ru' ? 'Заголовок инсайта' : language === 'kk' ? 'Түсініктеме тақырыбы' : 'Insight title'}",
              "description": "${language === 'ru' ? 'Описание с РЕАЛЬНЫМИ данными' : language === 'kk' ? 'НАҚТЫ деректермен сипаттама' : 'Description with REAL data'}",
              "category": "electricity/gas/heating/water/environmental",
              "potentialSavings": "${language === 'ru' ? 'потенциальное снижение CO2' : language === 'kk' ? 'CO2 азайтудың мүмкіндігі' : 'potential CO2 reduction'}",
              "priority": "high/medium/low"
            }
          ]
        }
      `;

      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: language === 'ru' 
              ? "Ты ИИ-консультант Econest по анализу углеродного следа. Генерируй РАЗНООБРАЗНЫЕ инсайты из 7 типов. Каждый раз используй РАЗНЫЕ типы (не повторяйся!). Используй РЕАЛЬНЫЕ данные из промпта. Отвечай ТОЛЬКО на русском языке." 
              : language === 'kk' 
              ? "Сіз Econest көміртегі ізін талдау бойынша ЖИ-кеңесшісіз. 7 типтен ӘРТҮРЛІ түсініктемелер жасаңыз. Әр рет БАСҚА типтерді қолданыңыз (қайталамаңыз!). Промпттан НАҚТЫ деректерді пайдаланыңыз. Жауапты ТЕК қазақ тілінде беріңіз." 
              : "You are Econest AI advisor for carbon footprint analysis. Generate DIVERSE insights from 7 types. Each time use DIFFERENT types (don't repeat!). Use REAL data from prompt. Respond ONLY in English."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.8,
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
