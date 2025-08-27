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
    coldWater: number;
    hotWater: number;
    sewage: number;
    heating: number;
    electricity: number;
    gas: number;
  };
  co2Footprint: number;
  previousMonthChange: {
    coldWater: number;
    hotWater: number;
    sewage: number;
    heating: number;
    electricity: number;
    gas: number;
    co2: number;
  };
}

export default function History() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [chartCategory, setChartCategory] = useState<"water-gas" | "electricity" | "heating">("water-gas");
  const [detailChartCategory, setDetailChartCategory] = useState<"water-gas" | "electricity" | "heating">("water-gas");

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
        coldWater: parseFloat(reading.coldWater) || 0,
        hotWater: parseFloat(reading.hotWater) || 0,
        sewage: parseFloat(reading.sewage) || 0,
        heating: parseFloat(reading.heating) || 0,
        electricity: parseFloat(reading.electricity) || 0,
        gas: parseFloat(reading.gas) || 0
      },
      co2Footprint: (
        (parseFloat(reading.electricity) || 0) * 0.9 +  // kWh × 0.9 kg CO₂/kWh
        (parseFloat(reading.gas) || 0) * 2.0 +          // m³ × 2.0 kg CO₂/m³
        (parseFloat(reading.heating) || 0) * 230.0 +     // Gcal × 230.0 kg CO₂/Gcal
        (parseFloat(reading.coldWater) || 0) * 0.34 +   // m³ × 0.34 kg CO₂/m³
        (parseFloat(reading.hotWater) || 0) * 0.34 +    // m³ × 0.34 kg CO₂/m³
        (parseFloat(reading.sewage) || 0) * 0.7         // m³ × 0.7 kg CO₂/m³
      ),
      previousMonthChange: {
        coldWater: 0, hotWater: 0, sewage: 0, heating: 0, electricity: 0, gas: 0, co2: 0  // Will calculate if we have previous data
      }
    }))
    .sort((a, b) => new Date(b.year, b.month === 'January' ? 0 : b.month === 'February' ? 1 : 2).getTime() - new Date(a.year, a.month === 'January' ? 0 : a.month === 'February' ? 1 : 2).getTime())
    : [];

  // Calculate changes from previous month
  historyData.forEach((entry, index) => {
    if (index < historyData.length - 1) {
      const prevEntry = historyData[index + 1];
      entry.previousMonthChange = {
        coldWater: ((entry.consumption.coldWater - prevEntry.consumption.coldWater) / prevEntry.consumption.coldWater * 100) || 0,
        hotWater: ((entry.consumption.hotWater - prevEntry.consumption.hotWater) / prevEntry.consumption.hotWater * 100) || 0,
        sewage: ((entry.consumption.sewage - prevEntry.consumption.sewage) / prevEntry.consumption.sewage * 100) || 0,
        heating: ((entry.consumption.heating - prevEntry.consumption.heating) / prevEntry.consumption.heating * 100) || 0,
        electricity: ((entry.consumption.electricity - prevEntry.consumption.electricity) / prevEntry.consumption.electricity * 100) || 0,
        gas: ((entry.consumption.gas - prevEntry.consumption.gas) / prevEntry.consumption.gas * 100) || 0,
        co2: ((entry.co2Footprint - prevEntry.co2Footprint) / prevEntry.co2Footprint * 100) || 0
      };
    }
  });


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
        </div>

        {/* Chart Controls for All Data */}
        {historyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Annual Consumption Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsumptionChart 
                data={historyData.map(entry => ({
                  id: entry.id,
                  month: parseInt(entry.id.split('-')[1]),
                  year: entry.year,
                  coldWater: entry.consumption.coldWater,
                  hotWater: entry.consumption.hotWater,
                  sewage: entry.consumption.sewage,
                  heating: entry.consumption.heating,
                  electricity: entry.consumption.electricity,
                  gas: entry.consumption.gas,
                  createdAt: new Date().toISOString(),
                  readingDate: new Date(entry.year, parseInt(entry.id.split('-')[1]) - 1).toISOString()
                }))}
                period="year"
                category={chartCategory}
                onCategoryChange={setChartCategory}
                showPeriodControls={false}
              />
            </CardContent>
          </Card>
        )}

        {/* History List */}
        <div className="grid gap-4">
          {historyData.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No consumption history found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Start by adding your first consumption readings to see your history here.
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Add First Reading
              </Button>
            </Card>
          ) : (
            historyData.map((entry) => (
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
                        CO₂ Emissions: {entry.co2Footprint.toFixed(1)} kg
                      </p>
                    </div>
                  </div>

                  {/* Consumption Summary */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Cold Water</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.coldWater.toFixed(1)} m³
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hot Water</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.hotWater.toFixed(1)} m³
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Sewage</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.sewage.toFixed(1)} m³
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Heating</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.heating.toFixed(1)} Gcal
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Electricity</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.electricity.toFixed(1)} kWh
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Gas</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {entry.consumption.gas.toFixed(1)} m³
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
                    id: selectedEntry.id,
                    month: parseInt(selectedEntry.id.split('-')[1]),
                    year: selectedEntry.year,
                    coldWater: selectedEntry.consumption.coldWater,
                    hotWater: selectedEntry.consumption.hotWater,
                    sewage: selectedEntry.consumption.sewage,
                    heating: selectedEntry.consumption.heating,
                    electricity: selectedEntry.consumption.electricity,
                    gas: selectedEntry.consumption.gas,
                    createdAt: new Date().toISOString(),
                    readingDate: new Date(selectedEntry.year, parseInt(selectedEntry.id.split('-')[1]) - 1).toISOString()
                  }]}
                  period="month"
                  category={detailChartCategory}
                  onCategoryChange={setDetailChartCategory}
                  showPeriodControls={false}
                />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Consumption Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">💧 Cold Water:</span>
                      <span className="font-medium">{selectedEntry.consumption.coldWater.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🌊 Hot Water:</span>
                      <span className="font-medium">{selectedEntry.consumption.hotWater.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🚰 Sewage:</span>
                      <span className="font-medium">{selectedEntry.consumption.sewage.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🔥 Heating:</span>
                      <span className="font-medium">{selectedEntry.consumption.heating.toFixed(1)} Gcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">⚡ Electricity:</span>
                      <span className="font-medium">{selectedEntry.consumption.electricity.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🔥 Gas:</span>
                      <span className="font-medium">{selectedEntry.consumption.gas.toFixed(1)} m³</span>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}