import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/use-toast";
import { ConsumptionCard } from "@/components/ConsumptionCard";
import { ConsumptionChart } from "@/components/ConsumptionChart";
import { AIInsights } from "@/components/AIInsights";
import { Leaderboard } from "@/components/Leaderboard";
import { WeatherImpact } from "@/components/WeatherImpact";
import { QuickActions } from "@/components/QuickActions";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, ExternalLink, MapPin } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: regionalLeaderboard } = useQuery({
    queryKey: ["/api/leaderboard/regions-monthly", currentMonth, currentYear],
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  // Load AI recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("dashboard.unauthorized"),
        description: t("dashboard.loggedOut"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Handle API errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Use real user data or show empty state
  const consumption = (dashboardData as any)?.consumption || { water: 0, electricity: 0, gas: 0 };
  const changes = (dashboardData as any)?.changes || { water: 0, electricity: 0, gas: 0, co2: 0 };
  const chartData = (dashboardData as any)?.chartData || [];
  const co2Footprint = (dashboardData as any)?.co2Footprint || 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {t("dashboard.welcome")}, {user?.name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("dashboard.overview")}
            </p>
          </div>
          

        </div>



        {/* Consumption Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ConsumptionCard
            type="water"
            value={consumption.water}
            unit={t("units.cubicMeters")}
            change={changes.water}
            period={t("dashboard.thisMonth")}
          />
          <ConsumptionCard
            type="electricity"
            value={consumption.electricity}
            unit={t("units.kilowattHours")}
            change={changes.electricity}
            period={t("dashboard.thisMonth")}
          />
          <ConsumptionCard
            type="gas"
            value={consumption.gas}
            unit={t("units.cubicMeters")}
            change={changes.gas}
            period={t("dashboard.thisMonth")}
          />
          <ConsumptionCard
            type="co2"
            value={co2Footprint}
            unit={t("units.tonnes")}
            change={changes.co2 || 0}
            period={t("dashboard.thisMonth")}
          />
        </div>

        {/* Show message when no data available */}
        {chartData.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t("dashboard.noDataYet")}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t("dashboard.addFirstReading")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Consumption Chart */}
          <div className="lg:col-span-2">
            <ConsumptionChart 
              data={chartData}
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>

          {/* AI Insights */}
          <div>
            <AIInsights recommendations={recommendations} isLoading={recommendationsLoading} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weather Impact */}
          <WeatherImpact />

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Regional CO2 Statistics */}
        <Card className="max-w-4xl cursor-pointer hover:shadow-lg transition-shadow duration-300">
          <Link href="/leaderboard">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Regional CO₂ Statistics - {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to view full leaderboard
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {regionalLeaderboard && Array.isArray(regionalLeaderboard) && regionalLeaderboard.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Rank</th>
                        <th className="text-left p-2">Region</th>
                        <th className="text-right p-2">Total CO₂ (kg)</th>
                        <th className="text-right p-2">Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionalLeaderboard.slice(0, 5).map((region: any, index: number) => (
                        <tr key={region.region} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-2 font-bold">#{index + 1}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              {region.region}
                            </div>
                          </td>
                          <td className="p-2 text-right font-semibold">{region.totalCO2}</td>
                          <td className="p-2 text-right">{region.userCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {Array.isArray(regionalLeaderboard) && regionalLeaderboard.length > 5 && (
                    <div className="text-center mt-4 text-sm text-muted-foreground">
                      And {regionalLeaderboard.length - 5} more regions...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No regional data available for this month.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Regional statistics will appear when users add consumption data.
                  </p>
                </div>
              )}
            </CardContent>
          </Link>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
