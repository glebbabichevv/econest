import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Droplets, Zap, Flame, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

type Period = "month" | "year";
type ChartType = "bar" | "pie" | "line";
type ViewMode = "consumption" | "co2";

export default function Analytics() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>("month");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [viewMode, setViewMode] = useState<ViewMode>("consumption");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics", period, viewMode],
    queryFn: () => fetch(`/api/analytics?period=${period}&viewMode=${viewMode}`).then(res => res.json()),
    enabled: !!user,
  });

  const goBack = () => {
    setLocation('/dashboard');
  };

  if (isLoading || analyticsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const data = (analyticsData as any[]) || [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Consumption data rendering
  const renderConsumptionChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No consumption data available</p>
            <p className="text-sm text-gray-400">Add your monthly readings to see trends</p>
          </div>
        </div>
      );
    }

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="coldWater" fill={COLORS[0]} name="Cold Water (m³)" />
            <Bar dataKey="hotWater" fill={COLORS[1]} name="Hot Water (m³)" />
            <Bar dataKey="sewage" fill={COLORS[2]} name="Sewage (m³)" />
            <Bar dataKey="electricity" fill={COLORS[3]} name="Electricity (kWh)" />
            <Bar dataKey="gas" fill={COLORS[4]} name="Gas (m³)" />
            <Bar dataKey="heating" fill={COLORS[5]} name="Heating (Gcal)" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="coldWater" stroke={COLORS[0]} name="Cold Water (m³)" />
            <Line type="monotone" dataKey="hotWater" stroke={COLORS[1]} name="Hot Water (m³)" />
            <Line type="monotone" dataKey="sewage" stroke={COLORS[2]} name="Sewage (m³)" />
            <Line type="monotone" dataKey="electricity" stroke={COLORS[3]} name="Electricity (kWh)" />
            <Line type="monotone" dataKey="gas" stroke={COLORS[4]} name="Gas (m³)" />
            <Line type="monotone" dataKey="heating" stroke={COLORS[5]} name="Heating (Gcal)" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Pie chart for consumption
    const totalConsumption = data.reduce((acc: any, curr: any) => ({
      coldWater: acc.coldWater + (curr.coldWater || 0),
      hotWater: acc.hotWater + (curr.hotWater || 0), 
      sewage: acc.sewage + (curr.sewage || 0),
      heating: acc.heating + (curr.heating || 0),
      electricity: acc.electricity + (curr.electricity || 0),
      gas: acc.gas + (curr.gas || 0),
    }), { coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0 });

    const pieData = [
      { name: 'Cold Water', value: totalConsumption.coldWater, color: COLORS[0] },
      { name: 'Hot Water', value: totalConsumption.hotWater, color: COLORS[1] },
      { name: 'Sewage', value: totalConsumption.sewage, color: COLORS[2] },
      { name: 'Electricity', value: totalConsumption.electricity, color: COLORS[3] },
      { name: 'Gas', value: totalConsumption.gas, color: COLORS[4] },
      { name: 'Heating', value: totalConsumption.heating, color: COLORS[5] },
    ].filter(item => item.value > 0);

    return (
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
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // CO2 data rendering
  const renderCO2Chart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No CO₂ data available</p>
            <p className="text-sm text-gray-400">Add your monthly readings to see CO₂ levels</p>
          </div>
        </div>
      );
    }

    // Calculate CO2 emissions using Kazakhstan coefficients
    const co2Data = data.map((item: any) => {
      const electricityCO2 = (item.electricity || 0) * 0.9; // kWh → kg CO2
      const gasCO2 = (item.gas || 0) * 2.0; // m³ → kg CO2  
      const heatingCO2 = (item.heating || 0) * 230.0; // Gcal → kg CO2
      const waterCO2 = ((item.coldWater || 0) + (item.hotWater || 0) + (item.sewage || 0)) * 0.34; // m³ → kg CO2
      
      return {
        ...item,
        electricityCO2,
        gasCO2,
        heatingCO2,
        waterCO2,
        totalCO2: electricityCO2 + gasCO2 + heatingCO2 + waterCO2
      };
    });

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={co2Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} kg`, name]} />
            <Line type="monotone" dataKey="electricityCO2" stroke={COLORS[0]} name="Electricity CO₂" strokeWidth={2} />
            <Line type="monotone" dataKey="gasCO2" stroke={COLORS[1]} name="Gas CO₂" strokeWidth={2} />
            <Line type="monotone" dataKey="heatingCO2" stroke={COLORS[2]} name="Heating CO₂" strokeWidth={2} />
            <Line type="monotone" dataKey="waterCO2" stroke={COLORS[3]} name="Water CO₂" strokeWidth={2} />
            <Line type="monotone" dataKey="totalCO2" stroke="#FF4444" name="Total CO₂" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "pie") {
      // Calculate total CO2 for pie chart
      const totalCO2 = co2Data.reduce((acc: any, curr: any) => ({
        electricity: acc.electricity + (curr.electricityCO2 || 0),
        gas: acc.gas + (curr.gasCO2 || 0),
        heating: acc.heating + (curr.heatingCO2 || 0),
        water: acc.water + (curr.waterCO2 || 0),
      }), { electricity: 0, gas: 0, heating: 0, water: 0 });

      const co2PieData = [
        { name: 'Electricity', value: totalCO2.electricity, color: COLORS[0] },
        { name: 'Gas', value: totalCO2.gas, color: COLORS[1] },
        { name: 'Heating', value: totalCO2.heating, color: COLORS[2] },
        { name: 'Water Services', value: totalCO2.water, color: COLORS[3] },
      ].filter(item => item.value > 0);

      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={co2PieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, value }) => `${name} ${(percent * 100).toFixed(0)}% (${Number(value).toFixed(1)}kg)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {co2PieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg CO₂`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Default bar chart for CO2
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={co2Data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)} kg`, name]} />
          <Bar dataKey="electricityCO2" fill={COLORS[0]} name="Electricity CO₂" />
          <Bar dataKey="gasCO2" fill={COLORS[1]} name="Gas CO₂" />
          <Bar dataKey="heatingCO2" fill={COLORS[2]} name="Heating CO₂" />
          <Bar dataKey="waterCO2" fill={COLORS[3]} name="Water CO₂" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Get CO2 totals for summary cards
  const getCO2Summary = () => {
    if (data.length === 0) return { total: 0, breakdown: { electricity: 0, gas: 0, heating: 0, water: 0 } };
    
    const summary = data.reduce((acc: any, curr: any) => {
      const electricityCO2 = (curr.electricity || 0) * 0.9;
      const gasCO2 = (curr.gas || 0) * 2.0;
      const heatingCO2 = (curr.heating || 0) * 230.0;
      const waterCO2 = ((curr.coldWater || 0) + (curr.hotWater || 0) + (curr.sewage || 0)) * 0.34;
      
      return {
        electricity: acc.electricity + electricityCO2,
        gas: acc.gas + gasCO2,
        heating: acc.heating + heatingCO2,
        water: acc.water + waterCO2,
      };
    }, { electricity: 0, gas: 0, heating: 0, water: 0 });

    return {
      total: summary.electricity + summary.gas + summary.heating + summary.water,
      breakdown: summary
    };
  };

  const co2Summary = getCO2Summary();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={goBack} 
        className="mb-4 md:mb-6 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Dashboard</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-4 md:px-0">
          Track your consumption patterns and environmental impact with detailed charts and insights
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Consumption Rates
          </TabsTrigger>
          <TabsTrigger value="co2" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            CO₂ Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consumption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resource Consumption Analysis
              </CardTitle>
              <CardDescription>
                Track your water, electricity, gas, and heating consumption patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderConsumptionChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="co2" className="space-y-6">
          {/* CO2 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {co2Summary.total.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total CO₂ (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-blue-600">
                    {co2Summary.breakdown.electricity.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Electricity</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-orange-600">
                    {co2Summary.breakdown.gas.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Gas</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Home className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-600">
                    {co2Summary.breakdown.heating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Heating</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Droplets className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-cyan-600">
                    {co2Summary.breakdown.water.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Water</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CO2 Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                CO₂ Emissions Analysis
              </CardTitle>
              <CardDescription>
                Environmental impact of your consumption using Kazakhstan coefficients (kg CO₂)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCO2Chart()}
            </CardContent>
          </Card>

          {/* Environmental Impact Info */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {Math.ceil(co2Summary.total / 20)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Trees needed to offset CO₂
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {(co2Summary.total / 1000).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tonnes of CO₂
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    ₸{(co2Summary.total * 25).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Carbon tax equivalent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}