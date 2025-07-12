import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Send,
  Bug,
  Heart,
  Users,
  Globe
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function Contact() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const sendMessage = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: language === 'ru' ? "Сообщение отправлено" : "Message sent successfully!",
        description: language === 'ru' ? "Мы свяжемся с вами в ближайшее время" : "We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: language === 'ru' ? "Ошибка" : "Error",
        description: language === 'ru' ? "Попробуйте еще раз" : "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Error",
        description: language === 'ru' 
          ? "Имя, email, тема и сообщение обязательны для заполнения"
          : "Name, email, subject and message are required",
        variant: "destructive",
      });
      return;
    }
    sendMessage.mutate(formData);
  };

  const isRussian = language === 'ru';

  const contactData = {
    title: isRussian ? "Свяжитесь с нами" : "Contact Us",
    subtitle: isRussian ? "Мы готовы помочь вам с любыми вопросами или отзывами" : "We're here to help you with any questions or feedback",
    formTitle: isRussian ? "Отправить нам сообщение" : "Send us a message",
    nameLabel: isRussian ? "Полное имя" : "Full Name",
    emailLabel: isRussian ? "Email адрес" : "Email Address",
    subjectLabel: isRussian ? "Тема" : "Subject",
    messageLabel: isRussian ? "Ваше сообщение" : "Your Message",
    sendButton: isRussian ? "Отправить сообщение" : "Send Message",
    contactMethods: {
      title: isRussian ? "Способы связи" : "Contact Methods",
      email: {
        title: "Email",
        description: isRussian ? "Напишите нам на почту" : "Send us an email",
        contact: "support@econest.ru",
        response: isRussian ? "Отвечаем в течение 24 часов" : "We respond within 24 hours"
      },
      chat: {
        title: isRussian ? "Чат поддержки" : "Support Chat",
        description: isRussian ? "Онлайн консультация" : "Online consultation",
        contact: isRussian ? "В мобильном приложении" : "In mobile app",
        response: isRussian ? "Пн-Пт 9:00-18:00 МСК" : "Mon-Fri 9:00-18:00 MSK"
      },
      phone: {
        title: isRussian ? "Телефон" : "Phone",
        description: isRussian ? "Звоните бесплатно" : "Call us for free",
        contact: "+7 (800) 555-35-35",
        response: isRussian ? "Пн-Пт 9:00-18:00 МСК" : "Mon-Fri 9:00-18:00 MSK"
      },
      office: {
        title: isRussian ? "Офис" : "Office",
        description: isRussian ? "Наш адрес" : "Our address",
        contact: isRussian ? "Москва, ул. Экологическая, 15" : "Moscow, Ecological St., 15",
        response: isRussian ? "По предварительной записи" : "By appointment only"
      }
    },
    social: {
      title: isRussian ? "Следите за нами" : "Follow Us",
      github: isRussian ? "Открытый код проекта" : "Open source project",
      twitter: isRussian ? "Новости и обновления" : "News and updates",
      website: isRussian ? "Официальный сайт" : "Official website"
    },
    opportunities: {
      title: isRussian ? "Присоединяйтесь" : "Get Involved",
      volunteer: {
        title: isRussian ? "Волонтерство" : "Volunteer",
        description: isRussian ? "Помогите развивать проект" : "Help develop the project",
        details: isRussian ? "Переводы, тестирование, создание контента" : "Translations, testing, content creation"
      },
      partnership: {
        title: isRussian ? "Партнерство" : "Partnership",
        description: isRussian ? "Сотрудничество с организациями" : "Collaborate with organizations",
        details: isRussian ? "Школы, НКО, экологические организации" : "Schools, NGOs, environmental organizations"
      },
      bugReport: {
        title: isRussian ? "Сообщить об ошибке" : "Report Bug",
        description: isRussian ? "Помогите нам улучшиться" : "Help us improve",
        details: isRussian ? "Нашли проблему? Сообщите нам!" : "Found an issue? Let us know!"
      }
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      ...contactData.contactMethods.email
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      ...contactData.contactMethods.chat
    },
    {
      icon: <Phone className="h-6 w-6" />,
      ...contactData.contactMethods.phone
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      ...contactData.contactMethods.office
    }
  ];

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      name: "GitHub",
      url: "https://github.com/econest",
      description: contactData.social.github
    },
    {
      icon: <Twitter className="h-5 w-5" />,
      name: "Twitter",
      url: "https://twitter.com/econest_ai",
      description: contactData.social.twitter
    },
    {
      icon: <Globe className="h-5 w-5" />,
      name: isRussian ? "Сайт" : "Website",
      url: "https://econest.ru",
      description: contactData.social.website
    }
  ];

  const opportunities = [
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      ...contactData.opportunities.volunteer
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      ...contactData.opportunities.partnership
    },
    {
      icon: <Bug className="h-6 w-6 text-orange-500" />,
      ...contactData.opportunities.bugReport
    }
  ];

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
          {contactData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
          {contactData.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Contact Form */}
        <Card className={`group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`} style={{ transitionDelay: '300ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Send className="h-5 w-5 text-white" />
              </div>
              {contactData.formTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    {contactData.nameLabel}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={contactData.nameLabel}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    {contactData.emailLabel}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder={contactData.emailLabel}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {contactData.subjectLabel}
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder={contactData.subjectLabel}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {contactData.messageLabel}
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder={contactData.messageLabel}
                  rows={6}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={sendMessage.isPending}
              >
                {sendMessage.isPending 
                  ? (isRussian ? "Отправка..." : "Sending...") 
                  : contactData.sendButton
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <div className="space-y-6">
          <Card className={`group hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`} style={{ transitionDelay: '450ms' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{contactData.contactMethods.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="text-primary">{method.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{method.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{method.description}</p>
                    <p className="text-sm font-medium text-primary">{method.contact}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{method.response}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>{contactData.social.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-primary">{link.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{link.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{link.description}</div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Get Involved Section */}
      <Card>
        <CardHeader>
          <CardTitle>{contactData.opportunities.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="text-center p-6 border rounded-lg">
                <div className="flex justify-center mb-4">{opportunity.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{opportunity.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{opportunity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opportunity.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}