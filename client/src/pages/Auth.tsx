import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, LogIn, Mail, Lock, User, Building2, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useI18n();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    region: ""
  });

  // Redirect if already logged in
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (data: typeof loginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcome'),
      });
      // Для мобильных устройств требуется больше времени на синхронизацию cookie
      setTimeout(() => {
        // Принудительная перезагрузка страницы для обновления сессии
        window.location.replace("/dashboard");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: t('auth.loginError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof registerData) => {
      if (data.password !== data.confirmPassword) {
        throw new Error(t('auth.passwordMismatch'));
      }
      const response = await apiRequest("POST", "/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        region: data.region
      });
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('auth.registerSuccess'),
        description: t('auth.welcome'),
      });
      // Для мобильных устройств требуется больше времени на синхронизацию cookie
      setTimeout(() => {
        // Принудительная перезагрузка страницы для обновления сессии
        window.location.replace("/dashboard");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: t('auth.registerError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.firstName || !registerData.lastName || !registerData.email || 
        !registerData.password || !registerData.confirmPassword || !registerData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerData);
  };

  return (
    <div className="auth-page min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.welcome')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered platform for resource consumption optimization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Auth forms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t('auth.login')} & {t('auth.register')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                  <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      {loginMutation.isPending ? `${t('auth.signIn')}...` : t('auth.signIn')}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder={t('auth.firstName')}
                            className="pl-10"
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="lastName"
                            placeholder={t('auth.lastName')}
                            className="pl-10"
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('auth.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">{t('auth.role')}</Label>
                      <Select 
                        value={registerData.role} 
                        onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('auth.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {t('auth.student')}
                            </div>
                          </SelectItem>
                          <SelectItem value="adult">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {t('auth.adult')}
                            </div>
                          </SelectItem>
                          <SelectItem value="company">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {t('auth.company')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="region">Region (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Select 
                          value={registerData.region} 
                          onValueChange={(value) => setRegisterData({ ...registerData, region: value })}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Almaty">Almaty</SelectItem>
                            <SelectItem value="Nur-Sultan">Nur-Sultan</SelectItem>
                            <SelectItem value="Shymkent">Shymkent</SelectItem>
                            <SelectItem value="Aktobe">Aktobe</SelectItem>
                            <SelectItem value="Taraz">Taraz</SelectItem>
                            <SelectItem value="Pavlodar">Pavlodar</SelectItem>
                            <SelectItem value="Ust-Kamenogorsk">Ust-Kamenogorsk</SelectItem>
                            <SelectItem value="Semey">Semey</SelectItem>
                            <SelectItem value="Kostanay">Kostanay</SelectItem>
                            <SelectItem value="Kyzylorda">Kyzylorda</SelectItem>
                            <SelectItem value="Atyrau">Atyrau</SelectItem>
                            <SelectItem value="Aktau">Aktau</SelectItem>
                            <SelectItem value="Petropavlovsk">Petropavlovsk</SelectItem>
                            <SelectItem value="Turkistan">Turkistan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ⚠️ Note: If no region is selected, your data will not appear in the regional leaderboard
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {registerMutation.isPending ? `${t('auth.signUp')}...` : t('auth.signUp')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right side - Hero section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                  Why Econest?
                </h3>
                <ul className="space-y-3 text-green-700 dark:text-green-300">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>AI-powered resource consumption analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized savings recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Carbon footprint assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>School and regional rankings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Roles</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Student</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">School rankings and class competitions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Adult</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Family consumption and personal goals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Company</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Corporate resource optimization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}