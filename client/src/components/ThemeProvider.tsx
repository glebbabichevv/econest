import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: "light" | "dark" | "ocean" | "spooky";
  setTheme: (theme: "light" | "dark" | "ocean" | "spooky") => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "ocean" | "spooky">("light");

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("econest-theme") as "light" | "dark" | "ocean" | "spooky" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove("dark", "ocean", "spooky");
    
    // Add the current theme class
    if (theme !== "light") {
      root.classList.add(theme);
    }
    
    localStorage.setItem("econest-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: ("light" | "dark" | "ocean" | "spooky")[] = ["light", "dark", "ocean", "spooky"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
