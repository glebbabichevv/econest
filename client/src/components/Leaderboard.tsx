import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

interface LeaderboardEntry {
  id: string;
  name: string;
  participants: number;
  reduction: number;
  rank: number;
}

interface LeaderboardProps {
  title: string;
  entries?: LeaderboardEntry[];
  type: "regional" | "school";
}

export function Leaderboard({ title, entries = [], type }: LeaderboardProps) {
  const { t } = useI18n();

  // Default data if none provided
  const defaultEntries: LeaderboardEntry[] = [
    {
      id: "1",
      name: type === "regional" ? "Almaty Region" : "Nazarbayev School",
      participants: type === "regional" ? 2543 : 342,
      reduction: type === "regional" ? 23 : 28,
      rank: 1,
    },
    {
      id: "2",
      name: type === "regional" ? "Astana" : "International School",
      participants: type === "regional" ? 1876 : 289,
      reduction: type === "regional" ? 19 : 22,
      rank: 2,
    },
    {
      id: "3",
      name: type === "regional" ? "Shymkent" : "Green Valley School",
      participants: type === "regional" ? 1234 : 156,
      reduction: type === "regional" ? 16 : 18,
      rank: 3,
    },
  ];

  const displayEntries = entries.length > 0 ? entries : defaultEntries;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-orange-400";
      default:
        return "bg-gray-300";
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10 border border-yellow-200 dark:border-yellow-800";
      case 2:
        return "bg-gray-50 dark:bg-gray-700";
      case 3:
        return "bg-gray-50 dark:bg-gray-700";
      default:
        return "bg-gray-50 dark:bg-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.thisMonth')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg ${getRankBackground(entry.rank)}`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 ${getRankColor(entry.rank)} rounded-full flex items-center justify-center mr-3`}>
                  <span className="text-white font-bold text-sm">{entry.rank}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.participants} {type === "regional" ? t('dashboard.participants') : t('dashboard.students')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">-{entry.reduction}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type === "regional" ? t('dashboard.co2Reduction') : t('dashboard.energySaved')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
