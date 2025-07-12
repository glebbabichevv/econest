import { Button } from "@/components/ui/button";
import { Leaf, Palette, Menu, X } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "wouter";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "ocean", label: "Ocean" }
  ];

  const navigationLinks = [
    { href: "/about", label: t('navigation.about') },
    { href: "/how-it-works", label: t('navigation.howItWorks') },
    { href: "/faq", label: t('navigation.faq') },
    { href: "/contact", label: t('navigation.contact') }
  ];

  return (
    <nav className="relative z-50 border-b border-gray-200/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <Leaf className="text-white text-sm sm:text-lg" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              Econest
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navigationLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right side controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                  <Palette className="h-4 w-4" />
                  {themes.find(t => t.value === theme)?.label || "Theme"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {themes.map((themeOption) => (
                  <DropdownMenuItem 
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value as any)}
                    className={theme === themeOption.value ? "bg-primary/10" : ""}
                  >
                    {themeOption.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Button */}
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-opacity">
                {t('actions.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Palette className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {themes.map((themeOption) => (
                  <DropdownMenuItem 
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value as any)}
                    className={theme === themeOption.value ? "bg-primary/10" : ""}
                  >
                    {themeOption.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-3">
                    {navigationLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Button */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-opacity">
                        {t('actions.login')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}