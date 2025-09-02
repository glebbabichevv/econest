import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  ArrowRight,
  Trash2
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
  const queryClient = useQueryClient();
  const { t, language } = useI18n();
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
      month: new Date(reading.year, reading.month - 1).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'kk' ? 'kk-KZ' : 'en-US', { month: 'long' }),
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
    .sort((a, b) => {
      // Правильная сортировка по году и месяцу
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthA = monthNames.indexOf(a.month);
      const monthB = monthNames.indexOf(b.month);
      
      if (b.year !== a.year) {
        return b.year - a.year; // Сначала более поздние годы
      }
      return monthB - monthA; // Затем более поздние месяцы
    })
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

  const handleDeleteEntry = async (entry: HistoryEntry) => {
    if (!confirm(`Are you sure you want to delete the consumption data for ${entry.month} ${entry.year}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Find the actual consumption reading ID from the monthly data
      const historyResponse = await fetch('/api/consumption');
      const consumptionData = await historyResponse.json();
      
      // Find the reading that matches this month/year
      const targetReading = consumptionData.find((reading: any) => {
        const readingDate = new Date(reading.readingDate);
        const readingYear = readingDate.getFullYear();
        const readingMonth = readingDate.toLocaleString('default', { month: 'long' });
        return readingYear === entry.year && readingMonth === entry.month;
      });

      if (!targetReading) {
        alert('Could not find consumption reading to delete.');
        return;
      }

      const response = await fetch(`/api/consumption/${targetReading.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh history data
        queryClient.invalidateQueries({ queryKey: ["/api/consumption"] });
        // Show success message
        alert('Consumption data deleted successfully.');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete consumption data. Please try again.');
    }
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
              {language === 'ru' ? 'История потребления' : language === 'kk' ? 'Тұтыну тарихы' : 'Consumption History'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              {language === 'ru' ? 'Просматривайте и анализируйте исторические данные потребления по месяцам' : language === 'kk' ? 'Айлық тұтыну деректерін қарап талдаңыз' : 'View and analyze your historical consumption patterns by month'}
            </p>
          </div>
        </div>

        {/* Chart Controls for All Data */}
        {historyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ru' ? 'Обзор годового потребления' : language === 'kk' ? 'Жылдық тұтыну шолуы' : 'Annual Consumption Overview'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsumptionChart 
                data={historyData.map(entry => {
                  const monthNum = parseInt(entry.id.split('-')[1]);
                  return {
                    id: entry.id,
                    month: monthNum,
                    year: entry.year,
                    coldWater: Number(entry.consumption.coldWater) || 0,
                    hotWater: Number(entry.consumption.hotWater) || 0,
                    sewage: Number(entry.consumption.sewage) || 0,
                    heating: Number(entry.consumption.heating) || 0,
                    electricity: Number(entry.consumption.electricity) || 0,
                    gas: Number(entry.consumption.gas) || 0,
                    createdAt: new Date().toISOString(),
                    readingDate: new Date(entry.year, monthNum - 1).toISOString()
                  };
                })}
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
                {language === 'ru' ? 'История потребления не найдена' : language === 'kk' ? 'Тұтыну тарихы табылмады' : 'No consumption history found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                {language === 'ru' ? 'Добавьте первые показания потребления, чтобы увидеть историю здесь.' : language === 'kk' ? 'Тарихты мұнда көру үшін алғашқы тұтыну көрсеткіштерін қосыңыз.' : 'Start by adding your first consumption readings to see your history here.'}
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                {language === 'ru' ? 'Добавить первые показания' : language === 'kk' ? 'Алғашқы көрсеткішті қосу' : 'Add First Reading'}
              </Button>
            </Card>
          ) : (
            historyData.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Month Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.month} {entry.year}
                      </h3>
                      <p className="text-sm text-gray-500">
                        CO₂ Emissions: {entry.co2Footprint.toFixed(1)} kg
                      </p>
                    </div>
                  </div>

                  {/* Consumption Summary - Hidden on mobile, show only on desktop */}
                  <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.coldShort')}</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {entry.consumption.coldWater.toFixed(1)} m³
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.hotShort')}</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {entry.consumption.hotWater.toFixed(1)} m³
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.sewageShort')}</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {entry.consumption.sewage.toFixed(1)} m³
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.heatShort')}</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {entry.consumption.heating.toFixed(1)} Gcal
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.electricShort')}</div>
                      <div className="font-semibold text-gray-900 text-xs">
                        {entry.consumption.electricity.toFixed(1)} kWh
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">{t('consumption.gasShort')}</div>
                      <div className="font-semibold text-gray-900 text-sm">
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
{t('actions.viewDetails')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('quickActions.delete')}
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
                <span>{t('quickActions.detailedView')} - {selectedEntry.month} {selectedEntry.year}</span>
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
                  {t('quickActions.monthlyConsumptionBreakdown')}
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
                  <h4 className="font-medium text-gray-900 mb-3">
                    {t('quickActions.consumptionDetails')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">💧 {t('consumption.coldWater')}:</span>
                      <span className="font-medium">{selectedEntry.consumption.coldWater.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🌊 {t('consumption.hotWater')}:</span>
                      <span className="font-medium">{selectedEntry.consumption.hotWater.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🚰 {t('consumption.sewage')}:</span>
                      <span className="font-medium">{selectedEntry.consumption.sewage.toFixed(1)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🔥 {t('consumption.heating')}:</span>
                      <span className="font-medium">{selectedEntry.consumption.heating.toFixed(1)} Gcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">⚡ {t('consumption.electricity')}:</span>
                      <span className="font-medium">{selectedEntry.consumption.electricity.toFixed(1)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🔥 {t('consumption.gas')}:</span>
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