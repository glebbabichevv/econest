import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

type Period = "week" | "month" | "year";
type ChartType = "bar" | "pie" | "line";

export default function Analytics() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>("month");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", period],
    enabled: !!user,
  });

  // Empty data since user hasn't input anything yet
  const data = (analyticsData as any[]) || [];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="water" fill="#0088FE" name="Вода (м³)" />
        <Bar dataKey="electricity" fill="#00C49F" name="Электричество (кВт⋅ч)" />
        <Bar dataKey="gas" fill="#FFBB28" name="Газ (м³)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500 dark:text-gray-400">Нет данных для отображения</p>
        </div>
      );
    }

    const totalConsumption = data.reduce((acc: any, curr: any) => ({
      water: acc.water + (curr.water || 0),
      electricity: acc.electricity + (curr.electricity || 0),
      gas: acc.gas + (curr.gas || 0),
    }), { water: 0, electricity: 0, gas: 0 });

    const pieData = [
      { name: t('chart.water'), value: totalConsumption.water, color: COLORS[0] },
      { name: t('chart.electricity'), value: totalConsumption.electricity, color: COLORS[1] },
      { name: t('chart.gas'), value: totalConsumption.gas, color: COLORS[2] },
    ].filter(item => item.value > 0);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="water" stroke="#0088FE" strokeWidth={2} name="Water (m³)" />
        <Line type="monotone" dataKey="electricity" stroke="#00C49F" strokeWidth={2} name="Electricity (kWh)" />
        <Line type="monotone" dataKey="gas" stroke="#FFBB28" strokeWidth={2} name="Gas (m³)" />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return renderBarChart();
      case "pie":
        return renderPieChart();
      case "line":
        return renderLineChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 px-4 md:px-0">
        {/* Header - Mobile Optimized */}
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {t("header.analytics")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
            Detailed analysis of resource consumption
          </p>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Period Selection - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.period')}:</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: "week", label: t('common.week') },
                { value: "month", label: t('common.month') },
                { value: "year", label: t('common.year') }
              ].map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p.value as Period)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Type Selection - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.chartType')}:</span>
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("pie")}
              >
                <PieChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resource Consumption
              <Badge variant="outline">
                {period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Yearly"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No data available for analysis
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Add meter readings to see analytics
                  </p>
                </div>
              </div>
            ) : (
              renderChart()
            )}
          </CardContent>
        </Card>

        {/* Summary Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Consumption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Data will appear after adding readings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Data will appear after adding readings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Data will appear after adding readings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}