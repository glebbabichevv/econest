import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingUp, Users, Zap, Award, Globe, Brain, Activity, Shield, Clock } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";

export default function Landing() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('landing.aiInsightsTitle'),
      description: t('landing.aiInsightsDesc'),
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: t('landing.realTimeTitle'), 
      description: t('landing.realTimeDesc'),
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('landing.communityTitle'),
      description: t('landing.communityDesc'),
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('landing.predictionsTitle'),
      description: t('landing.predictionsDesc'),
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t('landing.weatherTitle'),
      description: t('landing.weatherDesc'),
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('landing.multilingualTitle'),
      description: t('landing.multilingualDesc'),
      color: "from-indigo-500 to-purple-600"
    }
  ];

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <Navigation />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Logo with floating animation */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-green-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 animate-float">
                <Leaf className="text-white text-3xl" />
              </div>
            </div>
          </div>
          
          {/* Animated Title */}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-6 hover:scale-105 transition-transform duration-300">
            Econest
          </h1>
          
          {/* Subtitle with typewriter effect */}
          <div className={`transition-all duration-1000 delay-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              {t('landing.title')}
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>
          
          {/* CTA Button with glow effect */}
          <div className={`transition-all duration-1000 delay-500 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-primary to-green-600 hover:from-primary-dark hover:to-green-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              onClick={() => window.location.href = '/auth'}
            >
              <span className="relative z-10">{t('landing.ctaButton')} 🌱</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center mb-16 transition-all duration-1000 delay-200 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 hover:text-primary transition-colors duration-300">
            {t('landing.whyChoose')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('landing.whyChooseSubtitle')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 transform ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <Card className="group h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 from-blue-500 to-purple-600">
                </div>
                
                <CardContent className="relative p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center transition-all duration-1000 delay-800 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-primary/10 to-green-500/10 dark:from-primary/20 dark:to-green-500/20 backdrop-blur-sm rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('landing.ctaSubtitle')}
            </p>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-green-600 hover:from-primary-dark hover:to-green-700 text-white px-10 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              onClick={() => window.location.href = '/auth'}
            >
              {t('landing.ctaButton')}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className={`transition-all duration-1000 delay-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mr-3">
                  <Leaf className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold text-primary-dark dark:text-primary">Econest</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('landing.footerDesc')}
              </p>
            </div>
            
            {/* Features */}
            <div className={`transition-all duration-1000 delay-1100 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('landing.features')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="hover:text-primary transition-colors duration-200 cursor-pointer">AI Analytics</li>
                <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Resource Tracking</li>
                <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Leaderboards</li>
                <li className="hover:text-primary transition-colors duration-200 cursor-pointer">Weather Integration</li>
              </ul>
            </div>
            
            {/* Support */}
            <div className={`transition-all duration-1000 delay-1200 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('landing.support')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/faq" className="hover:text-primary transition-colors duration-200">Help Center</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors duration-200">Contact Us</a></li>
                <li><a href="/how-it-works" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="/about" className="hover:text-primary transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>

            {/* Social */}
            <div className={`transition-all duration-1000 delay-1300 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Social</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-200">
                  <Globe className="text-white h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-200">
                  <Award className="text-white h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-200">
                  <Zap className="text-white h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className={`border-t border-gray-700 mt-8 pt-8 text-center transition-all duration-1000 delay-1400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className="text-gray-400 text-sm">
              © 2025 Econest. All rights reserved. Made with 💚 for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}