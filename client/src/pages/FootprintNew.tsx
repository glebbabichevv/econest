import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Leaf, TreePine, Factory, BarChart3, RefreshCw, Sparkles, Droplets } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function Footprint() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("yearly-co2");
  const [chartsInitialized, setChartsInitialized] = useState(false);
  
  // Chart refs
  const yearlyChartRef = useRef<HTMLCanvasElement>(null);
  const monthlyChartRef = useRef<HTMLCanvasElement>(null);
  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  const yearlyChartInstance = useRef<Chart | null>(null);
  const monthlyChartInstance = useRef<Chart | null>(null);
  const weeklyChartInstance = useRef<Chart | null>(null);

  // Fetch consumption data
  const { data: consumptionData = [] } = useQuery<any[]>({
    queryKey: ["/api/consumption"],
    enabled: isAuthenticated,
  });

  // Fetch CO2 insights
  const { data: co2Insights = [], isLoading: insightsLoading } = useQuery<any[]>({
    queryKey: ["/api/co2-insights"],
    enabled: isAuthenticated,
  });

  // Generate insights mutation
  const generateInsights = useMutation({
    mutationFn: () => apiRequest("POST", "/api/co2-insights/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/co2-insights"] });
    },
  });

  // Calculate CO2 data from real user consumption
  const calculateCO2Data = () => {
    if (!consumptionData.length) {
      return {
        yearly: [],
        monthly: [],
        weekly: []
      };
    }

    // Group data by month and calculate CO2
    const monthlyData = consumptionData.reduce((acc: any, reading: any) => {
      const month = new Date(reading.readingDate).getMonth();
      const year = new Date(reading.readingDate).getFullYear();
      const key = `${year}-${month}`;
      
      if (!acc[key]) {
        acc[key] = {
          month,
          year,
          electricity: 0,
          gas: 0,
          water: 0
        };
      }
      
      acc[key].electricity += parseFloat(reading.electricity || 0);
      acc[key].gas += parseFloat(reading.gas || 0);
      acc[key].water += parseFloat(reading.water || 0);
      
      return acc;
    }, {});

    // Calculate CO2 for each month (excluding water)
    const monthsWithCO2 = Object.values(monthlyData).map((data: any) => {
      const co2 = (data.electricity * 0.5) + (data.gas * 2.0); // CO2 factors
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return {
        label: monthNames[data.month],
        co2: Math.round(co2 * 10) / 10,
        month: data.month,
        year: data.year
      };
    }).sort((a, b) => a.year - b.year || a.month - b.month);

    // Last 2 months for monthly comparison
    const last2Months = monthsWithCO2.slice(-2);
    
    // Last 2 weeks (using current month data divided by weeks)
    const currentMonthData = monthsWithCO2[monthsWithCO2.length - 1];
    const weeklyData = currentMonthData ? [
      { label: 'Last Week', co2: Math.round((currentMonthData.co2 / 4) * 10) / 10 },
      { label: 'This Week', co2: Math.round((currentMonthData.co2 / 4) * 10) / 10 }
    ] : [];

    return {
      yearly: monthsWithCO2, // All available months
      monthly: last2Months,
      weekly: weeklyData
    };
  };

  const chartData = calculateCO2Data();

  // Calculate real totals from user data
  const calculateTotals = () => {
    if (!consumptionData.length) {
      return {
        total: 0,
        electricity: 0,
        gas: 0,
        water: 0,
        treesNeeded: 0
      };
    }

    const totalElectricity = consumptionData.reduce((sum, reading) => sum + parseFloat(reading.electricity || 0), 0);
    const totalGas = consumptionData.reduce((sum, reading) => sum + parseFloat(reading.gas || 0), 0);
    const totalWater = consumptionData.reduce((sum, reading) => sum + parseFloat(reading.water || 0), 0);
    
    // Calculate CO2 emissions (excluding water)
    const electricityCO2 = totalElectricity * 0.5; // kg CO2 per kWh
    const gasCO2 = totalGas * 2.0; // kg CO2 per m³
    const totalCO2 = electricityCO2 + gasCO2;
    
    // Trees needed to offset CO2 (1 tree absorbs ~21.77 kg CO2 per year)
    const treesNeeded = Math.round(totalCO2 / 21.77);

    return {
      total: Math.round(totalCO2 * 10) / 10,
      electricity: Math.round(electricityCO2 * 10) / 10,
      gas: Math.round(gasCO2 * 10) / 10,
      water: Math.round(totalWater * 10) / 10,
      treesNeeded: treesNeeded
    };
  };

  const totals = calculateTotals();

  // Function to create charts based on active tab
  const createChart = (type: 'yearly' | 'monthly' | 'weekly') => {
    const canvasRef = type === 'yearly' ? yearlyChartRef : type === 'monthly' ? monthlyChartRef : weeklyChartRef;
    const chartInstance = type === 'yearly' ? yearlyChartInstance : type === 'monthly' ? monthlyChartInstance : weeklyChartInstance;
    const data = chartData[type];

    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Detect current theme
    const isSpookyTheme = document.documentElement.classList.contains('spooky');
    const isDarkTheme = document.documentElement.classList.contains('dark');
    
    // Set text colors based on theme
    const textColor = isSpookyTheme ? '#f97316' : isDarkTheme ? '#ffffff' : '#000000'; // Orange for spooky, white for dark, black for light
    const gridColor = isSpookyTheme ? '#f97316' : isDarkTheme ? '#374151' : '#e5e7eb';

    // Chart configuration
    const isLineChart = type === 'yearly';
    const config = {
      type: isLineChart ? 'line' : 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'CO2 Emissions (kg)',
          data: data.map(d => d.co2),
          borderColor: isLineChart ? 'rgb(239, 68, 68)' : type === 'monthly' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
          backgroundColor: isLineChart ? 'rgba(239, 68, 68, 0.1)' : type === 'monthly' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          ...(isLineChart && { tension: 0.4, fill: true }),
          ...((!isLineChart) && { borderWidth: 1 })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: isLineChart,
            position: 'top' as const,
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO2 Emissions (kg)',
              color: textColor
            },
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          }
        }
      }
    } as any;

    chartInstance.current = new Chart(canvasRef.current, config);
  };

  // Create chart when active tab changes
  useEffect(() => {
    if (chartsInitialized) {
      const timer = setTimeout(() => {
        if (activeTab === 'yearly-co2' && yearlyChartRef.current) {
          createChart('yearly');
        } else if (activeTab === 'monthly-co2' && monthlyChartRef.current) {
          createChart('monthly');
        } else if (activeTab === 'weekly-co2' && weeklyChartRef.current) {
          createChart('weekly');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, chartsInitialized]);

  // Initial chart creation - принудительная инициализация для yearly CO2
  useEffect(() => {
    if (!chartsInitialized && consumptionData.length >= 0) {
      const timer = setTimeout(() => {
        createChart('yearly');
        setChartsInitialized(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [consumptionData, chartsInitialized]);

  // Update charts when theme changes
  useEffect(() => {
    if (chartsInitialized) {
      const observer = new MutationObserver(() => {
        setTimeout(() => {
          createChart(activeTab === 'yearly-co2' ? 'yearly' : activeTab === 'monthly-co2' ? 'monthly' : 'weekly');
        }, 100);
      });
      
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      
      return () => observer.disconnect();
    }
  }, [activeTab, chartsInitialized]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Environmental Footprint
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your CO2 emissions and environmental impact
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total CO2</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.total} kg</p>
                </div>
                <Factory className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Electricity CO2</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.electricity} kg</p>
                </div>
                <div className="w-8 h-8 text-blue-500">⚡</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Gas CO2</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.gas} kg</p>
                </div>
                <div className="w-8 h-8 text-orange-500">🔥</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Water Consumption</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.water} m³</p>
                </div>
                <Droplets className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Trees Needed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.treesNeeded}</p>
                </div>
                <TreePine className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
              <TabsTrigger value="yearly-co2">Yearly CO2</TabsTrigger>
              <TabsTrigger value="monthly-co2">Monthly CO2</TabsTrigger>
              <TabsTrigger value="weekly-co2">Weekly CO2</TabsTrigger>
            </TabsList>
            
            <TabsContent value="yearly-co2" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    CO2 Emissions Trend (Full Year)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <canvas ref={yearlyChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly-co2" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5" />
                    Monthly CO2 Emissions Comparison (Last 2 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <canvas ref={monthlyChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="weekly-co2" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5" />
                    Weekly CO2 Emissions Comparison (Last 2 Weeks)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <canvas ref={weeklyChartRef}></canvas>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Environmental AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Welcome Message */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 bg-green-100 dark:bg-green-900/20">
                    <AvatarFallback className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                      <Leaf className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                        Eco AI
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className="mb-2">
                        Hello! I analyze your CO2 emissions and environmental impact based on your consumption patterns.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click "Generate Analysis" to get insights about your environmental footprint and suggestions for improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Analysis Button */}
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
              className="w-full gap-2"
              size="sm"
            >
              {generateInsights.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Environmental Analysis
            </Button>

            {/* AI Insights */}
            {insightsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : co2Insights.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {co2Insights.map((insight: any) => (
                  <Card key={insight.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Leaf className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-blue-600 dark:text-blue-400 text-sm">
                              Environmental AI
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-medium mb-1">{insight.title}</p>
                            <p>{insight.description}</p>
                            {insight.potentialSavings && (
                              <p className="text-green-600 dark:text-green-400 mt-2 text-xs">
                                Potential CO2 reduction: {insight.potentialSavings}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No environmental insights yet.</p>
                <p className="text-xs">Generate analysis to see personalized recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}