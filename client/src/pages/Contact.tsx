import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  Phone
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function Contact() {
  const { t, language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="contact-page min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto p-6 space-y-8">

      {/* Header */}
      <div className={`text-center mb-8 relative z-10 transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 group hover:scale-110 transition-transform duration-300">
          <Mail className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          {language === 'ru' ? 'Свяжитесь с нами' : language === 'kk' ? 'Бізбен байланысыңыз' : 'Contact Us'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
          {language === 'ru' ? 'Мы здесь, чтобы помочь вам! Свяжитесь с нами любым удобным способом.' : language === 'kk' ? 'Біз сізге көмектесуге дайынбыз! Бізге ыңғайлы тәсілмен хабарласыңыз.' : 'We are here to help you! Contact us in any convenient way.'}
        </p>
      </div>

      {/* Main Contact Information */}
      <Card className={`group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1 max-w-2xl mx-auto ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`} style={{ transitionDelay: '300ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="p-12 text-center space-y-8">
          {/* Email */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <a href="mailto:econest_future@gmail.com" className="text-4xl font-bold text-primary hover:text-primary/80 transition-colors break-all">
              econest_future@gmail.com
            </a>
          </div>
          
          {/* Phone */}
          <div>
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full">
                <Phone className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Office Phone:
            </p>
            <a href="tel:+77073287707" className="text-xl font-semibold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors">
              +7 707 328 77 07
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Get Involved Section */}
      <Card className={`relative z-10 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden max-w-4xl mx-auto ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`} style={{ transitionDelay: '600ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative">
          <CardTitle className="text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl">
            {language === 'ru' ? 'Как вы можете помочь?' : language === 'kk' ? 'Сіз қалай көмектесе аласыз?' : 'How Can You Help?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ru' ? 'Сообщить об ошибке' : language === 'kk' ? 'Қате туралы хабарлау' : 'Report a Bug'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {language === 'ru' ? 'Помогите нам улучшить платформу' : language === 'kk' ? 'Платформаны жақсартуға көмектесіңіз' : 'Help us improve the platform'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ru' ? 'Нашли проблему? Сообщите нам!' : language === 'kk' ? 'Мәселе таптыңыз ба? Бізге хабарлаңыз!' : 'Found an issue? Let us know!'}
              </p>
            </div>
            
            <div className="text-center p-6 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Phone className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ru' ? 'Предложить функцию' : language === 'kk' ? 'Функция ұсыну' : 'Suggest a Feature'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {language === 'ru' ? 'Поделитесь своими идеями' : language === 'kk' ? 'Идеяларыңызбен бөлісіңіз' : 'Share your ideas'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ru' ? 'Есть идея для улучшения? Напишите нам!' : language === 'kk' ? 'Жақсарту идеясы бар ма? Бізге жазыңыз!' : 'Have an idea for improvement? Write to us!'}
              </p>
            </div>

            <div className="text-center p-6 border rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Mail className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ru' ? 'Оставить отзыв' : language === 'kk' ? 'Пікір қалдыру' : 'Leave Feedback'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {language === 'ru' ? 'Поделитесь своим опытом' : language === 'kk' ? 'Тәжірибеңізбен бөлісіңіз' : 'Share your experience'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ru' ? 'Ваше мнение важно для нас!' : language === 'kk' ? 'Сіздің пікіріңіз біз үшін маңызды!' : 'Your opinion matters to us!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      </main>
    </div>
  );
}