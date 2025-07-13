import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Lightbulb } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Link } from "wouter";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
}

interface AIInsightsProps {
  recommendations?: Recommendation[];
  isLoading?: boolean;
}

export function AIInsights({ recommendations = [], isLoading = false }: AIInsightsProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary-light to-white dark:from-gray-800 dark:to-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Bot className="text-white" />
            </div>
            {t('dashboard.aiInsights')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayRecommendations = recommendations.length > 0 ? recommendations : [];

  return (
    <Card className="bg-gradient-to-br from-primary-light to-white dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <Link href="/ai-assistant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Bot className="text-white" />
              </div>
              {t('dashboard.aiInsights')}
            </div>
            {displayRecommendations.length > 0 && (
              <span className="text-xs text-primary hover:text-primary-dark transition-colors">
                View all →
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayRecommendations.length > 0 ? (
            <div className="space-y-3">
              {displayRecommendations.slice(0, 3).map((recommendation) => (
                <div key={recommendation.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {recommendation.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                No AI insights available yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Add some consumption data to get personalized recommendations
              </p>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
