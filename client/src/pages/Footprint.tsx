import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Factory, Calendar, CalendarRange, BarChart3, PieChart as PieChartIcon, TrendingUp, TreePine, Bot, Sparkles, AlertCircle, Lightbulb, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

export default function Footprint() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [periodType, setPeriodType] = useState<'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  // Get footprint data with CO2 calculations
  const { data: footprintData, isLoading: footprintLoading } = useQuery({
    queryKey: ["/api/footprint"],
    enabled: isAuthenticated,
  });

  // Get AI footprint insights
  const { data: footprintInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/co2-insights"],
    enabled: isAuthenticated,
  });

  // Generate footprint insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/footprint-insights/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/co2-insights"] });
    },
    onError: (error) => {
      console.error("Error generating insights:", error);
    }
  });

  // Clear insights mutation  
  const clearInsightsMutation = useMutation({
    mutationFn: () => {
      console.log("Clearing insights...");
      return apiRequest("DELETE", "/api/co2-insights/clear");
    },
    onSuccess: (data) => {
      console.log("Insights cleared successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/co2-insights"] });
    },
    onError: (error) => {
      console.error("Error clearing insights:", error);
    },
  });

  if (isLoading || footprintLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading CO₂ footprint data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data based on period type
  const prepareCO2Data = () => {
    if (!footprintData || !(footprintData as any)?.monthlyData || !Array.isArray((footprintData as any).monthlyData)) {
      return { currentPeriod: null, yearlyData: [] };
    }

    const data = (footprintData as any).monthlyData as any[];
    
    if (periodType === 'month') {
      // Get current month data (most recent)
      const currentReading = data.length > 0 ? data[0] : null;
      if (!currentReading) return { currentPeriod: null, yearlyData: [] };
      
      // Group water services together for display
      const waterTotal = currentReading.co2.breakdown.coldWater + currentReading.co2.breakdown.hotWater + currentReading.co2.breakdown.sewage;
      
      return {
        currentPeriod: {
          electricity: currentReading.co2.breakdown.electricity,
          gas: currentReading.co2.breakdown.gas,
          heating: currentReading.co2.breakdown.heating,
          water: waterTotal,
          total: currentReading.co2.total
        },
        yearlyData: []
      };
    } else {
      // Yearly view - process all months
      const yearlyData = data.map(reading => {
        const waterTotal = reading.co2.breakdown.coldWater + reading.co2.breakdown.hotWater + reading.co2.breakdown.sewage;
        const date = new Date(reading.date);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          electricity: reading.co2.breakdown.electricity,
          gas: reading.co2.breakdown.gas,
          heating: reading.co2.breakdown.heating,
          water: waterTotal,
          total: reading.co2.total,
          date: date
        };
      }).sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate total for the year
      const yearTotal = yearlyData.reduce((acc, month) => ({
        electricity: acc.electricity + month.electricity,
        gas: acc.gas + month.gas,
        heating: acc.heating + month.heating,
        water: acc.water + month.water,
        total: acc.total + month.total
      }), { electricity: 0, gas: 0, heating: 0, water: 0, total: 0 });

      return {
        currentPeriod: yearTotal,
        yearlyData: yearlyData
      };
    }
  };

  const { currentPeriod, yearlyData } = prepareCO2Data();

  // Calculate percentages and trees needed
  const getPercentages = () => {
    if (!currentPeriod || currentPeriod.total === 0) return null;
    
    return {
      electricity: ((currentPeriod.electricity / currentPeriod.total) * 100).toFixed(1),
      gas: ((currentPeriod.gas / currentPeriod.total) * 100).toFixed(1),
      heating: ((currentPeriod.heating / currentPeriod.total) * 100).toFixed(1),
      water: ((currentPeriod.water / currentPeriod.total) * 100).toFixed(1),
    };
  };

  const getTreesNeeded = () => {
    if (!currentPeriod) return 0;
    return Math.ceil(currentPeriod.total / 20);
  };

  const percentages = getPercentages();
  const treesNeeded = getTreesNeeded();

  // Data for charts
  const pieData = currentPeriod ? [
    { name: 'Electricity', value: currentPeriod.electricity, color: COLORS[0] },
    { name: 'Gas', value: currentPeriod.gas, color: COLORS[1] },
    { name: 'Heating', value: currentPeriod.heating, color: COLORS[2] },
    { name: 'Water', value: currentPeriod.water, color: COLORS[3] }
  ].filter(item => item.value > 0) : [];

  const barData = currentPeriod ? [
    { name: 'Electricity', value: currentPeriod.electricity, color: COLORS[0] },
    { name: 'Gas', value: currentPeriod.gas, color: COLORS[1] },
    { name: 'Heating', value: currentPeriod.heating, color: COLORS[2] },
    { name: 'Water', value: currentPeriod.water, color: COLORS[3] }
  ].filter(item => item.value > 0) : [];

  // Render the selected chart
  const renderChart = () => {
    if (!currentPeriod) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No consumption data available</p>
              <p className="text-sm text-gray-400">Add your consumption readings to see CO₂ analysis</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (chartType === 'line' && periodType === 'year') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Monthly CO₂ Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Total CO₂']} />
                <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    if (chartType === 'bar') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>CO₂ Emissions by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'CO₂ Emissions']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    if (chartType === 'pie') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>CO₂ Emission Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'CO₂ Emissions']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            CO₂ Footprint Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your carbon emissions by service type
          </p>
        </div>

      {/* Period and Chart Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            CO₂ Analysis Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Time Period</label>
            <div className="flex gap-2">
              <Button
                variant={periodType === 'month' ? 'default' : 'outline'}
                onClick={() => {
                  setPeriodType('month');
                  setChartType('bar'); // Reset to available chart type
                }}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Current Month
              </Button>
              <Button
                variant={periodType === 'year' ? 'default' : 'outline'}
                onClick={() => {
                  setPeriodType('year');
                  setChartType('line'); // Default to line for yearly
                }}
                className="flex items-center gap-2"
              >
                <CalendarRange className="h-4 w-4" />
                Full Year
              </Button>
            </div>
          </div>

          {/* Chart Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Chart Type</label>
            <div className="flex gap-2">
              {periodType === 'year' && (
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  onClick={() => setChartType('line')}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Monthly Trend
                </Button>
              )}
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                onClick={() => setChartType('bar')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Bar Chart
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                onClick={() => setChartType('pie')}
                className="flex items-center gap-2"
              >
                <PieChartIcon className="h-4 w-4" />
                Pie Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {renderChart()}

      {/* Summary Information */}
      {currentPeriod && percentages && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total CO2 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Factory className="h-5 w-5" />
                Total CO₂ Emissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentPeriod.total.toFixed(1)} kg
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {periodType === 'month' ? 'Current month' : 'Full year'} emissions
              </p>
            </CardContent>
          </Card>

          {/* Service Percentages */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[0]}}></div>
                    Electricity
                  </span>
                  <span className="font-medium">{percentages.electricity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[1]}}></div>
                    Gas
                  </span>
                  <span className="font-medium">{percentages.gas}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[2]}}></div>
                    Heating
                  </span>
                  <span className="font-medium">{percentages.heating}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[3]}}></div>
                    Water
                  </span>
                  <span className="font-medium">{percentages.water}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trees Needed */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TreePine className="h-5 w-5" />
                Trees for Compensation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {treesNeeded}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Trees needed to offset your {periodType === 'month' ? 'monthly' : 'yearly'} CO₂ emissions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Footprint Assistant */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Footprint Assistant</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered insights about your environmental impact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  generateInsightsMutation.mutate();
                }}
                disabled={generateInsightsMutation.isPending}
                className="gap-2"
                type="button"
              >
                {generateInsightsMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generateInsightsMutation.isPending ? "Analyzing..." : "Get AI Insights"}
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Clear button clicked");
                  clearInsightsMutation.mutate();
                }}
                disabled={clearInsightsMutation.isPending}
                variant="outline"
                size="sm"
                className="gap-2"
                type="button"
              >
                {clearInsightsMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {clearInsightsMutation.isPending ? "Clearing..." : "Clear"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(insightsLoading || generateInsightsMutation.isPending) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {generateInsightsMutation.isPending ? "Generating AI insights..." : "Loading..."}
              </span>
            </div>
          )}
          
          {!insightsLoading && !generateInsightsMutation.isPending && footprintInsights && Array.isArray(footprintInsights) && footprintInsights.length > 0 ? (
            <div className="space-y-4">
              {footprintInsights.map((insight: any, index: number) => (
                <div
                  key={insight.id || index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === 'high'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : insight.priority === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {insight.priority === 'high' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : insight.priority === 'medium' ? (
                        <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.potentialSavings && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          💡 Potential impact: {insight.potentialSavings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !insightsLoading && !generateInsightsMutation.isPending && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">No AI insights available yet</p>
              <p className="text-sm">Click "Get AI Insights" to analyze your environmental impact</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AuthenticatedLayout>
  );
}