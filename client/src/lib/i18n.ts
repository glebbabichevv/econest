export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export const translations = {
  en: {
    navigation: {
      home: "Home",
      dashboard: "Dashboard",
      analytics: "Analytics", 
      footprint: "Footprint",
      leaderboard: "Leaderboard",
      school: "Schools",
      about: "About",
      howItWorks: "How It Works",
      faq: "FAQ",
      contact: "Contact"
    },
    sidebar: {
      dashboard: "Dashboard",
      aiAssistant: "AI Assistant",
      footprint: "Footprint",
      schoolPanel: "School Panel",
      leaderboard: "Leaderboard",
      history: "History",
      profile: "Profile",
      logout: "Logout"
    },
    actions: {
      tryNow: "Try Now",
      login: "Login",
      logout: "Logout"
    },
    common: {
      week: "Week",
      month: "Month",
      year: "Year",
    },
    chart: {
      water: "Water (m³)",
      electricity: "Electricity (kWh)",
      gas: "Gas (m³)",
      currentMonth: "Current month",
      previousMonth: "Previous month",
      currentWeek: "Current week",
      previousWeek: "Previous week",
      noData: "No data",
      addReadings: "Add",
      meterReadings: "meter readings",
      forViewing: "for viewing",
      dataUnavailable: "Data unavailable"
    },
    landing: {
      title: "AI-powered platform for optimizing resource consumption and reducing environmental impact",
      subtitle: "Track your water, electricity, and gas usage with intelligent insights and personalized recommendations for a sustainable future.",
      whyChoose: "Why Choose Econest?",
      whyChooseSubtitle: "Harness the power of AI to make informed decisions about your resource consumption",
      features: {
        aiInsights: {
          title: "AI-Powered Insights",
          description: "Get personalized recommendations based on your consumption patterns, weather data, and seasonal trends."
        },
        realTimeMonitoring: {
          title: "Real-time Monitoring",
          description: "Track your water, electricity, and gas consumption in real-time with beautiful visualizations and charts."
        },
        communityLeaderboards: {
          title: "Community Leaderboards",
          description: "Compete with your region and school in friendly sustainability challenges and see your environmental impact."
        },
        smartPredictions: {
          title: "Smart Predictions",
          description: "Forecast your future consumption and costs with machine learning algorithms that adapt to your lifestyle."
        },
        weatherIntegration: {
          title: "Weather Integration",
          description: "Factor in weather conditions to understand consumption patterns and receive climate-aware recommendations."
        },
        multilingualSupport: {
          title: "Multilingual Support",
          description: "Available in English, Russian, and Kazakh to serve diverse communities and educational institutions."
        }
      },
      cta: {
        title: "Ready to Start Your Sustainability Journey?",
        subtitle: "Join thousands of users already making a positive environmental impact with Econest.",
        buttonText: "Get Started for Free"
      },
      footer: {
        description: "AI-powered platform for optimizing resource consumption and reducing environmental impact.",
        features: "Features",
        support: "Support",
        featuresList: {
          aiAnalytics: "AI Analytics",
          resourceTracking: "Resource Tracking", 
          leaderboards: "Leaderboards",
          weatherIntegration: "Weather Integration"
        },
        supportList: {
          helpCenter: "Help Center",
          contactUs: "Contact Us",
          privacyPolicy: "Privacy Policy",
          termsOfService: "Terms of Service"
        }
      }
    },
    howItWorks: {
      title: "How Econest Works",
      subtitle: "Discover the technology behind our AI-powered sustainability platform",
      features: {
        ai: {
          title: "Artificial Intelligence",
          description: "Our AI model analyzes your consumption data and creates personalized forecasts using machine learning.",
          details: [
            "Historical consumption data analysis",
            "Seasonal factors and weather conditions consideration",
            "Personalized recommendations based on behavior",
            "Continuous learning to improve accuracy"
          ]
        },
        parameters: {
          title: "Analysis Parameters",
          description: "The system considers multiple factors to create the most accurate forecasts and recommendations.",
          details: [
            "Home size and number of residents",
            "Appliances used and their energy efficiency",
            "Weather conditions and temperature regime",
            "Regional tariffs and consumption norms"
          ]
        },
        security: {
          title: "Data Security",
          description: "We guarantee complete confidentiality and security of your personal data.",
          details: [
            "Encryption of all data during transmission and storage",
            "Compliance with GDPR standards and local legislation",
            "Data is not shared with third parties",
            "Ability to delete all data upon request"
          ]
        },
        forecasting: {
          title: "Forecasting",
          description: "Machine learning algorithms create accurate consumption forecasts for future periods.",
          details: [
            "Forecasts for month, quarter and year ahead",
            "Consumption trend analysis",
            "Limit excess warnings",
            "Cost optimization suggestions"
          ]
        },
        openSource: {
          title: "Open Source Approach",
          description: "Transparency and openness are our key principles in developing AI models.",
          details: [
            "Open source algorithms and models",
            "Community contribution opportunities",
            "Transparent methodology documentation",
            "Regular model updates and improvements"
          ]
        },
        integration: {
          title: "System Integration",
          description: "Seamless integration with existing infrastructure and smart home systems.",
          details: [
            "Smart meter integration",
            "IoT device connectivity",
            "Third-party service integration",
            "API for developers"
          ]
        }
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to the most common questions about our platform",
      categories: {
        getting_started: "Getting Started",
        data_input: "Data Input",
        features: "Functionality", 
        technical: "Technical Questions",
        privacy: "Privacy & Security",
        school_module: "School Module"
      },
      questions: {
        getting_started: [
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
        ],
        data_input: [
          {
            question: "What if I don't have exact meter readings?",
            answer: "You can enter approximate values or use our estimation tool based on your home area, number of residents, and appliances. The AI will adjust its recommendations as you input more accurate data over time."
          },
          {
            question: "How often should I update data?",
            answer: "We recommend entering readings monthly for the most accurate forecasts. However, the system can work with less frequent updates. The more often you update data, the more accurate the AI recommendations become."
          },
          {
            question: "Does the system support different tariff types?",
            answer: "Yes, the system supports various tariff plans: single-rate, two-rate, time-of-day differentiated, and preferential tariffs. You can configure your tariff plan in the settings section."
          }
        ],
        features: [
          {
            question: "Who is Econest suitable for?",
            answer: "The platform is suitable for households, schools, small businesses, and organizations. We offer special rates for educational institutions and non-profit organizations, as well as corporate solutions for large companies."
          },
          {
            question: "Can I compare consumption with neighbors?",
            answer: "Yes, the system allows you to anonymously compare your consumption with average indicators in your district, city, or region. This helps understand how efficiently you use resources compared to other households."
          },
          {
            question: "How do consumption forecasts work?",
            answer: "AI algorithms analyze your historical data, consider seasonal factors, weather conditions, and lifestyle changes to predict future consumption. Forecasts are updated weekly and become more accurate over time."
          }
        ],
        technical: [
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
        ],
        privacy: [
          {
            question: "How is my data protected?",
            answer: "We use bank-level encryption (AES-256), all data is stored on secure servers in compliance with GDPR and local legislation. Personal data is never shared with third parties without your explicit consent."
          },
          {
            question: "Can I delete my data?",
            answer: "Yes, you can delete your account and all associated data at any time through your account settings. Data deletion is irreversible and takes effect within 30 days."
          },
          {
            question: "Who has access to my consumption data?",
            answer: "Only you have access to detailed consumption data. For research and AI model improvement, we use anonymized and aggregated data that cannot be linked to specific users."
          }
        ],
        school_module: [
          {
            question: "How to connect a school to the platform?",
            answer: "School administration can create a corporate account, add classes and students. We provide special educational materials and methodological guides for teachers. Eco-lessons and competitions are available."
          },
          {
            question: "What data is needed for the school module?",
            answer: "For schools, general building meter readings, number of students and classes, and room area are sufficient. You can also enter data for individual classrooms for more detailed analysis."
          },
          {
            question: "Are there educational materials available?",
            answer: "Yes, we provide lesson plans, presentations, practical tasks, and games for different age groups. Materials are aligned with educational standards and promote environmental awareness."
          }
        ]
      }
    },
    contact: {
      title: "Contact Us",
      subtitle: "We're here to help you with any questions or feedback",
      form: {
        title: "Send us a message",
        name: "Full Name",
        email: "Email Address", 
        subject: "Subject",
        message: "Your Message",
        send: "Send Message",
        nameRequired: "Name is required",
        emailRequired: "Valid email is required",
        subjectRequired: "Subject is required",
        messageRequired: "Message is required",
        success: "Message sent successfully! We'll get back to you soon.",
        error: "Failed to send message. Please try again.",
        validation: "Name, email, subject and message are required"
      },
      methods: {
        title: "Contact Methods",
        email: {
          title: "Email",
          description: "Send us an email",
          contact: "support@econest.ru",
          response: "We respond within 24 hours"
        },
        chat: {
          title: "Support Chat",
          description: "Online consultation",
          contact: "In mobile app",
          response: "Mon-Fri 9:00-18:00 MSK"
        },
        phone: {
          title: "Phone",
          description: "Call us for free",
          contact: "+7 (800) 555-35-35", 
          response: "Mon-Fri 9:00-18:00 MSK"
        },
        office: {
          title: "Office",
          description: "Our address",
          contact: "Moscow, Ecological St., 15",
          response: "By appointment only"
        }
      },
      social: {
        title: "Follow Us",
        github: {
          name: "GitHub",
          description: "Open source project"
        },
        twitter: {
          name: "Twitter", 
          description: "News and updates"
        },
        website: {
          name: "Website",
          description: "Official website"
        }
      },
      opportunities: {
        title: "Get Involved",
        volunteer: {
          title: "Volunteer",
          description: "Help develop the project",
          details: "Translations, testing, content creation"
        },
        partnership: {
          title: "Partnership",
          description: "Collaborate with organizations",
          details: "Schools, NGOs, environmental organizations"
        },
        bug_report: {
          title: "Report Bug",
          description: "Help us improve",
          details: "Found an issue? Let us know!"
        }
      }
    }
  },
  ru: {
    navigation: {
      home: "Главная",
      dashboard: "Панель",
      analytics: "Аналитика",
      footprint: "Экослед", 
      leaderboard: "Рейтинг",
      school: "Школы",
      about: "О проекте",
      howItWorks: "Как работает",
      faq: "Вопросы",
      contact: "Контакты"
    },
    sidebar: {
      dashboard: "Панель управления",
      aiAssistant: "ИИ-помощник",
      footprint: "Экослед",
      schoolPanel: "Школьная панель",
      leaderboard: "Рейтинг",
      history: "История",
      profile: "Профиль",
      logout: "Выйти"
    },
    actions: {
      tryNow: "Попробовать",
      login: "Войти",
      logout: "Выйти"
    },
    common: {
      week: "Неделя",
      month: "Месяц",
      year: "Год",
    },
    chart: {
      water: "Вода (м³)",
      electricity: "Электричество (кВт⋅ч)",
      gas: "Газ (м³)",
      currentMonth: "Текущий месяц",
      previousMonth: "Предыдущий месяц",
      currentWeek: "Текущая неделя",
      previousWeek: "Предыдущая неделя",
      noData: "Нет данных",
      addReadings: "Добавьте",
      meterReadings: "показания счетчиков",
      forViewing: "для просмотра",
      dataUnavailable: "Данные отсутствуют"
    }
  }
};

export const getLanguageFromCode = (code: string): Language => {
  return languages.find(lang => lang.code === code) || languages[0];
};
