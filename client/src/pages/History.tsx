import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsumptionChart } from "@/components/ConsumptionChart";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download,
  Eye,
  ArrowRight
} from "lucide-react";

interface HistoryEntry {
  id: string;
  month: string;
  year: number;
  consumption: {
    water: number;
    electricity: number;
    gas: number;
  };
  co2Footprint: number;
  totalCost: number;
  previousMonthChange: {
    water: number;
    electricity: number;
    gas: number;
    co2: number;
  };
}

export default function History() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const { data: consumptionData, isLoading } = useQuery({
    queryKey: ["/api/consumption"],
    enabled: !!user,
  });

  // Transform real consumption data into history format
  const historyData: HistoryEntry[] = consumptionData ? 
    (consumptionData as any[]).map((reading: any, index: number) => ({
      id: `${reading.year}-${reading.month.toString().padStart(2, '0')}`,
      month: new Date(reading.year, reading.month - 1).toLocaleString('en-US', { month: 'long' }),
      year: reading.year,
      consumption: {
        water: parseFloat(reading.water) || 0,
        electricity: parseFloat(reading.electricity) || 0,
        gas: parseFloat(reading.gas) || 0
      },
      co2Footprint: ((parseFloat(reading.electricity) || 0) * 0.5 + (parseFloat(reading.gas) || 0) * 2.0 + (parseFloat(reading.water) || 0) * 0.1),
      totalCost: ((parseFloat(reading.electricity) || 0) * 0.12 + (parseFloat(reading.gas) || 0) * 0.05 + (parseFloat(reading.water) || 0) * 2.5),
      previousMonthChange: {
        water: 0, electricity: 0, gas: 0, co2: 0  // Will calculate if we have previous data
      }
    }))
    .sort((a, b) => new Date(b.year, b.month === 'January' ? 0 : b.month === 'February' ? 1 : 2).getTime() - new Date(a.year, a.month === 'January' ? 0 : a.month === 'February' ? 1 : 2).getTime())
    : [];

  // Calculate changes from previous month
  historyData.forEach((entry, index) => {
    if (index < historyData.length - 1) {
      const prevEntry = historyData[index + 1];
      entry.previousMonthChange = {
        water: ((entry.consumption.water - prevEntry.consumption.water) / prevEntry.consumption.water * 100) || 0,
        electricity: ((entry.consumption.electricity - prevEntry.consumption.electricity) / prevEntry.consumption.electricity * 100) || 0,
        gas: ((entry.consumption.gas - prevEntry.consumption.gas) / prevEntry.consumption.gas * 100) || 0,
        co2: ((entry.co2Footprint - prevEntry.co2Footprint) / prevEntry.co2Footprint * 100) || 0
      };
    }
  });

  // Fallback empty data for demonstration if no real data
  const mockHistoryData: HistoryEntry[] = historyData.length > 0 ? historyData : [
    {
      id: "2024-05",
      month: "May",
      year: 2024,
      consumption: {
        water: 45.2,
        electricity: 287.5,
        gas: 123.8
      },
      co2Footprint: 2.85,
      totalCost: 156.50,
      previousMonthChange: {
        water: -12.5,
        electricity: 8.3,
        gas: -5.2,
        co2: -15.7
      }
    },
    {
      id: "2024-04",
      month: "April",
      year: 2024,
      consumption: {
        water: 51.7,
        electricity: 265.2,
        gas: 130.6
      },
      co2Footprint: 3.38,
      totalCost: 178.20,
      previousMonthChange: {
        water: 15.2,
        electricity: -4.1,
        gas: 12.8,
        co2: 8.5
      }
    },
    {
      id: "2024-03",
      month: "March",
      year: 2024,
      consumption: {
        water: 44.9,
        electricity: 276.5,
        gas: 115.8
      },
      co2Footprint: 3.11,
      totalCost: 164.30,
      previousMonthChange: {
        water: -8.3,
        electricity: 12.7,
        gas: -18.5,
        co2: -6.2
      }
    },
    {
      id: "2024-02",
      month: "February",
      year: 2024,
      consumption: {
        water: 49.0,
        electricity: 245.2,
        gas: 142.1
      },
      co2Footprint: 3.32,
      totalCost: 189.80,
      previousMonthChange: {
        water: 2.1,
        electricity: -15.3,
        gas: 8.9,
        co2: -3.1
      }
    },
    {
      id: "2024-01",
      month: "January",
      year: 2024,
      consumption: {
        water: 48.0,
        electricity: 289.7,
        gas: 130.4
      },
      co2Footprint: 3.43,
      totalCost: 201.60,
      previousMonthChange: {
        water: -5.8,
        electricity: 18.2,
        gas: -12.3,
        co2: 4.7
      }
    }
  ];

  const getChangeIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    );
  };

  const getChangeBadge = (change: number) => {
    return (
      <Badge variant={change > 0 ? "destructive" : "default"} className="text-xs">
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  const handleViewDetails = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCompareWithPrevious = (entry: HistoryEntry) => {
    // In real implementation, this would navigate to comparison view
    console.log("Compare with previous month:", entry);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Consumption History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              View and analyze your historical consumption patterns by month
            </p>
          </div>
          <Button variant="outline" className="gap-2 text-sm" size="sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        {/* History List */}
        <div className="grid gap-4">
          {mockHistoryData.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No consumption history found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Start by adding your first consumption readings to see your history here.
              </p>
              <Button>
                Add First Reading
              </Button>
            </Card>
          ) : (
            mockHistoryData.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Month Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.month} {entry.year}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Cost: ${entry.totalCost.toFixed(2)} • CO₂: {entry.co2Footprint} tonnes
                      </p>
                    </div>
                  </div>

                  {/* Consumption Summary */}
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Water</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {entry.consumption.water} m³
                      </div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        {getChangeIcon(entry.previousMonthChange.water)}
                        {getChangeBadge(entry.previousMonthChange.water)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Electricity</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {entry.consumption.electricity} kWh
                      </div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        {getChangeIcon(entry.previousMonthChange.electricity)}
                        {getChangeBadge(entry.previousMonthChange.electricity)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Gas</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {entry.consumption.gas} m³
                      </div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        {getChangeIcon(entry.previousMonthChange.gas)}
                        {getChangeBadge(entry.previousMonthChange.gas)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(entry)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompareWithPrevious(entry)}
                      className="gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Compare
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>

        {/* Detailed View Modal/Panel */}
        {selectedEntry && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detailed View - {selectedEntry.month} {selectedEntry.year}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Chart */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Monthly Consumption Breakdown
                </h4>
                <ConsumptionChart 
                  data={[{
                    month: selectedEntry.month,
                    water: selectedEntry.consumption.water,
                    electricity: selectedEntry.consumption.electricity,
                    gas: selectedEntry.consumption.gas
                  }]}
                  period="month"
                />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Consumption Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">💧 Water Usage:</span>
                      <span className="font-medium">{selectedEntry.consumption.water} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">⚡ Electricity:</span>
                      <span className="font-medium">{selectedEntry.consumption.electricity} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🔥 Gas Usage:</span>
                      <span className="font-medium">{selectedEntry.consumption.gas} m³</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Environmental Impact
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🌍 CO₂ Footprint:</span>
                      <span className="font-medium">{selectedEntry.co2Footprint} tonnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">💰 Total Cost:</span>
                      <span className="font-medium">${selectedEntry.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">📊 Efficiency:</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compare Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => handleCompareWithPrevious(selectedEntry)}
                  className="gap-2"
                >
                  Compare with Previous Month
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}