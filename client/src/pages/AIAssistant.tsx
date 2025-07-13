import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Lightbulb, RefreshCw, Sparkles, Trash2, TrendingDown, TrendingUp } from "lucide-react";

export default function AIAssistant() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  // Fetch existing recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
    enabled: isAuthenticated,
  });

  // Generate new AI recommendations mutation
  const generateRecommendations = useMutation({
    mutationFn: () => apiRequest("POST", "/api/recommendations/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  // Clear all recommendations mutation
  const clearRecommendations = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/recommendations/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electricity': return '⚡';
      case 'water': return '💧';
      case 'gas': return '🔥';
      case 'general': return '🌱';
      default: return '💡';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {t("ai.assistant")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {t("ai.description")}
          </p>
        </div>

        {/* Welcome Message & Controls */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex gap-3 sm:gap-4 flex-1">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Econest AI
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(new Date())}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <p className="mb-3 text-sm sm:text-base">
                      Hello, {user?.name || user?.firstName || user?.email?.split('@')[0] || 'User'}!
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      I analyze your consumption patterns and current weather to provide personalized recommendations for reducing your environmental impact.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                <Button
                  onClick={() => generateRecommendations.mutate()}
                  disabled={generateRecommendations.isPending}
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  {generateRecommendations.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Generate New Insights</span>
                  <span className="sm:hidden">Generate</span>
                </Button>
                <Button
                  onClick={() => clearRecommendations.mutate()}
                  disabled={clearRecommendations.isPending}
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  {clearRecommendations.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Clear Recommendations</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {recommendationsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec: any, index: number) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCategoryIcon(rec.category)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {rec.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {rec.potentialSavings && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Potential savings</div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          ${rec.potentialSavings}/month
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Lightbulb className="w-4 h-4" />
                      AI-generated recommendation
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(new Date(rec.createdAt))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No AI insights yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                Add your consumption data on the Dashboard, then click "Generate New Insights" to get personalized AI recommendations.
              </p>
              <Button
                onClick={() => generateRecommendations.mutate()}
                disabled={generateRecommendations.isPending}
                className="gap-2"
              >
                {generateRecommendations.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Get AI Insights
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}