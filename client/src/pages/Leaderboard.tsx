import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Award,
  Users, 
  School,
  MapPin,
  TrendingUp,
  Share2,
  Star,
  Zap,
  ArrowLeft,
  Factory,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translateCityName } from "@/lib/i18n";

// Helper function to get available months (June 2025 to December 2025)
const getAvailableMonths = () => {
  const months = [];
  
  // June 2025 to December 2025
  for (let month = 6; month <= 12; month++) {
    months.push({
      month, 
      year: 2025, 
      name: new Date(2025, month - 1).toLocaleString('default', { month: 'long' }),
      value: `${month}-2025`
    });
  }
  
  return months;
};

export default function Leaderboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useI18n();
  const [, setLocation] = useLocation();
  
  const availableMonths = getAvailableMonths();
  const defaultMonth = availableMonths[0]; // Start with June 2025
  
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth?.month || 6);
  const [selectedYear, setSelectedYear] = useState(defaultMonth?.year || 2025);

  const goBack = () => {
    setLocation('/dashboard');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  const { data: regionsData } = useQuery({
    queryKey: ["/api/leaderboard/regions-monthly", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/regions-monthly?month=${selectedMonth}&year=${selectedYear}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch regions data');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={goBack} 
        className="mb-4 md:mb-6 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{language === 'ru' ? 'Назад к панели' : language === 'kk' ? 'Басқару панеліне' : 'Back to Dashboard'}</span>
        <span className="sm:hidden">{language === 'ru' ? 'Назад' : language === 'kk' ? 'Артқа' : 'Back'}</span>
      </Button>

      {/* Header - Mobile Optimized */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          {language === 'ru' ? 'Рейтинг CO₂' : language === 'kk' ? 'CO₂ рейтингі' : 'CO₂ Leaderboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-4 md:px-0">
          {language === 'ru' ? 'Сравните выбросы CO₂ по регионам за выбранный месяц' : language === 'kk' ? 'Таңдалған ай үшін аймақтар бойынша CO₂ шығарындыларын салыстырыңыз' : 'Compare CO₂ emissions by regions for selected month'}
        </p>
      </div>

      {/* Month Selection */}
      <div className="flex justify-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((monthData) => (
                <SelectItem key={monthData.value} value={String(monthData.month)}>
                  {monthData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Regions Leaderboard */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{language === 'ru' ? `Выбросы CO₂ по регионам - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}` : language === 'kk' ? `Аймақтар бойынша CO₂ шығарындылар - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('kk-KZ', { month: 'long', year: 'numeric' })}` : `Regions CO₂ Emissions - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}</CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-3 text-gray-700 dark:text-gray-200 font-semibold">{language === 'ru' ? 'Место' : language === 'kk' ? 'Орны' : 'Rank'}</th>
                  <th className="text-left p-3 text-gray-700 dark:text-gray-200 font-semibold">{language === 'ru' ? 'Регион' : language === 'kk' ? 'Аймақ' : 'Region'}</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-200 font-semibold">{language === 'ru' ? 'Общие CO₂ (кг)' : language === 'kk' ? 'Жалпы CO₂ (кг)' : 'Total CO₂ (kg)'}</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-200 font-semibold">{language === 'ru' ? 'Средние CO₂ (кг)' : language === 'kk' ? 'Орташа CO₂ (кг)' : 'Average CO₂ (kg)'}</th>
                  <th className="text-right p-3 text-gray-700 dark:text-gray-200 font-semibold">{language === 'ru' ? 'Пользователи' : language === 'kk' ? 'Пайдаланушылар' : 'Users'}</th>
                </tr>
              </thead>
              <tbody>
                {(regionsData || []).map((region: any, index: number) => (
                  <tr key={region.region} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="p-3 font-bold text-gray-800 dark:text-gray-100">#{index + 1}</td>
                    <td className="p-3 text-gray-800 dark:text-gray-100">{translateCityName(region.region, language)}</td>
                    <td className="p-3 text-right font-semibold text-gray-800 dark:text-gray-100">{region.totalCO2}</td>
                    <td className="p-3 text-right text-gray-800 dark:text-gray-100">{region.averageCO2}</td>
                    <td className="p-3 text-right text-gray-800 dark:text-gray-100">{region.userCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!regionsData || regionsData.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                {language === 'ru' ? 'Нет данных по регионам за этот месяц.' : language === 'kk' ? 'Осы айға арналған аймақтық деректер жоқ.' : 'No regional data available for this month.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}