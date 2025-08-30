export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
];

export const translations = {
  en: {
    dateRequired: "Date is required",
    addReadingDescription: "Add monthly consumption data for tracking",
    dataSourcesTitle: "Data Sources",
    dataSourcesDescription: "Where to find your consumption data",
    cancel: "Cancel",
    save: "Save",
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
      contact: "Contact",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      ocean: "Ocean"
    },
    sidebar: {
      dashboard: "Dashboard",
      aiAssistant: "AI Assistant",
      footprint: "Carbon Footprint",
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
    units: {
      cubicMeters: "m³",
      kilowattHours: "kWh",
      gcal: "Gcal",
      kg: "kg",
      kgCO2: "kg CO₂"
    },
    chart: {
      water: "Water (m³)",
      electricity: "Electricity (kWh)",
      gas: "Gas (m³)",
      currentMonth: "Current month",
      "Current month": "Current month",
      previousMonth: "Previous month",
      currentWeek: "Current week",
      previousWeek: "Previous week",
      noData: "No data",
      addReadings: "Add",
      meterReadings: "meter readings",
      forViewing: "for viewing",
      dataUnavailable: "Data unavailable"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back",
      quickActions: "Quick Actions",
      addReading: "Add Reading",
      viewReport: "View Report",
      settings: "Settings",
      consumption: "Consumption",
      predictions: "Predictions",
      leaderboard: "Leaderboard",
      recommendations: "Recommendations",
      viewAll: "View All",
      thisMonth: "This month",
      lastMonth: "Last month",
      kwh: "kWh",
      m3: "m³",
      kg: "kg CO₂",
      increase: "increase",
      decrease: "decrease",
      noDataYet: "No data yet",
      addFirstReading: "Add your first reading",
      electricityRequired: "Electricity is required",
      waterRequired: "Water is required",
      gasRequired: "Gas is required",
      dateRequired: "Date is required",
      addReadingDescription: "Add monthly consumption data for tracking",
      dataSourcesTitle: "Data Sources",
      dataSourcesDescription: "Where to find your consumption data",
      cancel: "Cancel",
      save: "Save",
      selectMonth: "Select Month",
      selectYear: "Select Year",
      successTitle: "Success",
      successDescription: "Reading added successfully",
      errorTitle: "Error",
      electricity: "Electricity",
      water: "Water",
      gas: "Gas",
      readingDate: "Reading Date",
      overview: "Overview",
      unauthorized: "Unauthorized",
      loggedOut: "You have been logged out",
      consumptionTrends: "Consumption Trends",
      noDataAvailable: "No data available",
      addReadingsToSee: "Add readings to see",
      aiInsights: "AI Insights"
    },
    utilities: {
      coldWater: "Cold Water",
      hotWater: "Hot Water",
      sewage: "Sewage",
      heating: "Heating",
      electricity: "Electricity",
      gas: "Gas"
    },
    ai: {
      assistant: "AI Assistant",
      description: "Your personal environmental coach",
      hello: "Hello",
      analysisDescription: "I analyze your consumption patterns and current weather to provide personalized recommendations for reducing your environmental impact.",
      generateInsights: "Generate New Insights",
      generate: "Generate",
      clearRecommendations: "Clear Recommendations", 
      clear: "Clear",
      potentialSavings: "Potential savings",
      aiGenerated: "AI-generated recommendation",
      noInsights: "No AI insights yet",
      addDataFirst: "Add your consumption data on the Dashboard, then click \"Generate New Insights\" to get personalized AI recommendations.",
      priority: "priority"
    },
    about: {
      title: "About Econest",
      subtitle: "Leading the way in sustainable resource management",
      mission: "Our Mission",
      missionText: "To empower individuals and communities with intelligent tools for reducing their environmental impact through data-driven insights and AI-powered recommendations.",
      smartAnalytics: "Smart Analytics",
      smartAnalyticsText: "Advanced AI algorithms analyze your consumption patterns to provide personalized insights and actionable recommendations.",
      community: "Community Impact",
      communityText: "Join a growing community of environmentally conscious users working together to create a sustainable future.",
      globalImpact: "Global Impact",
      globalImpactText: "Every small action contributes to a larger movement towards environmental responsibility and climate action.",
      howItWorks: "How It Works"
    },
    landing: {
      title: "AI-powered platform for optimizing resource consumption and reducing environmental impact",
      subtitle: "Track your water, electricity, and gas usage with intelligent insights and personalized recommendations for a sustainable future.",
      whyChoose: "Why Choose Econest?",
      whyChooseSubtitle: "Harness the power of AI to make informed decisions about your resource consumption",
      aiInsightsTitle: "AI-Powered Insights",
      aiInsightsDesc: "Get personalized recommendations based on your consumption patterns, weather data, and seasonal trends.",
      realTimeTitle: "Real-time Monitoring",
      realTimeDesc: "Track your water, electricity, and gas consumption in real-time with beautiful visualizations and charts.",
      communityTitle: "Community Leaderboards",
      communityDesc: "Compete with your region in friendly sustainability challenges and see your environmental impact.",
      predictionsTitle: "Smart Predictions",
      predictionsDesc: "Forecast your future consumption and costs with machine learning algorithms that adapt to your lifestyle.",
      weatherTitle: "Weather Integration",
      weatherDesc: "Factor in weather conditions to understand consumption patterns and receive climate-aware recommendations.",
      multilingualTitle: "Multilingual Support",
      multilingualDesc: "Available in English, Russian, and Kazakh to serve diverse communities and educational institutions.",
      ctaTitle: "Ready to Start Your Sustainability Journey?",
      ctaSubtitle: "Join thousands of users already making a positive environmental impact with Econest.",
      ctaButton: "Get Started for Free",
      footerDesc: "AI-powered platform for optimizing resource consumption and reducing environmental impact.",
      featuresTitle: "Features",
      support: "Support",
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
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      region: "Region",
      loginButton: "Sign In",
      registerButton: "Create Account",
      switchToRegister: "Don't have an account? Register",
      switchToLogin: "Already have an account? Login",
      loginError: "Invalid credentials",
      registerError: "Registration failed",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      regionRequired: "Region is required",
      role: "Role",
      selectRole: "Select your role",
      student: "Student",
      adult: "Adult",
      company: "Company",
      confirmPassword: "Confirm Password",
      signUp: "Sign Up",
      signIn: "Sign In",
      welcomeBack: "Welcome back",
      loginSuccess: "Login Successful",
      registerSuccess: "Registration Successful",
      welcome: "Welcome to Econest!",
      subtitle: "AI-powered platform for resource consumption optimization",
      error: "Error",
      fillAllFields: "Please fill in all fields",
      "Full year": "Full year",
      emissions: "emissions",
      "Trees needed to offset your": "Trees needed to offset your",
      analyzing: "Analyzing...",
      clearing: "Clearing...",
      generatingInsights: "Generating AI insights...",
      loading: "Loading...",
      clickToAnalyze: "Click \"Get AI Insights\" to analyze your environmental impact",
      noInsightsYet: "No AI insights available yet",
      dateRequired: "Date is required",
      addReadingDescription: "Add monthly consumption data for tracking",
      dataSourcesTitle: "Data Sources",
      dataSourcesDescription: "Where to find your consumption data",
      cancel: "Cancel",
      save: "Save"
    },
    footprint: {
      title: "Carbon Footprint Analysis",
      subtitle: "Your environmental impact tracker",
      description: "Track and analyze your carbon footprint with AI-powered insights and recommendations to reduce your environmental impact.",
      currentFootprint: "Current CO₂ Footprint",
      thisMonth: "This month",
      kgCO2: "kg CO₂",
      recommendations: "AI Recommendations",
      getRecommendations: "Get Personalized Tips",
      clearCache: "Refresh Analysis",
      clearingCache: "Refreshing...",
      cacheCleared: "Analysis refreshed!",
      loadingRecommendations: "Getting personalized recommendations...",
      noRecommendations: "Add consumption data to get AI recommendations",
      impactBreakdown: "Environmental Impact Breakdown",
      impactDescription: "Your monthly consumption translates to environmental consequences:",
      co2Equivalent: "🌍 Total CO₂ impact",
      treesNeeded: "🌳 Trees needed to offset",
      deforestationEquivalent: "🌲 Forest area destroyed daily",
      animalHabitatLoss: "🦎 Wildlife habitat lost",
      glacierMelting: "🧊 Glacier ice melted",
      oceanAcidification: "🌊 Ocean acidification contribution",
      offsetSuggestions: "💡 How to restore balance:",
      plantTrees: "Plant native trees in your community",
      useRenewableEnergy: "Switch to renewable energy sources",
      improveInsulation: "Improve home insulation",
      reduceWaste: "Minimize waste and increase recycling",
      walkMore: "Use public transport or walk/bike more",
      eatLocal: "Choose local and seasonal food",
      currentMonthEmissions: "Current month emissions",
      treesNeededOffset: "Trees needed to offset your",
      monthly: "monthly",
      yearly: "yearly",
      monthlyCO2Emissions: "monthly CO₂ emissions",
      footprintAssistant: "Footprint Assistant",
      aiInsightsDesc: "AI-powered insights about your environmental impact",
      footprintBotHello: "Hello",
      footprintBotDescription: "I analyze your consumption patterns and current weather to provide personalized recommendations for reducing your environmental impact.",
      potentialImpact: "Potential impact",
      getAIInsights: "Get AI Insights",
      clear: "Clear",
      loading: "Loading",
      noInsightsYet: "No AI insights available yet",
      clickToAnalyze: "Click \"Get AI Insights\" to analyze your environmental impact",
      generatingInsights: "Generating AI insights",
      clearing: "Clearing"
    },
    leaderboard: {
      title: "Regional CO₂ Leaderboard",
      subtitle: "Compare your region's environmental performance",
      description: "See how your region performs in carbon footprint reduction compared to others across Kazakhstan.",
      selectMonth: "Select Month",
      regions: "Regional Stats",
      avgCO2: "Avg CO₂",
      totalUsers: "Users",
      month: "Month",
      data: "Data"
    },
    analytics: {
      title: "Analytics Dashboard",
      subtitle: "Deep insights into your consumption patterns",
      description: "Advanced analytics and predictions for your resource consumption with AI-powered forecasting.",
      consumptionTrends: "Consumption Trends",
      predictions: "AI Predictions",
      insights: "Key Insights"
    },
    profile: {
      title: "Profile Settings",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      role: "Role",
      language: "Language",
      region: "Region",
      update: "Update Profile",
      updating: "Updating...",
      updated: "Profile updated successfully",
      updateFailed: "Failed to update profile",
      supportContact: "Support & Contact",
      emailSupport: "Email Support",
      officePhone: "Office Phone",
      deleteAccount: "Delete Account",
      dangerZone: "Danger Zone",
      responseTime: "We respond within 24 hours",
      officeHours: "Office hours only",
      deleteConfirmTitle: "Are you absolutely sure?",
      deleteConfirmDesc: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:",
      deleteDataList1: "All consumption readings and history",
      deleteDataList2: "AI recommendations and insights",
      deleteDataList3: "Leaderboard rankings and achievements",
      deleteDataList4: "Account settings and preferences",
      cancel: "Cancel",
      confirmDelete: "Yes, delete my account",
      currentPassword: "Current Password",
      newPassword: "New Password",
      enterCurrentPassword: "Enter current password",
      enterNewPassword: "Enter new password",
      confirmNewPassword: "Confirm new password",
      deleteAccountDescription: "Permanently delete your account and all associated data. This action cannot be undone."
    },
    regions: {
      almaty: "Almaty",
      astana: "Astana",
      shymkent: "Shymkent",
      aktobe: "Aktobe", 
      taraz: "Taraz",
      pavlodar: "Pavlodar",
      "ust-kamenogorsk": "Ust-Kamenogorsk",
      semey: "Semey"
    },
    weather: {
      selectRegion: "Select your region to get personalized weather insights",
      chooseRegion: "Choose region",
      changeRegion: "Change"
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
    },
    charts: {
      emissions: "CO₂ Emissions",
      coldWater: "Cold Water",
      hotWater: "Hot Water", 
      sewage: "Sewage",
      electricity: "Electricity",
      gas: "Gas",
      heating: "Heating",
      coldWaterUnit: "Cold Water (m³)",
      hotWaterUnit: "Hot Water (m³)",
      sewageUnit: "Sewage (m³)",
      electricityUnit: "Electricity (kWh)",
      gasUnit: "Gas (m³)",
      heatingUnit: "Heating (Gcal)",
      electricityCO2: "Electricity CO₂",
      gasCO2: "Gas CO₂",
      heatingCO2: "Heating CO₂",
      waterCO2: "Water CO₂",
      water: "Water"
    },
    quickActions: {
      addReading: "Add Reading",
      viewInsights: "View Insights", 
      checkFootprint: "Check CO₂ Footprint",
      compareRegions: "Compare Regions",
      regionalStats: "Regional CO₂ Statistics",
      clickToViewLeaderboard: "Click to view full leaderboard",
      rank: "Rank",
      region: "Region",
      totalCO2: "Total CO₂ (kg)",
      users: "Users",
      delete: "Delete",
      detailedView: "Detailed View",
      monthlyConsumptionBreakdown: "Monthly Consumption Breakdown",
      consumptionDetails: "Consumption Details"
    }
  },
  ru: {
    dateRequired: "Дата обязательна",
    addReadingDescription: "Добавьте данные месячного потребления для отслеживания",
    dataSourcesTitle: "Источники данных",
    dataSourcesDescription: "Где найти данные о потреблении",
    cancel: "Отмена",
    save: "Сохранить",
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
      contact: "Контакты",
      theme: "Тема",
      light: "Светлая",
      dark: "Темная",
      ocean: "Океан"
    },
    sidebar: {
      dashboard: "Панель управления",
      aiAssistant: "ИИ-помощник",
      footprint: "Экослед",
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
    units: {
      cubicMeters: "м³",
      kilowattHours: "кВт⋅ч",
      gcal: "Гкал",
      kg: "кг",
      kgCO2: "кг CO₂"
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
    },
    dashboard: {
      title: "Панель управления",
      welcome: "Добро пожаловать",
      quickActions: "Быстрые действия",
      addReading: "Добавить показания",
      viewReport: "Просмотр отчета",
      settings: "Настройки",
      consumption: "Потребление",
      predictions: "Прогнозы",
      leaderboard: "Рейтинг",
      recommendations: "Рекомендации",
      viewAll: "Посмотреть все",
      thisMonth: "В этом месяце",
      lastMonth: "В прошлом месяце",
      kwh: "кВт⋅ч",
      m3: "м³",
      kg: "кг CO₂",
      increase: "увеличение",
      decrease: "уменьшение",
      noDataYet: "Данных пока нет",
      addFirstReading: "Добавьте первые показания",
      electricityRequired: "Электричество обязательно",
      waterRequired: "Вода обязательна",
      gasRequired: "Газ обязателен",
      dateRequired: "Дата обязательна",
      addReadingDescription: "Добавьте данные месячного потребления для отслеживания",
      dataSourcesTitle: "Источники данных",
      dataSourcesDescription: "Где найти данные о потреблении",
      cancel: "Отмена",
      save: "Сохранить",
      selectMonth: "Выберите месяц",
      selectYear: "Выберите год",
      successTitle: "Успех",
      successDescription: "Показания добавлены успешно",
      errorTitle: "Ошибка",
      electricity: "Электричество",
      water: "Вода",
      gas: "Газ",
      readingDate: "Дата показаний",
      overview: "Обзор",
      unauthorized: "Не авторизован",
      loggedOut: "Вы вышли из системы",
      consumptionTrends: "Тренды потребления",
      noDataAvailable: "Данные отсутствуют",
      addReadingsToSee: "Добавьте показания для просмотра",
      aiInsights: "ИИ инсайты"
    },
    utilities: {
      coldWater: "Холодная вода",
      hotWater: "Горячая вода", 
      sewage: "Канализация",
      heating: "Отопление",
      electricity: "Электричество",
      gas: "Газ"
    },
    ai: {
      assistant: "ИИ-помощник",
      description: "Ваш персональный экологический тренер",
      hello: "Привет",
      analysisDescription: "Я анализирую ваши схемы потребления и текущую погоду, чтобы предоставить персонализированные рекомендации по снижению вашего воздействия на окружающую среду.",
      generateInsights: "Сгенерировать новые инсайты",
      generate: "Генерировать",
      clearRecommendations: "Очистить рекомендации", 
      clear: "Очистить",
      potentialSavings: "Потенциальная экономия",
      aiGenerated: "ИИ-рекомендация",
      noInsights: "Пока нет ИИ инсайтов",
      addDataFirst: "Добавьте данные о потреблении в Панель управления, затем нажмите \"Сгенерировать новые инсайты\" для получения персонализированных ИИ-рекомендаций.",
      priority: "приоритет"
    },
    about: {
      title: "О проекте Econest",
      subtitle: "Лидеры в области устойчивого управления ресурсами",
      mission: "Наша миссия",
      missionText: "Предоставить людям и сообществам интеллектуальные инструменты для снижения их воздействия на окружающую среду через инсайты на основе данных и рекомендации на основе ИИ.",
      smartAnalytics: "Умная аналитика",
      smartAnalyticsText: "Продвинутые алгоритмы ИИ анализируют ваши паттерны потребления для предоставления персональных инсайтов и практических рекомендаций.",
      community: "Влияние сообщества",
      communityText: "Присоединяйтесь к растущему сообществу экологически осознанных пользователей, работающих вместе для создания устойчивого будущего.",
      globalImpact: "Глобальное влияние",
      globalImpactText: "Каждое маленькое действие вносит вклад в большее движение к экологической ответственности и климатическим действиям.",
      howItWorks: "Как это работает"
    },
    landing: {
      title: "ИИ-платформа для оптимизации потребления ресурсов и снижения воздействия на окружающую среду",
      subtitle: "Отслеживайте потребление воды, электроэнергии и газа с интеллектуальной аналитикой и персональными рекомендациями для устойчивого будущего.",
      whyChoose: "Почему Econest?",
      whyChooseSubtitle: "Используйте силу ИИ для принятия обоснованных решений о потреблении ресурсов",
      aiInsightsTitle: "Аналитика на основе ИИ",
      aiInsightsDesc: "Получайте персональные рекомендации на основе ваших паттернов потребления, погодных данных и сезонных трендов.",
      realTimeTitle: "Мониторинг в реальном времени",
      realTimeDesc: "Отслеживайте потребление воды, электроэнергии и газа в реальном времени с красивой визуализацией и графиками.",
      communityTitle: "Рейтинги сообщества",
      communityDesc: "Соревнуйтесь с вашим регионом в дружественных соревнованиях по устойчивости и смотрите свое воздействие на окружающую среду.",
      predictionsTitle: "Умные прогнозы",
      predictionsDesc: "Прогнозируйте будущее потребление и затраты с помощью алгоритмов машинного обучения, адаптирующихся к вашему образу жизни.",
      weatherTitle: "Интеграция с погодой",
      weatherDesc: "Учитывайте погодные условия для понимания паттернов потребления и получения климатически-осознанных рекомендаций.",
      multilingualTitle: "Многоязычная поддержка",
      multilingualDesc: "Доступно на английском, русском и казахском языках для обслуживания разнообразных сообществ и образовательных учреждений.",
      ctaTitle: "Готовы начать ваше путешествие к устойчивости?",
      ctaSubtitle: "Присоединяйтесь к тысячам пользователей, уже оказывающих положительное воздействие на окружающую среду с Econest.",
      ctaButton: "Начать бесплатно",
      footerDesc: "ИИ-платформа для оптимизации потребления ресурсов и снижения воздействия на окружающую среду.",
      featuresTitle: "Возможности",
      support: "Поддержка",
      features: {
        aiInsights: {
          title: "Аналитика на основе ИИ",
          description: "Получайте персональные рекомендации на основе ваших паттернов потребления, погодных данных и сезонных трендов."
        },
        realTimeMonitoring: {
          title: "Мониторинг в реальном времени",
          description: "Отслеживайте потребление воды, электроэнергии и газа в реальном времени с красивой визуализацией и графиками."
        },
        communityLeaderboards: {
          title: "Рейтинги сообщества",
          description: "Соревнуйтесь с вашим регионом в дружественных соревнованиях по устойчивости и смотрите свое воздействие на окружающую среду."
        },
        smartPredictions: {
          title: "Умные прогнозы",
          description: "Прогнозируйте будущее потребление и затраты с помощью алгоритмов машинного обучения, адаптирующихся к вашему образу жизни."
        },
        weatherIntegration: {
          title: "Интеграция с погодой",
          description: "Учитывайте погодные условия для понимания паттернов потребления и получения климатически-осознанных рекомендаций."
        },
        multilingualSupport: {
          title: "Многоязычная поддержка",
          description: "Доступно на английском, русском и казахском языках для обслуживания разнообразных сообществ и образовательных учреждений."
        }
      },
      cta: {
        title: "Готовы начать ваше путешествие к устойчивости?",
        subtitle: "Присоединяйтесь к тысячам пользователей, уже оказывающих положительное воздействие на окружающую среду с Econest.",
        buttonText: "Начать бесплатно"
      },
      footer: {
        description: "ИИ-платформа для оптимизации потребления ресурсов и снижения воздействия на окружающую среду.",
        features: "Возможности",
        support: "Поддержка",
        featuresList: {
          aiAnalytics: "ИИ-аналитика",
          resourceTracking: "Отслеживание ресурсов", 
          leaderboards: "Рейтинги",
          weatherIntegration: "Интеграция с погодой"
        },
        supportList: {
          helpCenter: "Центр помощи",
          contactUs: "Связаться с нами",
          privacyPolicy: "Политика конфиденциальности",
          termsOfService: "Условия обслуживания"
        }
      }
    },
    profile: {
      title: "Профиль",
      personalInfo: "Личная информация",
      firstName: "Имя",
      lastName: "Фамилия",
      email: "Email",
      role: "Роль",
      language: "Язык",
      region: "Регион",
      update: "Обновить",
      updating: "Обновление...",
      updated: "Профиль обновлен",
      updateFailed: "Не удалось обновить профиль",
      supportContact: "Поддержка и контакты",
      emailSupport: "Поддержка по Email",
      officePhone: "Телефон офиса",
      deleteAccount: "Удалить аккаунт",
      dangerZone: "Опасная зона",
      responseTime: "Мы отвечаем в течение 24 часов",
      officeHours: "Только в рабочее время",
      deleteConfirmTitle: "Вы абсолютно уверены?",
      deleteConfirmDesc: "Это действие нельзя отменить. Это окончательно удалит ваш аккаунт и удалит все ваши данные с наших серверов, включая:",
      deleteDataList1: "Все показания потребления и историю",
      deleteDataList2: "ИИ-рекомендации и аналитику",
      deleteDataList3: "Рейтинги и достижения",
      deleteDataList4: "Настройки аккаунта и предпочтения",
      cancel: "Отмена",
      confirmDelete: "Да, удалить мой аккаунт",
      currentPassword: "Текущий пароль",
      newPassword: "Новый пароль",
      enterCurrentPassword: "Введите текущий пароль",
      enterNewPassword: "Введите новый пароль",
      confirmNewPassword: "Подтвердите новый пароль",
      deleteAccountDescription: "Навсегда удалить ваш аккаунт и все связанные данные. Это действие нельзя отменить."
    },
    auth: {
      login: "Войти",
      register: "Регистрация",
      email: "Email",
      password: "Пароль",
      firstName: "Имя",
      lastName: "Фамилия",
      region: "Регион",
      loginButton: "Войти",
      registerButton: "Создать аккаунт",
      switchToRegister: "Нет аккаунта? Зарегистрируйтесь",
      switchToLogin: "Уже есть аккаунт? Войти",
      loginError: "Неверные данные",
      registerError: "Ошибка регистрации",
      emailRequired: "Email обязателен",
      passwordRequired: "Пароль обязателен",
      firstNameRequired: "Имя обязательно",
      lastNameRequired: "Фамилия обязательна",
      regionRequired: "Регион обязателен",
      role: "Роль",
      selectRole: "Выберите свою роль",
      student: "Студент",
      adult: "Взрослый",
      company: "Компания",
      confirmPassword: "Подтвердить пароль",
      signUp: "Зарегистрироваться",
      subtitle: "ИИ-платформа для оптимизации потребления ресурсов",
      error: "Ошибка", 
      fillAllFields: "Пожалуйста, заполните все поля",
      dateRequired: "Дата обязательна",
      addReadingDescription: "Добавьте данные месячного потребления для отслеживания",
      dataSourcesTitle: "Источники данных",
      dataSourcesDescription: "Где найти данные о потреблении",
      cancel: "Отмена",
      save: "Сохранить",
      "Current month": "Текущий месяц",
      "Full year": "Полный год",
      emissions: "выбросы",
      "Trees needed to offset your": "Деревьев нужно для компенсации ваших",
      analyzing: "Анализ...",
      clearing: "Очистка...",
      generatingInsights: "Генерация ИИ анализа...",
      loading: "Загрузка...",
      clickToAnalyze: "Нажмите \"Получить ИИ анализ\" для анализа воздействия на окружающую среду",
      noInsightsYet: "ИИ анализ пока недоступен",
    },
    footprint: {
      title: "Анализ углеродного следа",
      subtitle: "Трекер вашего воздействия на окружающую среду",
      description: "Отслеживайте и анализируйте свой углеродный след с ИИ-инсайтами и рекомендациями для снижения воздействия на окружающую среду.",
      currentFootprint: "Текущий углеродный след CO₂",
      thisMonth: "В этом месяце",
      kgCO2: "кг CO₂",
      recommendations: "ИИ-рекомендации",
      getRecommendations: "Получить персональные советы",
      clearCache: "Обновить анализ",
      clearingCache: "Обновление...",
      cacheCleared: "Анализ обновлен!",
      loadingRecommendations: "Получение персональных рекомендаций...",
      noRecommendations: "Добавьте данные потребления для получения ИИ-рекомендаций",
      impactBreakdown: "Разбор воздействия на окружающую среду",
      impactDescription: "Ваше месячное потребление приводит к экологическим последствиям:",
      co2Equivalent: "🌍 Общее воздействие CO₂",
      treesNeeded: "🌳 Деревьев нужно для компенсации",
      deforestationEquivalent: "🌲 Площадь леса, уничтожаемая ежедневно",
      animalHabitatLoss: "🦎 Потерянная среда обитания животных",
      glacierMelting: "🧊 Растаявший ледниковый лед",
      oceanAcidification: "🌊 Вклад в закисление океана",
      offsetSuggestions: "💡 Как восстановить баланс:",
      plantTrees: "Сажайте местные деревья в своем сообществе",
      useRenewableEnergy: "Переходите на возобновляемые источники энергии",
      improveInsulation: "Улучшите изоляцию дома",
      reduceWaste: "Минимизируйте отходы и увеличьте переработку",
      walkMore: "Используйте общественный транспорт или ходите/ездите на велосипеде",
      eatLocal: "Выбирайте местную и сезонную еду",
      currentMonthEmissions: "Выбросы текущего месяца",
      treesNeededOffset: "Деревьев нужно для компенсации ваших",
      monthly: "месячных",
      yearly: "годовых",
      monthlyCO2Emissions: "месячных выбросов CO₂",
      footprintAssistant: "Помощник экоследа",
      aiInsightsDesc: "ИИ-анализ вашего воздействия на окружающую среду",
      footprintBotHello: "Привет",
      footprintBotDescription: "Я анализирую ваши схемы потребления и текущую погоду, чтобы предоставить персонализированные рекомендации по снижению вашего воздействия на окружающую среду.",
      potentialImpact: "Потенциальное влияние",
      getAIInsights: "Получить ИИ анализ",
      clear: "Очистить",
      loading: "Загрузка",
      noInsightsYet: "ИИ анализ пока недоступен",
      clickToAnalyze: "Нажмите \"Получить ИИ анализ\" для анализа воздействия на окружающую среду",
      generatingInsights: "Генерация ИИ анализа",
      clearing: "Очистка"
    },
    leaderboard: {
      title: "Региональный рейтинг CO₂",
      subtitle: "Сравните экологическую эффективность вашего региона",
      description: "Посмотрите, как ваш регион справляется со снижением углеродного следа по сравнению с другими регионами Казахстана.",
      selectMonth: "Выберите месяц",
      regions: "Статистика регионов",
      avgCO2: "Среднее CO₂",
      totalUsers: "Пользователи",
      month: "Месяц",
      data: "Данные"
    },
    analytics: {
      title: "Панель аналитики",
      subtitle: "Глубокие инсайты в ваши паттерны потребления",
      description: "Продвинутая аналитика и прогнозы для вашего потребления ресурсов с прогнозированием на основе ИИ.",
      consumptionTrends: "Тренды потребления",
      predictions: "ИИ-прогнозы",
      insights: "Ключевые инсайты"
    },
    regions: {
      almaty: "Алматы",
      astana: "Астана",
      shymkent: "Шымкент",
      aktobe: "Актобе", 
      taraz: "Тараз",
      pavlodar: "Павлодар",
      "ust-kamenogorsk": "Усть-Каменогорск",
      semey: "Семей"
    },
    weather: {
      selectRegion: "Выберите ваш регион для получения персональных погодных инсайтов",
      chooseRegion: "Выберите регион",
      changeRegion: "Изменить"
    },
    contact: {
      title: "Свяжитесь с нами",
      subtitle: "Мы готовы помочь вам с любыми вопросами или отзывами",
      howToHelp: "Как помочь проекту",
      reportBug: "Сообщить об ошибке",
      helpImprove: "Помогите нам улучшиться",
      suggestFeature: "Предложить идею",
      shareIdeas: "Поделитесь своими идеями",
      feedback: "Обратная связь",
      shareExperience: "Поделитесь впечатлениями"
    },
    quickActions: {
      addReading: "Добавить показания",
      viewInsights: "Просмотр инсайтов",
      checkFootprint: "Проверить CO₂ след",
      compareRegions: "Сравнить регионы",
      regionalStats: "Региональная статистика CO₂",
      clickToViewLeaderboard: "Нажмите, чтобы посмотреть полный рейтинг",
      rank: "Место",
      region: "Регион",
      totalCO2: "Общий CO₂ (кг)",
      users: "Пользователи",
      delete: "Удалить",
      detailedView: "Подробный просмотр",
      monthlyConsumptionBreakdown: "Разбивка месячного потребления",
      consumptionDetails: "Подробности потребления"
    },
    charts: {
      consumption: "Потребление",
      emissions: "Выбросы",
      coldWater: "Холодная вода",
      hotWater: "Горячая вода",
      sewage: "Канализация",
      electricity: "Электричество",
      gas: "Газ",
      heating: "Отопление",
      water: "Вода",
      month: "Месяц",
      year: "Год",
      kgCO2: "кг CO₂",
      noData: "Данные недоступны"
    }
  },
  kk: {
    dateRequired: "Күн міндетті",
    addReadingDescription: "Қадағалау үшін айлық тұтыну деректерін қосыңыз",
    dataSourcesTitle: "Деректер көздері",
    dataSourcesDescription: "Тұтыну туралы деректерді қайдан табуға болады",
    cancel: "Болдырмау",
    save: "Сақтау",
    navigation: {
      home: "Басты бет",
      dashboard: "Басқару тақтасы",
      analytics: "Аналитика",
      footprint: "Экоіз", 
      leaderboard: "Рейтинг",
      school: "Мектептер",
      about: "Жоба туралы",
      howItWorks: "Қалай жұмыс істейді",
      faq: "Сұрақтар",
      contact: "Байланыс",
      theme: "Тақырып",
      light: "Жарық",
      dark: "Қараңғы",
      ocean: "Мұхит"
    },
    sidebar: {
      dashboard: "Басқару тақтасы",
      aiAssistant: "ЖИ-көмекшісі",
      footprint: "Экоіз",
      leaderboard: "Рейтинг",
      history: "Тарих",
      profile: "Профиль",
      logout: "Шығу"
    },
    actions: {
      tryNow: "Қазір сынап көру",
      login: "Кіру",
      logout: "Шығу"
    },
    common: {
      week: "Апта",
      month: "Ай", 
      year: "Жыл",
    },
    units: {
      cubicMeters: "м³",
      kilowattHours: "кВт⋅сағ",
      gcal: "Гкал",
      kg: "кг",
      kgCO2: "кг CO₂"
    },
    chart: {
      water: "Су (м³)",
      electricity: "Электр энергиясы (кВт⋅сағ)",
      gas: "Газ (м³)",
      currentMonth: "Ағымдағы ай",
      previousMonth: "Өткен ай",
      currentWeek: "Ағымдағы апта",
      previousWeek: "Өткен апта",
      noData: "Деректер жоқ",
      addReadings: "Қосыңыз",
      meterReadings: "есептеуіш көрсеткіштері",
      forViewing: "көру үшін",
      dataUnavailable: "Деректер қолжетімсіз"
    },
    dashboard: {
      title: "Басқару тақтасы",
      welcome: "Қош келдіңіз",
      quickActions: "Жылдам әрекеттер",
      addReading: "Көрсеткіш қосу",
      viewReport: "Есепті көру",
      settings: "Параметрлер",
      consumption: "Тұтыну",
      predictions: "Болжамдар",
      leaderboard: "Рейтинг",
      recommendations: "Ұсыныстар",
      viewAll: "Барлығын көру",
      thisMonth: "Осы айда",
      lastMonth: "Өткен айда",
      kwh: "кВт⋅сағ",
      m3: "м³",
      kg: "кг CO₂",
      increase: "өсу",
      decrease: "азаю",
      noDataYet: "Деректер әлі жоқ",
      addFirstReading: "Алғашқы көрсеткішті қосыңыз",
      electricityRequired: "Электр энергиясы міндетті",
      waterRequired: "Су міндетті",
      gasRequired: "Газ міндетті",
      dateRequired: "Күн міндетті",
      addReadingDescription: "Қадағалау үшін айлық тұтыну деректерін қосыңыз",
      dataSourcesTitle: "Деректер көздері",
      dataSourcesDescription: "Тұтыну туралы деректерді қайдан табуға болады",
      cancel: "Болдырмау",
      save: "Сақтау",
      selectMonth: "Айды таңдаңыз",
      selectYear: "Жылды таңдаңыз",
      successTitle: "Сәттілік",
      successDescription: "Көрсеткіштер сәтті қосылды",
      errorTitle: "Қате",
      electricity: "Электр энергиясы",
      water: "Су",
      gas: "Газ",
      readingDate: "Көрсеткіш күні",
      overview: "Шолу",
      unauthorized: "Авторизация жоқ",
      loggedOut: "Сіз жүйеден шықтыңыз",
      consumptionTrends: "Тұтыну үрдістері",
      noDataAvailable: "Деректер жоқ",
      addReadingsToSee: "Көру үшін көрсеткіштерді қосыңыз",
      aiInsights: "ЖИ түсініктері"
    },
    utilities: {
      coldWater: "Суық су",
      hotWater: "Ыстық су",
      sewage: "Кәріз",
      heating: "Жылыту",
      electricity: "Электр энергиясы",
      gas: "Газ"
    },
    ai: {
      assistant: "ЖИ-көмекшісі",
      description: "Сіздің жеке экологиялық жаттықтырушыңыз",
      hello: "Сәлем",
      analysisDescription: "Мен сіздің тұтыну үлгілеріңізді және ағымдағы ауа райын талдаймын, қоршаған ортаға әсеріңізді азайту бойынша жеке ұсыныстар беремін.",
      generateInsights: "Жаңа түсініктер генерациялау",
      generate: "Генерациялау",
      clearRecommendations: "Ұсыныстарды тазалау", 
      clear: "Тазалау",
      potentialSavings: "Ықтимал үнемдеу",
      aiGenerated: "ЖИ-ұсынысы",
      noInsights: "Әзірше ЖИ түсініктері жоқ",
      addDataFirst: "Басқару панеліне тұтыну деректерін қосыңыз, содан кейін жеке ЖИ ұсыныстарын алу үшін \"Жаңа түсініктер генерациялау\" түймесін басыңыз.",
      priority: "басымдық"
    },
    about: {
      title: "Econest жобасы туралы",
      subtitle: "Тұрақты ресурс басқаруындағы көшбасшылар",
      mission: "Біздің миссия",
      missionText: "Адамдар мен қауымдастықтарды қоршаған ортаға әсерін азайту үшін деректер негізіндегі түсініктер мен ЖИ негізіндегі ұсыныстар арқылы интеллектуалды құралдармен қамтамасыз ету.",
      smartAnalytics: "Ақылды аналитика",
      smartAnalyticsText: "Жетілдірілген ЖИ алгоритмдері жеке түсініктер мен практикалық ұсыныстар беру үшін тұтыну үлгілеріңізді талдайды.",
      community: "Қауымдастық әсері",
      communityText: "Тұрақты болашақ құру үшін бірге жұмыс істеп жатқан экологиялық саналы пайдаланушылардың өсіп келе жатқан қауымдастығына қосылыңыз.",
      globalImpact: "Жаһандық әсер",
      globalImpactText: "Әрбір кіші әрекет экологиялық жауапкершілік пен климаттық әрекеттерге бағытталған үлкен қозғалысқа үлес қосады.",
      howItWorks: "Қалай жұмыс істейді"
    },
    landing: {
      title: "Ресурс тұтынуды оңтайландыру және қоршаған ортаға әсерді азайту үшін ЖИ-платформа",
      subtitle: "Тұрақты болашақ үшін интеллектуалды талдау мен жекелендірілген ұсыныстармен су, электр энергиясы және газ тұтынуын қадағалаңыз.",
      whyChoose: "Неліктен Econest?",
      whyChooseSubtitle: "Ресурс тұтынуы туралы негізделген шешімдер қабылдау үшін ЖИ күшін пайдаланыңыз",
      aiInsightsTitle: "ЖИ негізіндегі талдау",
      aiInsightsDesc: "Тұтыну үлгілеріңіз, ауа-райы деректері мен маусымдық үрдістер негізінде жекелендірілген ұсыныстар алыңыз.",
      realTimeTitle: "Нақты уақыттағы мониторинг",
      realTimeDesc: "Су, электр энергиясы және газ тұтынуын нақты уақытта әдемі көрнекілік пен графиктермен қадағалаңыз.",
      communityTitle: "Қауымдастық рейтингтері",
      communityDesc: "Өңіріңізбен достық тұрақтылық сайыстарында бәсекелесіп, қоршаған ортаға әсеріңізді көріңіз.",
      predictionsTitle: "Ақылды болжамдар",
      predictionsDesc: "Өмір салтыңызға бейімделетін машиналық оқыту алгоритмдерімен болашақ тұтыну мен шығындарды болжаңыз.",
      weatherTitle: "Ауа-райымен интеграция",
      weatherDesc: "Тұтыну үлгілерін түсіну және климатты ескеретін ұсыныстар алу үшін ауа-райы жағдайларын ескеріңіз.",
      multilingualTitle: "Көптілді қолдау",
      multilingualDesc: "Әртүрлі қауымдастықтар мен білім беру мекемелеріне қызмет көрсету үшін ағылшын, орыс және қазақ тілдерінде қолжетімді.",
      ctaTitle: "Тұрақтылық сапарыңызды бастауға дайынсыз ба?",
      ctaSubtitle: "Econest арқылы қоршаған ортаға оң әсер ететін мыңдаған пайдаланушыларға қосылыңыз.",
      ctaButton: "Тегін бастау",
      footerDesc: "Ресурс тұтынуды оңтайландыру және қоршаған ортаға әсерді азайту үшін ЖИ-платформа.",
      featuresTitle: "Мүмкіндіктер",
      support: "Қолдау",
      features: {
        aiInsights: {
          title: "ЖИ негізіндегі талдау",
          description: "Тұтыну үлгілеріңіз, ауа-райы деректері мен маусымдық үрдістер негізінде жекелендірілген ұсыныстар алыңыз."
        },
        realTimeMonitoring: {
          title: "Нақты уақыттағы мониторинг",
          description: "Су, электр энергиясы және газ тұтынуын нақты уақытта әдемі көрнекілік пен графиктермен қадағалаңыз."
        },
        communityLeaderboards: {
          title: "Қауымдастық рейтингтері",
          description: "Өңіріңізбен достық тұрақтылық сайыстарында бәсекелесіп, қоршаған ортаға әсеріңізді көріңіз."
        },
        smartPredictions: {
          title: "Ақылды болжамдар",
          description: "Өмір салтыңызға бейімделетін машиналық оқыту алгоритмдерімен болашақ тұтыну мен шығындарды болжаңыз."
        },
        weatherIntegration: {
          title: "Ауа-райымен интеграция",
          description: "Тұтыну үлгілерін түсіну және климатты ескеретін ұсыныстар алу үшін ауа-райы жағдайларын ескеріңіз."
        },
        multilingualSupport: {
          title: "Көптілді қолдау",
          description: "Әртүрлі қауымдастықтар мен білім беру мекемелеріне қызмет көрсету үшін ағылшын, орыс және қазақ тілдерінде қолжетімді."
        }
      },
      cta: {
        title: "Тұрақтылық сапарыңызды бастауға дайынсыз ба?",
        subtitle: "Econest арқылы қоршаған ортаға оң әсер ететін мыңдаған пайдаланушыларға қосылыңыз.",
        buttonText: "Тегін бастау"
      },
      footer: {
        description: "Ресурс тұтынуды оңтайландыру және қоршаған ортаға әсерді азайту үшін ЖИ-платформа.",
        features: "Мүмкіндіктер",
        support: "Қолдау",
        featuresList: {
          aiAnalytics: "ЖИ-талдау",
          resourceTracking: "Ресурстарды қадағалау", 
          leaderboards: "Рейтингтер",
          weatherIntegration: "Ауа-райымен интеграция"
        },
        supportList: {
          helpCenter: "Көмек орталығы",
          contactUs: "Бізбен хабарласыңыз",
          privacyPolicy: "Құпиялылық саясаты",
          termsOfService: "Қызмет шарттары"
        }
      }
    },
    profile: {
      title: "Профиль",
      personalInfo: "Жеке ақпарат",
      firstName: "Аты",
      lastName: "Тегі",
      email: "Email",
      role: "Рөлі",
      language: "Тіл",
      region: "Өңір",
      update: "Жаңарту",
      updating: "Жаңартылуда...",
      updated: "Профиль жаңартылды",
      updateFailed: "Профильді жаңарту мүмкін болмады",
      supportContact: "Қолдау және байланыс",
      emailSupport: "Email қолдауы",
      officePhone: "Офис телефоны",
      deleteAccount: "Аккаунтты жою",
      dangerZone: "Қауіпті аумақ",
      responseTime: "Біз 24 сағат ішінде жауап береміз",
      officeHours: "Тек жұмыс уақытында",
      deleteConfirmTitle: "Сіз толық сенімдісіз бе?",
      deleteConfirmDesc: "Бұл әрекетті қайтаруға болмайды. Бұл сіздің аккаунтыңызды түбегейлі жояды және біздің серверлерімізден барлық деректеріңізді аластайды:",
      deleteDataList1: "Барлық тұтыну көрсеткіштері мен тарихы",
      deleteDataList2: "ЖИ-ұсыныстар мен талдаулар",
      deleteDataList3: "Рейтинг орындары мен жетістіктер",
      deleteDataList4: "Аккаунт параметрлері мен теңшелімдер",
      cancel: "Болдырмау",
      confirmDelete: "Иә, менің аккаунтымды жою",
      currentPassword: "Қазіргі құпия сөз",
      newPassword: "Жаңа құпия сөз",
      enterCurrentPassword: "Қазіргі құпия сөзді енгізіңіз",
      enterNewPassword: "Жаңа құпия сөзді енгізіңіз",
      confirmNewPassword: "Жаңа құпия сөзді растаңыз",
      deleteAccountDescription: "Аккаунтыңызды үдасыз жөне барлық байланысты деректерді жою. Осы әрекетті кері қайтаруға болмайды."
    },
    auth: {
      login: "Кіру",
      register: "Тіркелу",
      email: "Email",
      password: "Құпия сөз",
      firstName: "Аты",
      lastName: "Тегі",
      region: "Өңір",
      loginButton: "Кіру",
      registerButton: "Аккаунт жасау",
      switchToRegister: "Аккаунт жоқ па? Тіркеліңіз",
      switchToLogin: "Аккаунт бар ма? Кіру",
      loginError: "Қате деректер",
      registerError: "Тіркелу қатесі",
      emailRequired: "Email міндетті",
      passwordRequired: "Құпия сөз міндетті",
      firstNameRequired: "Аты міндетті",
      lastNameRequired: "Тегі міндетті",
      regionRequired: "Өңір міндетті",
      role: "Рөл",
      selectRole: "Өзіңіздің рөліңізді таңдаңыз",
      student: "Студент",
      adult: "Ересек",
      company: "Компания",
      confirmPassword: "Құпия сөзді растаңыз",
      signUp: "Тіркелу",
      subtitle: "Ресурс тұтынуды оңтайландыруға арналған ЖИ платформасы",
      error: "Қате",
      fillAllFields: "Барлық өрістерді толтырыңыз",
      dateRequired: "Күн міндетті",
      addReadingDescription: "Қадағалау үшін айлық тұтыну деректерін қосыңыз",
      dataSourcesTitle: "Деректер көздері",
      dataSourcesDescription: "Тұтыну туралы деректерді қайдан табуға болады",
      cancel: "Болдырмау",
      save: "Сақтау",
      "Current month": "Ағымдағы ай",
      "Full year": "Толық жыл",
      emissions: "шығарындылар",
      "Trees needed to offset your": "Сіздің өтемақы үшін ағаштар қажет",
      analyzing: "Талдау...",
      clearing: "Тазаланып жатыр...",
      generatingInsights: "ЖИ талдауы жасалып жатыр...",
      loading: "Жүктелуде...",
      clickToAnalyze: "Қоршаған ортаға әсерді талдау үшін \"ЖИ талдауын алу\" түймесін басыңыз",
      noInsightsYet: "ЖИ талдауы әзірше қолжетімді емес"
    },
    footprint: {
      title: "Көміртекті із талдауы",
      subtitle: "Қоршаған ортаға әсеріңізді бақылаушы",
      description: "Қоршаған ортаға әсерді азайту үшін ЖИ-инсайттар мен ұсыныстармен көміртекті ізіңізді бақылаңыз және талдаңыз.",
      currentFootprint: "Ағымдағы CO₂ көміртекті ізі",
      thisMonth: "Осы айда",
      kgCO2: "кг CO₂",
      recommendations: "ЖИ ұсыныстары",
      getRecommendations: "Жеке кеңестер алу",
      clearCache: "Талдауды жаңарту",
      clearingCache: "Жаңартылуда...",
      cacheCleared: "Талдау жаңартылды!",
      loadingRecommendations: "Жеке ұсыныстар алынуда...",
      noRecommendations: "ЖИ ұсыныстарын алу үшін тұтыну деректерін қосыңыз",
      impactBreakdown: "Қоршаған ортаға әсер талдауы",
      impactDescription: "Сіздің айлық тұтынуыңыз экологиялық салдарға әкеледі:",
      co2Equivalent: "🌍 Жалпы CO₂ әсері",
      treesNeeded: "🌳 Өтемақы үшін ағаштар қажет",
      deforestationEquivalent: "🌲 Күн сайын жойылатын орман аумағы",
      animalHabitatLoss: "🦎 Жоғалған жануарлар мекені",
      glacierMelting: "🧊 Ерітілген мұзтөбе мұзы",
      oceanAcidification: "🌊 Мұхит қышқылдануына үлес",
      offsetSuggestions: "💡 Тепе-теңдікті қалай қалпына келтіру:",
      plantTrees: "Қауымдастығыңызда жергілікті ағаштар отырғызыңыз",
      useRenewableEnergy: "Жаңартылатын энергия көздеріне ауысыңыз",
      improveInsulation: "Үй оқшаулауын жақсартыңыз",
      reduceWaste: "Қалдықтарды азайтып, қайта өңдеуді арттырыңыз",
      walkMore: "Қоғамдық көлікті пайдаланыңыз немесе жаяу жүріңіз/велосипедпен жүріңіз",
      eatLocal: "Жергілікті және маусымдық тағамдарды таңдаңыз",
      currentMonthEmissions: "Ағымдағы ай шығарындылары",
      treesNeededOffset: "Сіздің өтемақы үшін ағаштар қажет",
      monthly: "айлық",
      yearly: "жылдық",
      monthlyCO2Emissions: "айлық CO₂ шығарындылары",
      footprintAssistant: "Экоіз көмекшісі",
      aiInsightsDesc: "Қоршаған ортаға әсеріңіздің ЖИ-талдауы",
      footprintBotHello: "Сәлем",
      footprintBotDescription: "Мен сіздің тұтыну схемаларыңыз бен ағымдағы ауа райын талдап, қоршаған ортаға әсеріңізді азайту бойынша жекелендірілген ұсыныстар беремін.",
      potentialImpact: "Ықтимал әсер",
      getAIInsights: "ЖИ талдауын алу",
      clear: "Тазалау",
      loading: "Жүктелуде",
      noInsightsYet: "ЖИ талдауы әзірше қолжетімді емес",
      clickToAnalyze: "Қоршаған ортаға әсерді талдау үшін \"ЖИ талдауын алу\" түймесін басыңыз",
      generatingInsights: "ЖИ талдауы жасалып жатыр",
      clearing: "Тазаланып жатыр"
    },
    leaderboard: {
      title: "Аймақтық CO₂ рейтингі",
      subtitle: "Өңіріңіздің экологиялық тиімділігін салыстырыңыз",
      description: "Өңіріңіз Қазақстанның басқа өңірлерімен салыстырғанда көміртекті ізді азайтуда қалай жұмыс істейтінін көріңіз.",
      selectMonth: "Айды таңдаңыз",
      regions: "Өңірлер статистикасы",
      avgCO2: "Орташа CO₂",
      totalUsers: "Пайдаланушылар",
      month: "Ай",
      data: "Деректер"
    },
    analytics: {
      title: "Аналитика тақтасы",
      subtitle: "Тұтыну үлгілеріңізге терең инсайттар",
      description: "ЖИ болжауымен ресурс тұтынуы үшін кеңейтілген аналитика және болжамдар.",
      consumptionTrends: "Тұтыну трендтері",
      predictions: "ЖИ болжамдары",
      insights: "Негізгі инсайттар"
    },
    regions: {
      almaty: "Алматы",
      astana: "Астана",
      shymkent: "Шымкент",
      aktobe: "Ақтөбе", 
      taraz: "Тараз",
      pavlodar: "Павлодар",
      "ust-kamenogorsk": "Өскемен",
      semey: "Семей"
    },
    weather: {
      selectRegion: "Жеке ауа-райы инсайттарын алу үшін өңіріңізді таңдаңыз",
      chooseRegion: "Өңірді таңдаңыз",
      changeRegion: "Өзгерту"
    },
    contact: {
      title: "Бізбен хабарласыңыз",
      subtitle: "Біз кез келген сұрақтар немесе пікірлер бойынша көмектесуге дайынбыз",
      howToHelp: "Жобаға қалай көмектесу керек",
      reportBug: "Қате туралы хабарлау",
      helpImprove: "Жақсартуға көмектесіңіз",
      suggestFeature: "Идея ұсыну",
      shareIdeas: "Идеяларыңызбен бөлісіңіз",
      feedback: "Кері байланыс",
      shareExperience: "Тәжірибеңізбен бөлісіңіз"
    },
    quickActions: {
      addReading: "Көрсеткішті қосу",
      viewInsights: "Түсініктемелерді көру",
      checkFootprint: "CO₂ ізін тексеру",
      compareRegions: "Аймақтарды салыстыру",
      regionalStats: "Аймақтық CO₂ статистикасы",
      clickToViewLeaderboard: "Толық рейтингті көру үшін басыңыз",
      rank: "Орын",
      region: "Аймақ",
      totalCO2: "Жалпы CO₂ (кг)",
      users: "Пайдаланушылар",
      delete: "Жою",
      detailedView: "Толық көрініс",
      monthlyConsumptionBreakdown: "Айлық тұтыну бөлінісі",
      consumptionDetails: "Тұтыну толық мәліметтері"
    },
    charts: {
      consumption: "Тұтыну",
      emissions: "Шығарындылар",
      coldWater: "Суық су",
      hotWater: "Ыстық су",
      sewage: "Кәріз",
      electricity: "Электр",
      gas: "Газ",
      heating: "Жылыту",
      water: "Су",
      month: "Ай",
      year: "Жыл",
      kgCO2: "кг CO₂",
      noData: "Деректер қолжетімді емес"
    }
  }
};

export const getLanguageFromCode = (code: string): Language => {
  return languages.find(lang => lang.code === code) || languages[0];
};
