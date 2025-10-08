import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Waves } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme.tsx";
import { useI18n } from "@/hooks/useI18n";

export function ThemeSelector() {
  const { theme, changeTheme } = useTheme();
  const { t } = useI18n();

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: t('themes.light'),
      icon: <Sun className="h-4 w-4" />,
      description: t('themes.lightDescription')
    },
    {
      value: 'dark',
      label: t('themes.dark'),
      icon: <Moon className="h-4 w-4" />,
      description: t('themes.darkDescription')
    },
    {
      value: 'ocean',
      label: t('themes.ocean'),
      icon: <Waves className="h-4 w-4" />,
      description: t('themes.oceanDescription')
    }
  ];

  const currentThemeData = themes.find(t => t.value === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-500" />}
          {theme === 'ocean' && <Waves className="h-4 w-4 text-cyan-500" />}
          <span className="hidden sm:inline text-gray-700 dark:text-gray-200 font-medium">{currentThemeData.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => changeTheme(themeOption.value)}
            className={`flex items-center gap-3 p-3 cursor-pointer ${
              theme === themeOption.value ? "bg-primary/10 dark:bg-primary/20" : ""
            }`}
          >
            {themeOption.icon}
            <div className="flex-1">
              <div className="font-medium">{themeOption.label}</div>
              <div className="text-xs text-muted-foreground">{themeOption.description}</div>
            </div>
            {theme === themeOption.value && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}