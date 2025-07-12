import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Zap, Flame, Leaf } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface ConsumptionCardProps {
  type: "water" | "electricity" | "gas" | "co2";
  value: number | string;
  unit: string;
  change?: number;
  period?: string;
}

export function ConsumptionCard({ type, value, unit, change, period = "This month" }: ConsumptionCardProps) {
  const { t } = useI18n();

  const getIcon = () => {
    switch (type) {
      case "water":
        return <Droplets className="text-cyan-600 dark:text-cyan-400 text-xl" />;
      case "electricity":
        return <Zap className="text-violet-600 dark:text-violet-400 text-xl" />;
      case "gas":
        return <Flame className="text-orange-600 dark:text-orange-400 text-xl" />;
      case "co2":
        return <Leaf className="text-emerald-600 dark:text-emerald-400 text-xl" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "water":
        return t('dashboard.waterUsage');
      case "electricity":
        return t('dashboard.electricity');
      case "gas":
        return t('dashboard.gasUsage');
      case "co2":
        return t('dashboard.co2Footprint');
      default:
        return "";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "water":
        return "bg-cyan-50 dark:bg-cyan-900/20";
      case "electricity":
        return "bg-violet-50 dark:bg-violet-900/20";
      case "gas":
        return "bg-orange-50 dark:bg-orange-900/20";
      case "co2":
        return "bg-emerald-50 dark:bg-emerald-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getValueColor = () => {
    switch (type) {
      case "water":
        return "text-cyan-700 dark:text-cyan-300";
      case "electricity":
        return "text-violet-700 dark:text-violet-300";
      case "gas":
        return "text-orange-700 dark:text-orange-300";
      case "co2":
        return "text-emerald-700 dark:text-emerald-300";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return "";
    if (type === "co2") {
      return change < 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    }
    return change < 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const getChangeIcon = () => {
    if (change === undefined) return "";
    return change < 0 ? "↓" : "↑";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getBackgroundColor()} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>
          {change !== undefined && (
            <span className={`text-xs sm:text-sm font-medium ${getChangeColor()}`}>
              {getChangeIcon()} {Math.abs(change)}%
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {getTitle()}
        </h3>
        <p className={`text-xl sm:text-2xl font-bold ${getValueColor()} break-all`}>
          {value} <span className="text-sm sm:text-base">{unit}</span>
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {t('dashboard.thisMonth')}
        </p>
      </CardContent>
    </Card>
  );
}
