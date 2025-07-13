interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  impact: string;
}

class WeatherService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "your_openweather_api_key";
  }

  async getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name,
        impact: this.calculateWeatherImpact(data.main.temp, data.weather[0].main),
      };

      return weatherData;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  private calculateWeatherImpact(temperature: number, condition: string): string {
    if (temperature < 0) {
      return "Very cold weather increases heating costs by 20-30%. Consider additional insulation.";
    } else if (temperature < 10) {
      return "Cold weather increases heating demand. Expected 15% increase in energy usage.";
    } else if (temperature > 30) {
      return "Hot weather increases cooling costs. Consider using fans and closing blinds during peak hours.";
    } else if (temperature > 25) {
      return "Warm weather may increase cooling usage. Monitor air conditioning usage.";
    } else {
      return "Moderate weather conditions. Good opportunity to reduce heating/cooling costs.";
    }
  }

  async getCurrentWeatherByRegion(region: string): Promise<WeatherData | null> {
    // Map region codes to city names for Kazakhstan
    const regionMapping: Record<string, string> = {
      'almaty': 'Almaty,KZ',
      'astana': 'Nur-Sultan,KZ',
      'shymkent': 'Shymkent,KZ',
      'aktobe': 'Aktobe,KZ',
      'taraz': 'Taraz,KZ',
      'pavlodar': 'Pavlodar,KZ',
      'ust-kamenogorsk': 'Ust-Kamenogorsk,KZ',
      'semey': 'Semey,KZ',
    };

    const cityName = regionMapping[region.toLowerCase()];
    if (!cityName) {
      // Return mock data for demo if region not found
      return this.getMockWeatherData(region);
    }

    try {
      if (this.apiKey && this.apiKey !== 'your_openweather_api_key_here') {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.apiKey}&units=metric`
        );

        if (response.ok) {
          const data = await response.json();
          
          const weatherData: WeatherData = {
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            location: data.name,
            impact: this.calculateWeatherImpact(data.main.temp, data.weather[0].main),
          };

          return weatherData;
        }
      }
      
      // Fallback to mock data if API fails or key not available
      return this.getMockWeatherData(region);
    } catch (error) {
      console.error("Weather service error for region:", region, error);
      return this.getMockWeatherData(region);
    }
  }

  private getMockWeatherData(region: string): WeatherData {
    // Mock weather data for different regions based on typical July weather in Kazakhstan
    const mockData: Record<string, WeatherData> = {
      'almaty': {
        temperature: 28,
        description: 'Sunny',
        humidity: 45,
        windSpeed: 2.1,
        location: 'Almaty',
        impact: 'Hot weather increases electricity consumption for air conditioning by 20%. Use energy-saving modes.',
      },
      'astana': {
        temperature: 25,
        description: 'Clear',
        humidity: 52,
        windSpeed: 3.2,
        location: 'Astana',
        impact: 'Comfortable summer temperature. Energy consumption is normal. Ventilation recommended during cool hours.',
      },
      'shymkent': {
        temperature: 32,
        description: 'Hot',
        humidity: 38,
        windSpeed: 1.8,
        location: 'Shymkent',
        impact: 'Very hot weather. Electricity consumption for cooling increased by 35%. Avoid peak hours.',
      },
      'aktobe': {
        temperature: 26,
        description: 'Clear',
        humidity: 48,
        windSpeed: 3.5,
        location: 'Aktobe',
        impact: 'Warm summer weather. Moderate energy consumption for cooling. Ventilation recommended.',
      },
      'taraz': {
        temperature: 30,
        description: 'Sunny',
        humidity: 42,
        windSpeed: 2.8,
        location: 'Taraz',
        impact: 'Hot weather increases electricity consumption for air conditioning by 25%.',
      },
      'pavlodar': {
        temperature: 24,
        description: 'Partly cloudy',
        humidity: 55,
        windSpeed: 3.2,
        location: 'Pavlodar',
        impact: 'Comfortable summer temperature. Energy consumption is normal.',
      },
      'ust-kamenogorsk': {
        temperature: 22,
        description: 'Cloudy',
        humidity: 62,
        windSpeed: 1.5,
        location: 'Ust-Kamenogorsk',
        impact: 'Cool summer weather. Minimal energy consumption for cooling.',
      },
      'semey': {
        temperature: 27,
        description: 'Sunny',
        humidity: 46,
        windSpeed: 2.8,
        location: 'Semey',
        impact: 'Warm sunny weather. Moderate electricity consumption for cooling.',
      },
    };

    return mockData[region] || {
      temperature: 25,
      description: 'Sunny',
      humidity: 50,
      windSpeed: 3.0,
      location: region,
      impact: 'Comfortable summer weather. Energy consumption is normal.',
    };
  }

  async getWeatherForecast(location: string, days: number = 5): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return data.list.map((item: any) => ({
        date: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        humidity: item.main.humidity,
      }));
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      return [];
    }
  }
}

export const weatherService = new WeatherService();
