import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Award,
  Users, 
  School,
  MapPin,
  TrendingUp,
  Share2,
  Star,
  Zap,
  ArrowLeft,
  Factory,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Leaderboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const goBack = () => {
    setLocation('/dashboard');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  const { data: usersData } = useQuery({
    queryKey: ["/api/leaderboard/users", selectedMonth, selectedYear],
    enabled: isAuthenticated,
  });

  const { data: regionsData } = useQuery({
    queryKey: ["/api/leaderboard/regions-monthly", selectedMonth, selectedYear],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Header - Mobile Optimized */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          CO₂ Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-4 md:px-0">
          Compare CO₂ emissions by users and regions for selected month
        </p>
      </div>

      {/* Month Selection */}
      <div className="flex justify-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users CO₂</TabsTrigger>
          <TabsTrigger value="regions">Regions CO₂</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users CO₂ Emissions - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-right p-2">CO₂ Emissions (kg)</th>
                      <th className="text-right p-2">Readings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersData || []).map((user: any, index: number) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-bold">#{index + 1}</td>
                        <td className="p-2">{user.name}</td>
                        <td className="p-2 text-right font-semibold">{user.totalCO2}</td>
                        <td className="p-2 text-right">{user.readingsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!usersData || usersData.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No user data available for this month.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Regions CO₂ Emissions - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Region</th>
                      <th className="text-right p-2">Total CO₂ (kg)</th>
                      <th className="text-right p-2">Average CO₂ (kg)</th>
                      <th className="text-right p-2">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(regionsData || []).map((region: any, index: number) => (
                      <tr key={region.region} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-bold">#{index + 1}</td>
                        <td className="p-2">{region.region}</td>
                        <td className="p-2 text-right font-semibold">{region.totalCO2}</td>
                        <td className="p-2 text-right">{region.averageCO2}</td>
                        <td className="p-2 text-right">{region.userCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!regionsData || regionsData.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No regional data available for this month.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}