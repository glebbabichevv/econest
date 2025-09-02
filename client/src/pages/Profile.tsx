import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  School, 
  Users, 
  Globe, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Phone,
  Palette
} from "lucide-react";


export default function Profile() {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage, availableLanguages } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'adult',
    language: language,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    },
    onError: (error) => {
      toast({
        title: "Password Change Failed",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => fetch('/api/profile/delete', {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    if (formData.firstName.trim() === '' || formData.email.trim() === '') {
      toast({
        title: "Validation Error",
        description: "First name and email are required.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      language: formData.language
    }, {
      onSuccess: () => {
        // Invalidate user data to refresh throughout the app
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      }
    });
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All password fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage);
    setFormData(prev => ({ ...prev, language: newLanguage }));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">{t('auth.student')}</Badge>;
      case 'adult':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('auth.adult')}</Badge>;
      case 'company':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">{t('auth.company')}</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 px-4 md:px-0">
        {/* Header - Mobile Optimized */}
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {language === 'ru' ? 'Настройки профиля' : language === 'kk' ? 'Профиль баптаулары' : 'Profile Settings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mt-2">
            {language === 'ru' ? 'Управляйте настройками аккаунта и предпочтениями' : language === 'kk' ? 'Тіркелгі баптауларын және қалауларын басқарыңыз' : 'Manage your account settings and preferences'}
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === 'ru' ? 'Личная информация' : language === 'kk' ? 'Жеке ақпарат' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">{language === 'ru' ? 'Имя' : language === 'kk' ? 'Аты' : 'First Name'}</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{language === 'ru' ? 'Фамилия' : language === 'kk' ? 'Тегі' : 'Last Name'}</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{language === 'ru' ? 'Адрес электронной почты' : language === 'kk' ? 'Электронды пошта мекенжайы' : 'Email Address'}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">{language === 'ru' ? 'Тип аккаунта' : language === 'kk' ? 'Тіркелгі түрі' : 'Account Type'}</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))} disabled={!isEditing}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">{t('auth.adult')}</SelectItem>
                  <SelectItem value="student">{t('auth.student')}</SelectItem>
                  <SelectItem value="company">{t('auth.company')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end">
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user?.first_name || '',
                          lastName: user?.last_name || '',
                          email: user?.email || '',
                          role: user?.role || 'adult',
                          language: language,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    {language === 'ru' ? 'Редактировать профиль' : language === 'kk' ? 'Профильді өңдеу' : 'Edit Profile'}
                  </Button>
                )}
              </div>
            </div>


          </CardContent>
        </Card>

        {/* Appearance & Language Settings - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {language === 'ru' ? 'Язык и регион' : language === 'kk' ? 'Тіл және аймақ' : 'Language & Region'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{language === 'ru' ? 'Язык интерфейса' : language === 'kk' ? 'Интерфейс тілі' : 'Interface Language'}</Label>
                  <Select value={formData.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {language === 'ru' ? 'Тема оформления' : language === 'kk' ? 'Сурет темасы' : 'Appearance Theme'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{language === 'ru' ? 'Цветовая схема' : language === 'kk' ? 'Түс схемасы' : 'Color Scheme'}</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        {language === 'ru' ? '☀️ Солнечная' : language === 'kk' ? '☀️ Күнді' : '☀️ Light'}
                      </SelectItem>
                      <SelectItem value="dark">
                        {language === 'ru' ? '🌙 Темная' : language === 'kk' ? '🌙 Қараңғы' : '🌙 Dark'}
                      </SelectItem>
                      <SelectItem value="ocean">
                        {language === 'ru' ? '🌊 Океан' : language === 'kk' ? '🌊 Мұхит' : '🌊 Ocean'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'light' && (language === 'ru' ? 'Чистый и яркий интерфейс' : language === 'kk' ? 'Таза және жарық интерфейс' : 'Clean and bright interface')}
                  {theme === 'dark' && (language === 'ru' ? 'Приятно для глаз' : language === 'kk' ? 'Көзге жағымды' : 'Easy on your eyes')}
                  {theme === 'ocean' && (language === 'ru' ? 'Прохладная океаническая тема' : language === 'kk' ? 'Мұхиттың салқын темасы' : 'Cool ocean blue theme')}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === 'ru' ? 'Настройки безопасности' : language === 'kk' ? 'Қауіпсіздік параметрлері' : 'Security Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{language === 'ru' ? 'Текущий пароль' : language === 'kk' ? 'Қазіргі күйтіңіз' : 'Current Password'}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder={t('profile.enterCurrentPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{language === 'ru' ? 'Новый пароль' : language === 'kk' ? 'Жаңа күйтіңіз' : 'New Password'}</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder={t('profile.enterNewPassword')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{language === 'ru' ? 'Подтвердить пароль' : language === 'kk' ? 'Күйтіңізді растаңыз' : 'Confirm Password'}</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder={t('profile.confirmNewPassword')}
                />
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              {language === 'ru' ? 'Изменить пароль' : language === 'kk' ? 'Күйтіңізді өзгерту' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('profile.supportContact')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('profile.emailSupport')}</h4>
                <a href="mailto:econest_future@gmail.com" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  econest_future@gmail.com
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('profile.responseTime')}
                </p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('profile.officePhone')}</h4>
                <a href="tel:+77073287707" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  +7 707 328 77 07
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('profile.officeHours')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              {t('profile.dangerZone')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{t('profile.deleteAccount')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('profile.deleteAccountDescription')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    {t('profile.deleteAccount')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('profile.deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('profile.deleteConfirmDesc')}
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{t('profile.deleteDataList1')}</li>
                        <li>{t('profile.deleteDataList2')}</li>
                        <li>{t('profile.deleteDataList3')}</li>
                        <li>{t('profile.deleteDataList4')}</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      disabled={deleteAccountMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t('profile.confirmDelete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}