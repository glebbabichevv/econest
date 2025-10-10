import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chart, registerables } from "chart.js";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme.tsx";

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
  onCategoryChange?: (
    category: "water-gas" | "electricity" | "heating",
  ) => void;
  showPeriodControls?: boolean;
}

export function ConsumptionChart({
  data = [],
  period = "month",
  category = "water-gas",
  onPeriodChange,
  onCategoryChange,
  showPeriodControls = false,
}: ConsumptionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { t, language } = useI18n();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Определяем цвета в зависимости от темы
    const isDark = theme === 'dark';
    const isOcean = theme === 'ocean';
    const textColor = isDark ? "#E5E7EB" : "#111827";
    const gridColor = isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(229, 231, 235, 0.8)";

    // Destroy existing chart before creating new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const loadChart = () => {

      // Цвета для линий/столбцов
      const colors = {
        coldWater: isOcean ? "#0891B2" : (isDark ? "#06B6D4" : "#0891B2"),
        hotWater: isOcean ? "#DC2626" : (isDark ? "#F87171" : "#DC2626"),
        sewage: isOcean ? "#6B7280" : (isDark ? "#9CA3AF" : "#6B7280"),
        gas: isOcean ? "#EA580C" : (isDark ? "#FB923C" : "#EA580C"),
        electricity: isOcean ? "#7C3AED" : (isDark ? "#A78BFA" : "#7C3AED"),
        heating: isOcean ? "#F59E0B" : (isDark ? "#FBBF24" : "#F59E0B"),
        current: isOcean ? "#059669" : (isDark ? "#10B981" : "#059669"),
        previous: isOcean ? "#64748B" : (isDark ? "#94A3B8" : "#64748B")
      };

      // Фоновые цвета с прозрачностью
      const bgColors = {
        coldWater: isDark ? "rgba(6, 182, 212, 0.2)" : "rgba(8, 145, 178, 0.15)",
        hotWater: isDark ? "rgba(248, 113, 113, 0.2)" : "rgba(220, 38, 38, 0.15)",
        sewage: isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(107, 114, 128, 0.15)",
        gas: isDark ? "rgba(251, 146, 60, 0.2)" : "rgba(234, 88, 12, 0.15)",
        electricity: isDark ? "rgba(167, 139, 250, 0.2)" : "rgba(124, 58, 237, 0.15)",
        heating: isDark ? "rgba(251, 191, 36, 0.2)" : "rgba(245, 158, 11, 0.15)",
        current: isDark ? "rgba(16, 185, 129, 0.7)" : "rgba(5, 150, 105, 0.7)",
        previous: isDark ? "rgba(148, 163, 184, 0.5)" : "rgba(100, 116, 139, 0.5)"
      };

      // Show empty state when no data
      if (!data || data.length === 0) {
        return;
      }

      // Создаем разные типы графиков в зависимости от периода
      let chartData: ChartData;
      let chartType: "line" | "bar";

      if (period === "year") {
        // Для годового периода - линейный график с данными по месяцам
        // Сортируем данные по readingDate для хронологического порядка
        const sortedData = [...data].sort((a, b) => {
          // Сортируем по году и месяцу
          const yearA = a.year || 2024;
          const monthA = a.month || 1;
          const yearB = b.year || 2024;
          const monthB = b.month || 1;

          if (yearA !== yearB) {
            return yearA - yearB;
          }
          return monthA - monthB;
        });

        const groupedData = sortedData.reduce(
          (acc, reading) => {
            // Используем поля month и year напрямую
            const monthKey = `${reading.year}-${String(reading.month).padStart(2, "0")}`;

            if (!acc[monthKey]) {
              acc[monthKey] = {
                coldWater: 0,
                hotWater: 0,
                sewage: 0,
                heating: 0,
                electricity: 0,
                gas: 0,
              };
            }

            acc[monthKey].coldWater += Number(reading.coldWater) || 0;
            acc[monthKey].hotWater += Number(reading.hotWater) || 0;
            acc[monthKey].sewage += Number(reading.sewage) || 0;
            acc[monthKey].heating += Number(reading.heating) || 0;
            acc[monthKey].electricity += Number(reading.electricity) || 0;
            acc[monthKey].gas += Number(reading.gas) || 0;

            return acc;
          },
          {} as Record<
            string,
            {
              coldWater: number;
              hotWater: number;
              sewage: number;
              heating: number;
              electricity: number;
              gas: number;
            }
          >,
        );

        const sortedMonthKeys = Object.keys(groupedData).sort();

        chartData = {
          labels: sortedMonthKeys.map((monthKey) => {
            const [year, month] = monthKey.split("-");
            return new Date(
              parseInt(year),
              parseInt(month) - 1,
            ).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          }),
          datasets: [
            ...(category === "water-gas"
              ? [
                  {
                    label: t("charts.coldWaterUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].coldWater,
                    ),
                    borderColor: colors.coldWater,
                    backgroundColor: bgColors.coldWater,
                    tension: 0.4,
                    fill: false,
                  },
                  {
                    label: t("charts.hotWaterUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].hotWater,
                    ),
                    borderColor: colors.hotWater,
                    backgroundColor: bgColors.hotWater,
                    tension: 0.4,
                    fill: false,
                  },
                  {
                    label: t("charts.sewageUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].sewage,
                    ),
                    borderColor: colors.sewage,
                    backgroundColor: bgColors.sewage,
                    tension: 0.4,
                    fill: false,
                  },
                  {
                    label: t("charts.gasUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].gas,
                    ),
                    borderColor: colors.gas,
                    backgroundColor: bgColors.gas,
                    tension: 0.4,
                    fill: false,
                  },
                ]
              : []),
            ...(category === "electricity"
              ? [
                  {
                    label: t("charts.electricityUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].electricity,
                    ),
                    borderColor: colors.electricity,
                    backgroundColor: bgColors.electricity,
                    tension: 0.4,
                    fill: false,
                  },
                ]
              : []),
            ...(category === "heating"
              ? [
                  {
                    label: t("charts.heatingUnit"),
                    data: sortedMonthKeys.map(
                      (monthKey) => groupedData[monthKey].heating,
                    ),
                    borderColor: colors.heating,
                    backgroundColor: bgColors.heating,
                    tension: 0.4,
                    fill: false,
                  },
                ]
              : []),
          ],
        };
        chartType = "line";
      } else {
        const today = new Date();
        const pastData = data.filter((reading) => {
          const readingDate = reading.readingDate
            ? new Date(reading.readingDate)
            : new Date(reading.year || 2024, (reading.month || 1) - 1);
          return readingDate.getTime() <= today.getTime();
        });

        const sortedData = pastData.sort((a, b) => {
          const dateA = a.readingDate
            ? new Date(a.readingDate)
            : new Date(a.year || 2024, (a.month || 1) - 1);
          const dateB = b.readingDate
            ? new Date(b.readingDate)
            : new Date(b.year || 2024, (b.month || 1) - 1);

          return dateB.getTime() - dateA.getTime();
        });

        const currentPeriod = sortedData[0] || {};
        const previousPeriod = sortedData[1] || {};

        const currentLabel =
          period === "month" ? t("chart.currentMonth") : t("chart.currentWeek");
        const previousLabel =
          period === "month"
            ? t("chart.previousMonth")
            : t("chart.previousWeek");

        const getLabelsForCategory = () => {
          if (category === "water-gas")
            return [
              t("charts.coldWater"),
              t("charts.hotWater"),
              t("charts.sewage"),
              t("charts.gas"),
            ];
          if (category === "electricity") return [t("charts.electricity")];
          if (category === "heating") return [t("charts.heating")];
          return [];
        };

        const getDataForCategory = (reading: any) => {
          if (category === "water-gas")
            return [
              Number(reading.coldWater) || 0,
              Number(reading.hotWater) || 0,
              Number(reading.sewage) || 0,
              Number(reading.gas) || 0,
            ];
          if (category === "electricity")
            return [Number(reading.electricity) || 0];
          if (category === "heating") return [Number(reading.heating) || 0];
          return [];
        };

        const datasets = [
          {
            label: currentLabel,
            data: getDataForCategory(currentPeriod),
            borderColor: colors.current,
            backgroundColor: bgColors.current,
            tension: 0.4,
            fill: true,
          },
        ];

        // Добавляем Previous Month только если есть данные для previousPeriod
        if (previousPeriod && Object.keys(previousPeriod).length > 0) {
          datasets.push({
            label: previousLabel,
            data: getDataForCategory(previousPeriod),
            borderColor: colors.previous,
            backgroundColor: bgColors.previous,
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

    // Cleanup function to destroy chart when component unmounts or dependencies change
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, t, period, category, theme]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t("dashboard.consumptionTrends")}
          </CardTitle>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={category === "water-gas" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("water-gas")}
                className="text-xs px-2 flex-1 sm:flex-none min-w-0"
              >
                {language === "ru"
                  ? "Вода"
                  : language === "kk"
                    ? "Су"
                    : "Water"}
              </Button>
              <Button
                variant={category === "electricity" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("electricity")}
                className="text-xs px-2 flex-1 sm:flex-none min-w-0"
              >
                {language === "ru"
                  ? "Электр"
                  : language === "kk"
                    ? "Электр"
                    : "Electric"}
              </Button>
              <Button
                variant={category === "heating" ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange?.("heating")}
                className="text-xs px-2 flex-1 sm:flex-none min-w-0"
              >
                {language === "ru"
                  ? "Отопление"
                  : language === "kk"
                    ? "Жылыту"
                    : "Heat"}
              </Button>
            </div>
            {showPeriodControls && (
              <div className="flex gap-2">
                <Button
                  variant={period === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange?.("month")}
                  className="text-xs px-3"
                >
                  {language === "ru"
                    ? "Месяц"
                    : language === "kk"
                      ? "Ай"
                      : "Month"}
                </Button>
                <Button
                  variant={period === "year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange?.("year")}
                  className="text-xs px-3"
                >
                  {language === "ru"
                    ? "Год"
                    : language === "kk"
                      ? "Жыл"
                      : "Year"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">
                {t("dashboard.noDataAvailable")}
              </p>
              <p className="text-sm">{t("dashboard.addReadingsToSee")}</p>
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
