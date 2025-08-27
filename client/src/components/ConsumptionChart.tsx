import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chart, registerables } from 'chart.js';
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/hooks/useI18n";

Chart.register(...registerables);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    fill: boolean;
  }[];
}

interface ConsumptionChartProps {
  data?: any[];
  period?: "month" | "year";
  category?: "water-gas" | "electricity" | "heating";
  onPeriodChange?: (period: "month" | "year") => void;
  onCategoryChange?: (category: "water-gas" | "electricity" | "heating") => void;
  showPeriodControls?: boolean;
}

export function ConsumptionChart({ data = [], period = "month", category = "water-gas", onPeriodChange, onCategoryChange, showPeriodControls = false }: ConsumptionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { theme } = useTheme();
  const { t } = useI18n();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const loadChart = () => {
      const textColor = theme === "dark" || theme === "spooky" ? "#FFFFFF" : "#111827";
      const gridColor = theme === "dark" || theme === "spooky" ? "#6B7280" : "#E5E7EB";

      // Show empty state when no data
      if (!data || data.length === 0) {
        // Don't render chart, show empty message
        return;
      }

      // Создаем разные типы графиков в зависимости от периода
      let chartData: ChartData;
      let chartType: "line" | "bar";
      
      if (period === "year") {
        // Для годового периода - линейный график с данными по месяцам
        // Сортируем данные по readingDate для хронологического порядка
        const sortedData = [...data].sort((a, b) => {
          const dateA = a.readingDate ? new Date(a.readingDate) : new Date(a.year || 2024, (a.month || 1) - 1);
          const dateB = b.readingDate ? new Date(b.readingDate) : new Date(b.year || 2024, (b.month || 1) - 1);
          return dateA.getTime() - dateB.getTime();
        });
        
        const groupedData = sortedData.reduce((acc, reading) => {
          // Используем поля month и year напрямую, если они есть, иначе берем из readingDate
          const monthKey = reading.month && reading.year 
            ? `${reading.year}-${String(reading.month).padStart(2, '0')}`
            : (() => {
                const date = new Date(reading.readingDate || reading.createdAt);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              })();
          
          if (!acc[monthKey]) {
            acc[monthKey] = { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 };
          }
          
          acc[monthKey].coldWater += Number(reading.coldWater) || 0;
          acc[monthKey].hotWater += Number(reading.hotWater) || 0;
          acc[monthKey].sewage += Number(reading.sewage) || 0;
          acc[monthKey].heating += Number(reading.heating) || 0;
          acc[monthKey].electricity += Number(reading.electricity) || 0;
          acc[monthKey].gas += Number(reading.gas) || 0;
          
          return acc;
        }, {} as Record<string, {coldWater: number, hotWater: number, sewage: number, heating: number, electricity: number, gas: number}>);

        const sortedMonthKeys = Object.keys(groupedData).sort();
        chartData = {
          labels: sortedMonthKeys.map(monthKey => {
            const [year, month] = monthKey.split('-');
            return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            });
          }),
          datasets: [
            ...(category === "water-gas" ? [
              {
                label: 'Cold Water (m³)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].coldWater),
                borderColor: theme === "dark" || theme === "spooky" ? "#22D3EE" : "#0891B2",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(34, 211, 238, 0.2)" : "rgba(8, 145, 178, 0.15)",
                tension: 0.4,
                fill: false,
              },
              {
                label: 'Hot Water (m³)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].hotWater),
                borderColor: theme === "dark" || theme === "spooky" ? "#F87171" : "#DC2626",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(248, 113, 113, 0.2)" : "rgba(220, 38, 38, 0.15)",
                tension: 0.4,
                fill: false,
              },
              {
                label: 'Sewage (m³)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].sewage),
                borderColor: theme === "dark" || theme === "spooky" ? "#9CA3AF" : "#6B7280",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(156, 163, 175, 0.2)" : "rgba(107, 114, 128, 0.15)",
                tension: 0.4,
                fill: false,
              },
              {
                label: 'Gas (m³)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].gas),
                borderColor: theme === "dark" || theme === "spooky" ? "#FB923C" : "#EA580C",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(251, 146, 60, 0.2)" : "rgba(234, 88, 12, 0.15)",
                tension: 0.4,
                fill: false,
              }
            ] : []),
            ...(category === "electricity" ? [
              {
                label: 'Electricity (kWh)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].electricity),
                borderColor: theme === "dark" || theme === "spooky" ? "#A78BFA" : "#7C3AED",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(167, 139, 250, 0.2)" : "rgba(124, 58, 237, 0.15)",
                tension: 0.4,
                fill: false,
              }
            ] : []),
            ...(category === "heating" ? [
              {
                label: 'Heating (Gcal)',
                data: sortedMonthKeys.map(monthKey => groupedData[monthKey].heating),
                borderColor: theme === "dark" || theme === "spooky" ? "#FBBF24" : "#F59E0B",
                backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(251, 191, 36, 0.2)" : "rgba(245, 158, 11, 0.15)",
                tension: 0.4,
                fill: false,
              }
            ] : [])
          ],
        };
        chartType = "line";
      } else {
        // Для месяца и недели - столбчатая диаграмма сравнения с предыдущими периодами
        // Фильтруем только прошедшие даты и сортируем по убыванию
        const today = new Date();
        const pastData = data.filter(reading => {
          const readingDate = reading.readingDate ? new Date(reading.readingDate) : new Date(reading.year || 2024, (reading.month || 1) - 1);
          return readingDate.getTime() <= today.getTime();
        });

        const sortedData = pastData.sort((a, b) => {
          const dateA = a.readingDate ? new Date(a.readingDate) : new Date(a.year || 2024, (a.month || 1) - 1);
          const dateB = b.readingDate ? new Date(b.readingDate) : new Date(b.year || 2024, (b.month || 1) - 1);
          
          // Сортируем по дате убывания (новые записи сначала)
          return dateB.getTime() - dateA.getTime();
        });
        
        // Current month = ближайшая к сегодня (но в прошлом)
        // Previous month = ближайшая к current month (но до нее)
        const currentPeriod = sortedData[0] || {};
        const previousPeriod = sortedData[1] || {};
        
        const currentLabel = period === "month" ? t('chart.currentMonth') : t('chart.currentWeek');
        const previousLabel = period === "month" ? t('chart.previousMonth') : t('chart.previousWeek');
        
        const getLabelsForCategory = () => {
          if (category === "water-gas") return ['Cold Water', 'Hot Water', 'Sewage', 'Gas'];
          if (category === "electricity") return ['Electricity'];
          if (category === "heating") return ['Heating'];
          return [];
        };
        
        const getDataForCategory = (reading: any) => {
          if (category === "water-gas") return [
            Number(reading.coldWater) || 0,
            Number(reading.hotWater) || 0,
            Number(reading.sewage) || 0,
            Number(reading.gas) || 0
          ];
          if (category === "electricity") return [Number(reading.electricity) || 0];
          if (category === "heating") return [Number(reading.heating) || 0];
          return [];
        };

        // Создаем datasets, добавляем Previous только если есть данные
        const datasets = [
          {
            label: currentLabel,
            data: getDataForCategory(currentPeriod),
            borderColor: theme === "dark" || theme === "spooky" ? "#34D399" : "#059669",
            backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(52, 211, 153, 0.8)" : "rgba(5, 150, 105, 0.7)",
            tension: 0.4,
            fill: true,
          }
        ];

        // Добавляем Previous Month только если есть данные для previousPeriod  
        if (previousPeriod && Object.keys(previousPeriod).length > 0) {
          datasets.push({
            label: previousLabel,
            data: getDataForCategory(previousPeriod),
            borderColor: theme === "dark" || theme === "spooky" ? "#CBD5E1" : "#64748B",
            backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(203, 213, 225, 0.6)" : "rgba(100, 116, 139, 0.5)",
            tension: 0.4,
            fill: true,
          });
        }

        chartData = {
          labels: getLabelsForCategory(),
          datasets,
        };
        chartType = "bar";
      }

      chartRef.current = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom" as const,
              labels: {
                color: textColor,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor,
              },
              ticks: {
                color: textColor,
              },
            },
            x: {
              grid: {
                color: gridColor,
              },
              ticks: {
                color: textColor,
              },
            },
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 6,
            },
          },
        },
      });
    };

    loadChart();
  }, [data, theme, t, period, category]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t('dashboard.consumptionTrends')}
          </CardTitle>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant={category === "water-gas" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("water-gas")}
              >
                Water/Gas
              </Button>
              <Button
                variant={category === "electricity" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("electricity")}
              >
                Electricity
              </Button>
              <Button
                variant={category === "heating" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("heating")}
              >
                Heating
              </Button>
            </div>
            {showPeriodControls && (
              <div className="flex gap-2">
                <Button
                  variant={period === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange?.("month")}
                >
                  Monthly
                </Button>
                <Button
                  variant={period === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange?.("year")}
                >
                  Yearly
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(!data || data.length === 0) ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">{t('dashboard.noDataAvailable')}</p>
              <p className="text-sm">{t('dashboard.addReadingsToSee')}</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <canvas ref={canvasRef} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}