import { useCallback } from 'react';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Translations = {
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
  header: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    leaderboard: "Leaderboard",
    about: "About",
  },
  dashboard: {
    welcome: "Welcome back",
    overview: "Here's your environmental impact overview for this month",
    waterUsage: "Water Usage",
    electricity: "Electricity",
    water: "Water",
    gas: "Gas",
    gasUsage: "Gas Usage",
    co2Footprint: "CO₂ Footprint",
    thisMonth: "This month",
    consumptionTrends: "Consumption Trends",
    aiInsights: "AI Insights",
    weatherImpact: "Weather Impact",
    quickActions: "Quick Actions",
    addReading: "Add Reading",
    viewReport: "View Report",
    settings: "Settings",
    regionalLeaderboard: "Regional Leaderboard",
    schoolRankings: "School Rankings",
    participants: "participants",
    students: "students",
    co2Reduction: "CO₂ reduction",
    energySaved: "Energy saved",
    noDataAvailable: "No consumption data available",
    addReadingsToSee: "Add your monthly readings to see consumption trends",
    unauthorized: "Unauthorized",
    loggedOut: "You are logged out. Logging in again...",
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
    readingDate: "Reading Date"
  },
  analytics: {
    period: "Period",
    chartType: "Chart type",
  },
  addReadingTitle: "Add Monthly Readings",
  addReadingDescription: "Enter your resource consumption data for the selected month",
  selectMonth: "Select month",
  selectYear: "Select year",
  selectServiceType: "Select service type",
  readings: "Readings",
  enterReadings: "Enter readings",
  readingDate: "Reading date",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving...",
  successTitle: "Success",
  successDescription: "Monthly readings saved successfully",
  errorTitle: "Error",
  serviceTypeRequired: "Service type required",
  amountRequired: "Amount required",
  unitRequired: "Unit required",
  dateRequired: "Date required",
  electricityRequired: "Electricity reading required",
  waterRequired: "Water reading required", 
  gasRequired: "Gas reading required",
  dataSourcesTitle: "📌 Where to get data:",
  dataSourcesDescription: "— From your utility bill\n— Kaspi / Energo mobile apps\n— Home meter readings",
  actions: {
    tryNow: "Try now",
    login: "Login",
    logout: "Logout", 
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
  },
  auth: {
    login: "Login",
    register: "Register", 
    welcome: "Welcome to Econest!",
    loginSuccess: "Login successful",
    registerSuccess: "Registration successful",
    loginError: "Login error",
    registerError: "Registration error", 
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    firstName: "First name",
    lastName: "Last name",
    role: "Role",
    selectRole: "Select your role",
    student: "Student",
    adult: "Adult", 
    company: "Company",
    passwordMismatch: "Passwords do not match",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    signIn: "Sign in",
    signUp: "Sign up",
    loginDescription: "Enter your credentials to access your account",
    registerDescription: "Create a new account to start tracking your environmental impact"
  },
  ai: {
    assistant: "AI Assistant",
    description: "Get personalized recommendations and insights for your environmental footprint",
    welcome: "Hello! I'm your AI environmental assistant. I analyze your consumption patterns and provide personalized recommendations to help you reduce your environmental impact.",
    howCanIHelp: "How can I help you optimize your resource consumption today?",
    aiAssistant: "AI Assistant",
    timestamp: "Just now"
  },
  common: {
    week: "Week",
    month: "Month",
    year: "Year",
  },
  units: {
    cubicMeters: "m³",
    kilowattHours: "kWh",
    tonnes: "tonnes"
  },
  about: {
    title: "About Econest",
    subtitle: "Empowering communities to reduce their environmental impact through intelligent resource tracking and AI-powered insights",
    mission: "Our Mission",
    missionText: "Econest is dedicated to creating a sustainable future by empowering individuals, families, and educational institutions to track, analyze, and optimize their resource consumption. Through cutting-edge AI technology and engaging user experiences, we make environmental responsibility accessible and actionable for everyone.",
    smartAnalytics: "Smart Analytics",
    smartAnalyticsText: "Advanced AI algorithms analyze your consumption patterns to provide personalized recommendations and predict future usage trends.",
    community: "Community Driven",
    communityText: "Join a global community of environmentally conscious users working together to reduce their carbon footprint and share best practices.",
    globalImpact: "Global Impact",
    globalImpactText: "Track your environmental impact with real-time CO₂ calculations and see how your actions contribute to global sustainability goals.",
    howItWorks: "How It Works",
    step1: "Track",
    step1Text: "Input your monthly consumption data for water, electricity, and gas usage from your utility bills or smart meters.",
    step2: "Analyze", 
    step2Text: "Our AI algorithms process your data to identify patterns, predict future consumption, and calculate your environmental footprint.",
    step3: "Optimize",
    step3Text: "Receive personalized recommendations and insights to reduce your resource consumption and minimize your environmental impact.",
    step4: "Compare",
    step4Text: "See how you rank against other users in your region and participate in friendly competition to drive positive change.",
    whyChoose: "Why Choose Econest?",
    accuracy: "Accurate Insights",
    accuracyText: "Advanced machine learning provides precise consumption predictions and actionable environmental recommendations.",
    privacy: "Privacy First",
    privacyText: "Your data is securely encrypted and never shared without your explicit consent. Full transparency in how we use your information.",
    education: "Educational Impact",
    educationText: "Special features for schools and educational institutions to teach sustainability and engage students in environmental stewardship.",
    technology: "Cutting-edge Technology",
    technologyText: "Built with modern web technologies, AI integration, and responsive design for optimal performance across all devices.",
    team: "Our Team",
    teamText: "Econest is developed by a passionate team of environmental scientists, software engineers, and education specialists committed to creating positive environmental change through technology.",
    contact: "Get in Touch",
    contactText: "Have questions or suggestions? We'd love to hear from you and learn how we can improve Econest to better serve the community."
  },
  chart: {
    water: "Water (m³)",
    electricity: "Electricity (kWh)",
    gas: "Gas (m³)",
    currentMonth: "Current Month",
    previousMonth: "Previous Month",
    currentWeek: "Current Week",
    previousWeek: "Previous Week",
    noData: "No data available",
    addReadings: "Add your",
    meterReadings: "meter readings",
    forViewing: "to view",
    dataUnavailable: "consumption trends"
  },
  landing: {
    title: "AI-Powered Resource Optimization Platform for Environmental Impact Reduction",
    subtitle: "Track water, electricity, and gas consumption with intelligent insights and personalized recommendations for a sustainable future.",
    whyChoose: "Why Choose Econest?",
    whyChooseSubtitle: "Harness the power of AI to make informed decisions about resource consumption",
    aiInsightsTitle: "AI-Powered Insights",
    aiInsightsDesc: "Get personalized recommendations based on your consumption patterns, weather data, and seasonal trends.",
    realTimeTitle: "Real-Time Monitoring",
    realTimeDesc: "Track your water, electricity, and gas usage in real-time with beautiful visualizations and charts.",
    communityTitle: "Community Leaderboards",
    communityDesc: "Compete with your region and school in friendly sustainability challenges and see your environmental impact.",
    predictionsTitle: "Smart Predictions",
    predictionsDesc: "AI forecasts help you plan ahead and avoid unexpected utility costs.",
    weatherTitle: "Weather Integration",
    weatherDesc: "Get context-aware recommendations based on local weather conditions.",
    multilingualTitle: "Multilingual Support",
    multilingualDesc: "Available in English, Russian, and Kazakh to serve diverse communities and educational institutions.",
    ctaTitle: "Ready to Start Your Sustainability Journey?",
    ctaSubtitle: "Join thousands of users reducing their environmental impact",
    ctaButton: "Get Started for Free",
    footerDesc: "Building a sustainable future through technology",
    features: "Features",
    support: "Support"
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
};

export function useI18n() {
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, []);

  return {
    language: 'en',
    changeLanguage: () => {}, // No-op since we only have English
    t
  };
}