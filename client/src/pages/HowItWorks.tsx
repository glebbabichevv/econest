import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Database, TrendingUp, Zap, Globe } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function HowItWorks() {
  const { language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isRussian = language === 'ru';

  const content = {
    title: isRussian ? "Как работает Econest" : "How Econest Works",
    subtitle: isRussian 
      ? "Узнайте о технологиях и принципах, которые делают нашу платформу эффективным инструментом для анализа и оптимизации потребления ресурсов"
      : "Discover the technology behind our AI-powered sustainability platform",
    
    features: [
      {
        icon: <Brain className="h-8 w-8 text-blue-600" />,
        title: isRussian ? "Искусственный интеллект" : "Artificial Intelligence",
        description: isRussian 
          ? "Наша AI-модель анализирует ваши данные потребления и создает персональные прогнозы на основе машинного обучения."
          : "Our AI model analyzes your consumption data and creates personalized forecasts using machine learning.",
        details: isRussian ? [
          "Анализ исторических данных потребления",
          "Учет сезонных факторов и погодных условий",
          "Персонализированные рекомендации на основе поведения",
          "Непрерывное обучение для улучшения точности"
        ] : [
          "Historical consumption data analysis",
          "Seasonal factors and weather conditions consideration",
          "Personalized recommendations based on behavior",
          "Continuous learning to improve accuracy"
        ]
      },
      {
        icon: <Database className="h-8 w-8 text-green-600" />,
        title: isRussian ? "Параметры анализа" : "Analysis Parameters",
        description: isRussian 
          ? "Система учитывает множество факторов для создания максимально точных прогнозов и рекомендаций."
          : "The system considers multiple factors to create the most accurate forecasts and recommendations.",
        details: isRussian ? [
          "Размер дома и количество жильцов",
          "Используемая техника и ее энергоэффективность",
          "Погодные условия и температурный режим",
          "Региональные тарифы и нормы потребления"
        ] : [
          "Home size and number of residents",
          "Appliances used and their energy efficiency",
          "Weather conditions and temperature regime",
          "Regional tariffs and consumption norms"
        ]
      },
      {
        icon: <Shield className="h-8 w-8 text-purple-600" />,
        title: isRussian ? "Безопасность данных" : "Data Security",
        description: isRussian 
          ? "Мы гарантируем полную конфиденциальность и безопасность ваших персональных данных."
          : "We guarantee complete confidentiality and security of your personal data.",
        details: isRussian ? [
          "Шифрование всех данных при передаче и хранении",
          "Соответствие стандартам GDPR и российскому законодательству",
          "Данные не передаются третьим лицам",
          "Возможность удаления всех данных по запросу"
        ] : [
          "Encryption of all data during transmission and storage",
          "Compliance with GDPR standards and local legislation",
          "Data is not shared with third parties",
          "Ability to delete all data upon request"
        ]
      },
      {
        icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
        title: isRussian ? "Прогнозирование" : "Forecasting",
        description: isRussian 
          ? "Алгоритмы машинного обучения создают точные прогнозы потребления на будущие периоды."
          : "Machine learning algorithms create accurate consumption forecasts for future periods.",
        details: isRussian ? [
          "Прогнозы на месяц, квартал и год вперед",
          "Учет трендов изменения потребления",
          "Предупреждения о превышении лимитов",
          "Рекомендации по оптимизации расходов"
        ] : [
          "Forecasts for month, quarter and year ahead",
          "Consumption trend analysis",
          "Limit excess warnings",
          "Cost optimization suggestions"
        ]
      },
      {
        icon: <Zap className="h-8 w-8 text-yellow-600" />,
        title: isRussian ? "Открытый код" : "Open Source Approach",
        description: isRussian 
          ? "Прозрачность и открытость - наши ключевые принципы в разработке AI-моделей."
          : "Transparency and openness are our key principles in developing AI models.",
        details: isRussian ? [
          "Открытые алгоритмы и модели",
          "Возможность участия сообщества",
          "Прозрачная документация методологии",
          "Регулярные обновления и улучшения моделей"
        ] : [
          "Open source algorithms and models",
          "Community contribution opportunities",
          "Transparent methodology documentation",
          "Regular model updates and improvements"
        ]
      },
      {
        icon: <Globe className="h-8 w-8 text-cyan-600" />,
        title: isRussian ? "Интеграция системы" : "System Integration",
        description: isRussian 
          ? "Безшовная интеграция с существующей инфраструктурой и системами умного дома."
          : "Seamless integration with existing infrastructure and smart home systems.",
        details: isRussian ? [
          "Интеграция с умными счетчиками",
          "Подключение IoT-устройств",
          "Интеграция со сторонними сервисами",
          "API для разработчиков"
        ] : [
          "Smart meter integration",
          "IoT device connectivity",
          "Third-party service integration",
          "API for developers"
        ]
      }
    ],

    openSource: {
      title: isRussian ? "Открытый код и прозрачность" : "Open Source & Transparency",
      description: isRussian 
        ? "Мы верим в прозрачную разработку ИИ и сотрудничество с открытым исходным кодом"
        : "We believe in transparent AI development and open-source collaboration",
      principles: {
        title: isRussian ? "Основные принципы" : "Core Principles",
        items: isRussian ? [
          "Прозрачные алгоритмы и методологии",
          "Разработка, управляемая сообществом",
          "Открытые стандарты данных",
          "Регулярные аудиты безопасности"
        ] : [
          "Transparent algorithms and methodologies",
          "Community-driven development",
          "Open data standards",
          "Regular security audits"
        ]
      },
      benefits: {
        title: isRussian ? "Преимущества сообщества" : "Community Benefits",
        items: isRussian ? [
          "Вклад в улучшение моделей",
          "Доступ к исследовательским публикациям",
          "Образовательные ресурсы и документация",
          "Доступ к API для разработчиков"
        ] : [
          "Contribute to model improvements",
          "Access to research publications",
          "Educational resources and documentation",
          "Developer API access"
        ]
      }
    },

    aiModels: {
      title: isRussian ? "AI-модели и точность" : "AI Models & Accuracy",
      description: isRussian 
        ? "Наши модели машинного обучения постоянно обучаются и проверяются для оптимальной производительности"
        : "Our machine learning models are continuously trained and validated for optimal performance",
      metrics: [
        {
          value: "92%",
          title: isRussian ? "Точность прогнозов" : "Prediction Accuracy",
          subtitle: isRussian ? "Прогнозирование потребления" : "Consumption forecasting",
          color: "blue"
        },
        {
          value: "88%",
          title: isRussian ? "Обнаружение аномалий" : "Anomaly Detection",
          subtitle: isRussian ? "Распознавание паттернов" : "Pattern recognition",
          color: "green"
        },
        {
          value: "90%",
          title: isRussian ? "Анализ трендов" : "Trend Analysis",
          subtitle: isRussian ? "Моделирование временных рядов" : "Time series modeling",
          color: "purple"
        },
        {
          value: "85%",
          title: isRussian ? "Сегментация пользователей" : "User Segmentation",
          subtitle: isRussian ? "Алгоритмы кластеризации" : "Clustering algorithms",
          color: "orange"
        }
      ]
    },

    security: {
      title: isRussian ? "Безопасность данных и приватность" : "Data Security & Privacy",
      description: isRussian 
        ? "Безопасность ваших данных и приватность - наши главные приоритеты"
        : "Your data security and privacy are our top priorities",
      sections: [
        {
          icon: <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
          title: isRussian ? "Шифрование" : "Encryption",
          description: isRussian 
            ? "Сквозное шифрование для всех передач и хранения данных"
            : "End-to-end encryption for all data transmission and storage"
        },
        {
          icon: <Database className="h-6 w-6 text-green-600 dark:text-green-400" />,
          title: isRussian ? "Соответствие" : "Compliance",
          description: isRussian 
            ? "Соответствие GDPR с регулярными аудитами безопасности и сертификациями"
            : "GDPR compliant with regular security audits and certifications"
        },
        {
          icon: <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
          title: isRussian ? "Приватность" : "Privacy",
          description: isRussian 
            ? "Никакого обмена данными с третьими лицами, полный контроль пользователя"
            : "No data sharing with third parties, complete user control"
        }
      ]
    }
  };

  return (
    <div className="how-it-works-page min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto p-6 space-y-8">

      {/* Header */}
      <div className={`text-center mb-8 relative z-10 transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mb-6 group hover:scale-110 transition-transform duration-300">
          <Brain className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
          {content.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
          {content.subtitle}
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {content.features.map((feature, index) => (
          <Card key={index} className={`h-full group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: `${300 + index * 150}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Open Source Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-600" />
            {content.openSource.title}
          </CardTitle>
          <CardDescription>
            {content.openSource.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {content.openSource.principles.title}
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {content.openSource.principles.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {content.openSource.benefits.title}
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {content.openSource.benefits.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            {content.aiModels.title}
          </CardTitle>
          <CardDescription>
            {content.aiModels.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.aiModels.metrics.map((metric, index) => (
              <div key={index} className={`text-center p-4 bg-${metric.color}-50 dark:bg-${metric.color}-900/20 rounded-lg`}>
                <div className={`text-2xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400`}>
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{metric.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{metric.subtitle}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            {content.security.title}
          </CardTitle>
          <CardDescription>
            {content.security.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.security.sections.map((section, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  {section.icon}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}