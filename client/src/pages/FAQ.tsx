import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Calculator, Wifi, Database, Users, School } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function FAQ() {
  const { t, language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Define FAQ data directly in the component to avoid translation complexity
  const faqData = {
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to the most common questions about our platform",
      categories: [
        {
          id: "getting-started",
          title: "Getting Started",
          icon: <Calculator className="h-5 w-5" />,
          questions: [
            {
              question: "How do I start using Econest?",
              answer: "Registration is simple: create an account, enter basic information about your home (area, number of residents), add initial meter readings and start receiving AI recommendations. The system will adapt to your consumption patterns within the first month."
            },
            {
              question: "Is Econest free to use?",
              answer: "Yes, the basic version is completely free and includes consumption tracking, basic AI recommendations, and participation in regional leaderboards. Premium features include advanced analytics, detailed forecasts, and priority support."
            },
            {
              question: "Which countries and regions are supported?",
              answer: "Currently, we support Russia, Kazakhstan, and Belarus with plans to expand to other CIS countries. The system adapts to local tariffs, climatic conditions, and consumption standards."
            }
          ]
        },
        {
          id: "technical",
          title: "Technical Questions",
          icon: <Wifi className="h-5 w-5" />,
          questions: [
            {
              question: "Can I use the platform without internet?",
              answer: "Basic functions are available offline through our mobile app. Data synchronizes when internet connection is restored. However, AI recommendations and real-time analytics require an internet connection."
            },
            {
              question: "Which devices are supported?",
              answer: "Econest works on all modern devices: computers, tablets, smartphones (iOS and Android). We also offer smart meter integration and IoT device connectivity for automated data collection."
            },
            {
              question: "How accurate are AI recommendations?",
              answer: "Recommendation accuracy averages 85-92% and improves with usage time. Accuracy depends on data regularity, local conditions, and consumption pattern stability."
            }
          ]
        }
      ]
    },
    ru: {
      title: "Часто задаваемые вопросы",
      subtitle: "Найдите ответы на самые распространенные вопросы о нашей платформе",
      categories: [
        {
          id: "getting-started",
          title: "Начало работы",
          icon: <Calculator className="h-5 w-5" />,
          questions: [
            {
              question: "Как начать пользоваться Econest?",
              answer: "Регистрация проста: создайте аккаунт, введите основную информацию о вашем доме (площадь, количество жильцов), добавьте первоначальные показания счетчиков и начните получать рекомендации ИИ. Система адаптируется к вашим паттернам потребления в течение первого месяца."
            },
            {
              question: "Бесплатно ли использование Econest?",
              answer: "Да, базовая версия полностью бесплатна и включает отслеживание потребления, базовые рекомендации ИИ и участие в региональных рейтингах. Премиум-функции включают расширенную аналитику, детальные прогнозы и приоритетную поддержку."
            },
            {
              question: "Какие страны и регионы поддерживаются?",
              answer: "В настоящее время мы поддерживаем Россию, Казахстан и Беларусь с планами расширения на другие страны СНГ. Система адаптируется к местным тарифам, климатическим условиям и стандартам потребления."
            }
          ]
        },
        {
          id: "technical",
          title: "Технические вопросы",
          icon: <Wifi className="h-5 w-5" />,
          questions: [
            {
              question: "Можно ли использовать платформу без интернета?",
              answer: "Основные функции доступны офлайн через наше мобильное приложение. Данные синхронизируются при восстановлении интернет-соединения. Однако рекомендации ИИ и аналитика в реальном времени требуют подключения к интернету."
            },
            {
              question: "Какие устройства поддерживаются?",
              answer: "Econest работает на всех современных устройствах: компьютеры, планшеты, смартфоны (iOS и Android). Мы также предлагаем интеграцию с умными счетчиками и подключение IoT-устройств для автоматического сбора данных."
            },
            {
              question: "Насколько точны рекомендации ИИ?",
              answer: "Точность рекомендаций в среднем составляет 85-92% и улучшается со временем использования. Точность зависит от регулярности данных, местных условий и стабильности паттернов потребления."
            }
          ]
        }
      ]
    }
  };

  const currentData = faqData[language as keyof typeof faqData] || faqData.en;

  return (
    <div className="faq-page min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto p-6 space-y-8">

      {/* Header */}
      <div className={`text-center mb-8 relative z-10 transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6 group hover:scale-110 transition-transform duration-300">
          <HelpCircle className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
          {currentData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
          {currentData.subtitle}
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6 relative z-10">
        {currentData.categories.map((category, index) => (
          <Card key={category.id} className={`group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: `${300 + index * 150}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {category.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${category.id}-${index}`} 
                    className="border-2 border-gray-200 dark:border-gray-600 rounded-lg px-4 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 hover:shadow-md data-[state=open]:border-blue-400 data-[state=open]:shadow-lg data-[state=open]:bg-blue-50/50 dark:data-[state=open]:bg-blue-900/20"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 group/trigger data-[state=open]:bg-blue-50/50 dark:data-[state=open]:bg-blue-900/20 rounded-lg transition-all duration-200">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover/trigger:text-blue-600 dark:group-hover/trigger:text-blue-400 data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400 transition-colors duration-200 flex-1 text-left">
                        {item.question}
                      </span>
                      <div className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover/trigger:bg-blue-200 dark:group-hover/trigger:bg-blue-800/50 data-[state=open]:bg-blue-500 dark:data-[state=open]:bg-blue-600 transition-all duration-200">
                        <span className="text-blue-600 dark:text-blue-400 data-[state=open]:text-white text-lg font-bold data-[state=open]:rotate-45 transform transition-transform duration-200">+</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="text-gray-600 dark:text-gray-300 leading-relaxed pt-4 px-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 mt-2">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <Card className={`relative z-10 group bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`} style={{ transitionDelay: '800ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="relative">
          <CardTitle className="text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent text-2xl">
            {language === 'ru' ? 'Остались вопросы?' : 'Still have questions?'}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {language === 'ru' 
              ? 'Не можете найти ответ на свой вопрос? Обратитесь к нашей дружной команде.'
              : "Can't find the answer you're looking for? Please chat to our friendly team."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="flex gap-4">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {language === 'ru' ? 'Связаться с поддержкой' : 'Contact Support'}
            </a>
            <a 
              href="mailto:support@econest.ru" 
              className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              {language === 'ru' ? 'Написать нам' : 'Email Us'}
            </a>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}