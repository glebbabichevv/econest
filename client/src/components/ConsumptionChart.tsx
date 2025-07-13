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
  period?: "week" | "month" | "year";
  onPeriodChange?: (period: "week" | "month" | "year") => void;
}

export function ConsumptionChart({ data = [], period = "month", onPeriodChange }: ConsumptionChartProps) {
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
        const groupedData = data.reduce((acc, reading) => {
          const date = new Date(reading.readingDate || reading.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[monthKey]) {
            acc[monthKey] = { water: 0, electricity: 0, gas: 0 };
          }
          
          acc[monthKey].water += Number(reading.water) || 0;
          acc[monthKey].electricity += Number(reading.electricity) || 0;
          acc[monthKey].gas += Number(reading.gas) || 0;
          
          return acc;
        }, {} as Record<string, {water: number, electricity: number, gas: number}>);

        chartData = {
          labels: Object.keys(groupedData).sort(),
          datasets: [
            {
              label: t('chart.water'),
              data: Object.keys(groupedData).sort().map(monthKey => groupedData[monthKey].water),
              borderColor: theme === "dark" || theme === "spooky" ? "#22D3EE" : "#0891B2",
              backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(34, 211, 238, 0.2)" : "rgba(8, 145, 178, 0.15)",
              tension: 0.4,
              fill: false,
            },
            {
              label: t('chart.electricity'),
              data: Object.keys(groupedData).sort().map(monthKey => groupedData[monthKey].electricity),
              borderColor: theme === "dark" || theme === "spooky" ? "#A78BFA" : "#7C3AED",
              backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(167, 139, 250, 0.2)" : "rgba(124, 58, 237, 0.15)",
              tension: 0.4,
              fill: false,
            },
            {
              label: t('chart.gas'),
              data: Object.keys(groupedData).sort().map(monthKey => groupedData[monthKey].gas),
              borderColor: theme === "dark" || theme === "spooky" ? "#FB923C" : "#EA580C",
              backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(251, 146, 60, 0.2)" : "rgba(234, 88, 12, 0.15)",
              tension: 0.4,
              fill: false,
            }
          ],
        };
        chartType = "line";
      } else {
        // Для месяца и недели - столбчатая диаграмма сравнения с предыдущими периодами
        const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const currentPeriod = sortedData[0] || {};
        const previousPeriod = sortedData[1] || {};
        
        const currentLabel = period === "month" ? t('chart.currentMonth') : t('chart.currentWeek');
        const previousLabel = period === "month" ? t('chart.previousMonth') : t('chart.previousWeek');
        
        chartData = {
          labels: [t('chart.water').split(' ')[0], t('chart.electricity').split(' ')[0], t('chart.gas').split(' ')[0]],
          datasets: [
            {
              label: currentLabel,
              data: [
                Number(currentPeriod.water) || 0,
                Number(currentPeriod.electricity) || 0,
                Number(currentPeriod.gas) || 0
              ],
              borderColor: theme === "dark" || theme === "spooky" ? "#34D399" : "#059669",
              backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(52, 211, 153, 0.8)" : "rgba(5, 150, 105, 0.7)",
              tension: 0.4,
              fill: true,
            },
            {
              label: previousLabel,
              data: [
                Number(previousPeriod.water) || 0,
                Number(previousPeriod.electricity) || 0,
                Number(previousPeriod.gas) || 0
              ],
              borderColor: theme === "dark" || theme === "spooky" ? "#CBD5E1" : "#64748B",
              backgroundColor: theme === "dark" || theme === "spooky" ? "rgba(203, 213, 225, 0.6)" : "rgba(100, 116, 139, 0.5)",
              tension: 0.4,
              fill: true,
            }
          ],
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
  }, [data, theme, t, period]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t('dashboard.consumptionTrends')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange?.("week")}
            >
              {t('common.week')}
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange?.("month")}
            >
              {t('common.month')}
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange?.("year")}
            >
              {t('common.year')}
            </Button>
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