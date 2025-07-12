import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, TreePine, Factory, Home, TrendingDown } from "lucide-react";
import { useEffect } from "react";

export default function Footprint() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  const { data: footprintData, isLoading: footprintLoading } = useQuery({
    queryKey: ["/api/footprint"],
    enabled: isAuthenticated,
  });

  if (isLoading || footprintLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Загрузка экологического следа...</p>
          </div>
        </div>
      </div>
    );
  }

  const carbonData = footprintData?.carbonFootprint || {
    total: 2.4,
    breakdown: { electricity: 1.2, gas: 0.8, water: 0.4 },
    comparison: { family: 3.2, region: 2.8, country: 4.1 },
    treesNeeded: 12
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          Ваш экологический след
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-2 md:px-0">
          Оцените воздействие вашего потребления на окружающую среду и узнайте, как его уменьшить
        </p>
      </div>

      {/* Main CO2 Card */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Factory className="h-6 w-6 text-green-600" />
            Ваш месячный выброс CO₂
          </CardTitle>
          <CardDescription>Общее количество углекислого газа</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {carbonData.total} тонны
            </div>
            <Badge variant="secondary" className="text-sm">
              CO₂ эквивалент
            </Badge>
          </div>

          {/* Breakdown - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-xl font-semibold text-blue-600">{carbonData.breakdown.electricity}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Электричество</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-xl font-semibold text-orange-600">{carbonData.breakdown.gas}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Газ</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-xl font-semibold text-cyan-600">{carbonData.breakdown.water}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Вода</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Средняя семья
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{carbonData.comparison.family} т</div>
            <Progress 
              value={(carbonData.total / carbonData.comparison.family) * 100} 
              className="mb-2" 
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Вы на {((carbonData.comparison.family - carbonData.total) / carbonData.comparison.family * 100).toFixed(0)}% лучше
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Региональная норма
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{carbonData.comparison.region} т</div>
            <Progress 
              value={(carbonData.total / carbonData.comparison.region) * 100} 
              className="mb-2" 
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Вы на {((carbonData.comparison.region - carbonData.total) / carbonData.comparison.region * 100).toFixed(0)}% лучше
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              Компенсация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{carbonData.treesNeeded} деревьев</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Нужно посадить для компенсации выбросов
            </p>
            <Button size="sm" className="w-full">
              Участвовать в посадке
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Eco Mode Card */}
      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6" />
            Начните экорежим
          </CardTitle>
          <CardDescription className="text-emerald-100">
            Получите персональный план по снижению экологического следа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="mb-2">Потенциальная экономия:</p>
            <ul className="space-y-1 text-sm">
              <li>• Снижение выбросов на 30-40%</li>
              <li>• Экономия до 2000₽ в месяц</li>
              <li>• Компенсация 8 деревьев</li>
            </ul>
          </div>
          <Button 
            size="lg" 
            className="w-full bg-white text-green-600 hover:bg-gray-100"
          >
            Начать экорежим
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}