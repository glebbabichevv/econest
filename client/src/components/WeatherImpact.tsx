import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudSun, MapPin } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  description: string;
  impact: string;
  location?: string;
}

interface WeatherImpactProps {
  weather?: WeatherData;
}

export function WeatherImpact({ weather }: WeatherImpactProps) {
  const { t } = useI18n();
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [userHasSelectedRegion, setUserHasSelectedRegion] = useState(false);

  // Available regions for selection
  const regions = [
    { value: "almaty", label: t('regions.almaty') || "Алматы" },
    { value: "astana", label: t('regions.astana') || "Астана" },
    { value: "shymkent", label: t('regions.shymkent') || "Шымкент" },
    { value: "aktobe", label: t('regions.aktobe') || "Актобе" },
    { value: "taraz", label: t('regions.taraz') || "Тараз" },
    { value: "pavlodar", label: t('regions.pavlodar') || "Павлодар" },
    { value: "ust-kamenogorsk", label: t('regions.ust-kamenogorsk') || "Усть-Каменогорск" },
    { value: "semey", label: t('regions.semey') || "Семей" },
  ];

  // Fetch weather data for selected region
  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['weather', selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return null;
      const response = await fetch(`/api/weather/${selectedRegion}`);
      if (!response.ok) throw new Error('Failed to fetch weather');
      return response.json();
    },
    enabled: !!selectedRegion && userHasSelectedRegion,
  });

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setUserHasSelectedRegion(true);
    // Save user's region preference to localStorage
    localStorage.setItem('userRegion', region);
  };

  // Load saved region on component mount
  useEffect(() => {
    const savedRegion = localStorage.getItem('userRegion');
    if (savedRegion) {
      setSelectedRegion(savedRegion);
      setUserHasSelectedRegion(true);
    }
  }, []);

  const displayWeather = weatherData || weather;

  // If no region selected, show region selection
  if (!userHasSelectedRegion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.weatherImpact')}</span>
            <MapPin className="text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('weather.selectRegion') || "Выберите ваш регион для получения персонализированных советов"}
            </p>
            <Select onValueChange={handleRegionSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('weather.chooseRegion') || "Выберите регион"} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while fetching weather
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.weatherImpact')}</span>
            <CloudSun className="text-gray-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show weather data with option to change region
  const selectedRegionLabel = regions.find(r => r.value === selectedRegion)?.label || selectedRegion;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.weatherImpact')}</span>
          <div className="flex items-center gap-2">
            <CloudSun className="text-gray-400" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setUserHasSelectedRegion(false)}
              className="text-xs"
            >
              {t('weather.changeRegion') || "Изменить"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">{selectedRegionLabel}</span>
          </div>
          
          {displayWeather ? (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {displayWeather.temperature}°C
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {displayWeather.description}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {displayWeather.impact}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('weather.loadingData') || "Загружаем данные о погоде для вашего региона..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
