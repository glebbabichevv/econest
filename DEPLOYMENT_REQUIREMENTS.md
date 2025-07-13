# Econest - Полная инструкция по деплою

## Шаг 1: Подготовка файлов проекта

### 1.1 Загрузка проекта
- Скачайте все файлы проекта из Replit
- Создайте папку на вашем компьютере (например: `econest-project`)
- Поместите все файлы в эту папку

### 1.2 Структура проекта должна быть такой:
```
econest-project/
├── client/           # Frontend React приложение
├── server/           # Backend Express сервер
├── shared/           # Общие типы и схемы
├── package.json      # Зависимости проекта
├── vite.config.ts    # Конфигурация Vite
├── drizzle.config.ts # Конфигурация базы данных
├── tsconfig.json     # Настройки TypeScript
└── DEPLOYMENT_REQUIREMENTS.md  # Эта инструкция
```

## Шаг 2: Выбор платформы для деплоя

### 2.1 Рекомендуемые платформы:
- **Railway** - простой и быстрый деплой
- **Vercel** - отличная производительность
- **Heroku** - классический вариант
- **DigitalOcean App Platform** - стабильный хостинг

### 2.2 Выбор базы данных:
- **Neon** - бесплатная PostgreSQL (рекомендуется)
- **Supabase** - PostgreSQL с дополнительными функциями
- **Railway PostgreSQL** - интегрируется с Railway
- **Heroku PostgreSQL** - если используете Heroku

## Шаг 3: Создание базы данных

### 3.1 Создание PostgreSQL базы (на примере Neon):
1. Идите на https://neon.tech
2. Создайте аккаунт
3. Нажмите "Create Project"
4. Выберите имя проекта: `econest-production`
5. Выберите регион ближайший к вам
6. Нажмите "Create Project"

### 3.2 Получение строки подключения:
1. В панели Neon найдите раздел "Connection Details"
2. Скопируйте строку подключения, она выглядит так:
```
postgresql://username:password@host.neon.tech:5432/main
```

## Шаг 4: Настройка переменных окружения

### 4.1 Создайте файл `.env` в корне проекта:
```env
DATABASE_URL=postgresql://ваша_строка_подключения_из_шага_3.2
SESSION_SECRET=ваш_случайный_секретный_ключ_минимум_32_символа
NODE_ENV=production
```

### 4.2 Генерация SESSION_SECRET:
Используйте онлайн генератор или команду:
```bash
openssl rand -base64 32
```

## Шаг 5: Деплой на Render (исправление ошибки 127)

### 5.1 Решение проблемы "vite: not found":
Эта ошибка означает что Render не может найти команды сборки в dev-dependencies. Решение:

### 5.2 Настройки в Render Dashboard:

**Для облегченного деплоя (рекомендуется):**
1. **Build Command**: `npm install`
2. **Start Command**: `npx tsx server/index.ts`
3. **Node Version**: 18 или выше
4. **Root Directory**: оставьте пустым
5. **Environment**: Node

**Для полной сборки (медленнее):**
1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start`

**ВАЖНО**: Облегченный деплой работает быстрее и надежнее на Render.

### 5.3 Переменные окружения в Render:
В разделе "Environment Variables" добавьте:
```
NODE_ENV = development
DATABASE_URL = postgresql://username:password@host.neon.tech/database?sslmode=require
SESSION_SECRET = ваш_секретный_ключ_32_символа
AUTO_MIGRATE = true
OPENAI_API_KEY = sk-ваш_ключ_chatgpt (опционально)
```

⚠️ **КРИТИЧНО**: DATABASE_URL должен быть ЧИСТЫЙ без лишних символов:
- ✅ Правильно: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
- ❌ Неправильно: `psql 'postgresql://...'` или с кавычками

**🔧 РЕШЕНИЕ ПРОБЛЕМЫ RENDER:**
Если в логах видите `psql%20'` - это означает что DATABASE_URL скопирован неправильно.

**Как получить правильный DATABASE_URL из Neon:**
1. Зайдите в Neon Dashboard
2. Найдите раздел "Connection Details" 
3. Скопируйте ТОЛЬКО строку подключения без команды psql
4. Формат: `postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require`

**РЕШЕНИЕ ПРОБЛЕМЫ DATABASE_URL:**

Проблема в том, что Render получает DATABASE_URL в неправильном формате.

**В Neon Dashboard:**
1. Откройте раздел "Connection Details"
2. Найдите "Connection string" 
3. НЕ копируйте команду "psql 'connection_string'"
4. Скопируйте ТОЛЬКО строку внутри кавычек

**Правильный формат для Render:**
```
postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require
```

**Неправильные форматы (НЕ используйте):**
- `psql 'postgresql://...'`
- `psql%20'postgresql://...'` (URL-encoded)
- С лишними кавычками в начале/конце

**Проверено:** Код автоматически очищает URL, но лучше сразу вставить правильный.

## КРИТИЧЕСКАЯ ПРОБЛЕМА - Таблицы не создаются

**Проблема:** Миграция проходит успешно, но таблицы не создаются в базе.

**Диагностика:**
1. Проверьте статус таблиц: `https://your-app.onrender.com/api/health`
2. Должны быть таблицы: `users`, `consumption_readings`, `predictions`, `recommendations`, `co2_insights`, `regional_stats`, `sessions`

**Если таблиц нет (404 ошибка):**

**РЕШЕНИЕ 1 - Manual Deploy с новой базой:**
1. Создайте новый проект в Neon (обязательно!)
2. Скопируйте новую DATABASE_URL
3. В Render Environment Variables замените DATABASE_URL
4. Нажмите "Manual Deploy"
5. Проверьте: https://your-app.onrender.com/api/health

**РЕШЕНИЕ 2 - Принудительная миграция через API:**
1. POST запрос: https://your-app.onrender.com/api/force-migrate
2. Проверьте: https://your-app.onrender.com/api/health

**Код теперь автоматически:**
- Создает таблицы при старте если их нет
- Обрабатывает ошибки отсутствующих таблиц
- Продолжает работу даже при проблемах с миграцией

## КРИТИЧЕСКИ ВАЖНО для Render:

**Environment Variables:**
```
NODE_ENV=development
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
SESSION_SECRET=your-secret-key-here
AUTO_MIGRATE=true
```

**Build Command:** `npm install` (НЕ `npm run build`!)
**Start Command:** `npx tsx server/index.ts` (НЕ `npm start`!)

**Почему НЕ production:**
- `npm run build` слишком тяжелый для Render (таймауты)
- `NODE_ENV=production` вызывает ошибки сборки
- Development режим работает стабильно и быстро

### 5.4 Альтернативная команда сборки (если проблемы продолжаются):
Если `npm install` не решает проблему, попробуйте:
```
npm ci --include=dev && npm run build
```

### 5.5 Проверка сборки:
Убедитесь что в логах Render вы видите:
```
✓ Building frontend with Vite...
✓ Building backend with ESBuild...
✓ Build completed successfully
```

## Альтернативный вариант: Деплой на Railway

### Railway 5.1 Подготовка к деплою:
1. Создайте аккаунт на https://railway.app
2. Подключите ваш GitHub аккаунт
3. Загрузите проект на GitHub

### Railway 5.2 Создание проекта на Railway:
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите ваш репозиторий с проектом
4. Railway автоматически определит что это Node.js проект

### Railway 5.3 Настройка переменных окружения в Railway:
1. Откройте ваш проект в Railway
2. Перейдите в "Variables"
3. Добавьте переменные:
   - `DATABASE_URL` = ваша строка подключения
   - `SESSION_SECRET` = ваш секретный ключ
   - `NODE_ENV` = production

## Шаг 6: Инициализация базы данных

### 6.1 После успешного деплоя на Render:
1. Перейдите в "Shell" в панели Render
2. Выполните команду инициализации базы данных:
```bash
npm run db:push
```

### 6.1.1 Если нет доступа к Shell в Render:
1. Добавьте переменную `AUTO_MIGRATE=true` в Environment Variables
2. Код автоматически выполнит миграцию при старте

### 6.2 Что происходит при выполнении команды:
Автоматически создаются все необходимые таблицы:
- `users` - пользователи и их данные
- `consumption_readings` - показания счетчиков
- `recommendations` - рекомендации ИИ
- `co2_insights` - анализ углеродного следа
- `regional_stats` - региональная статистика
- `sessions` - пользовательские сессии
- `predictions` - прогнозы потребления

## Шаг 7: Проверка работы

### 7.1 Проверьте что работает:
1. Откройте URL вашего приложения
2. Убедитесь что загружается главная страница
3. Попробуйте зарегистрироваться
4. Войдите в дашборд
5. Добавьте тестовые данные потребления

### 7.2 Если что-то не работает:
1. Проверьте логи приложения
2. Убедитесь что DATABASE_URL правильный
3. Проверьте что команда `npm run db:push` выполнилась успешно

## Шаг 8: Настройка домена (опционально)

### 8.1 Для настройки собственного домена:
1. Купите домен (например: econest.com)
2. В настройках Railway/Vercel добавьте домен
3. Настройте DNS записи согласно инструкции платформы

## Database Requirements

### Required Database: PostgreSQL
Econest requires **only one PostgreSQL database** for full functionality.

### Database Tables (Automatically Created)
The following tables will be automatically created when you run the first migration:

1. **sessions** - User session management
2. **users** - User profiles and authentication
3. **consumption_readings** - Water, electricity, and gas usage data
4. **predictions** - AI-generated consumption forecasts
5. **recommendations** - Personalized AI recommendations
6. **co2_insights** - Carbon footprint analysis
7. **regional_stats** - Regional leaderboard data

### Environment Variables Required
```
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your_session_secret_key
NODE_ENV=production
```

### Optional Environment Variables
```
OPENWEATHER_API_KEY=your_openweather_api_key (for weather integration)
OPENAI_API_KEY=your_openai_api_key (for AI recommendations)
ANTHROPIC_API_KEY=your_anthropic_api_key (alternative AI service)
```

## Database Setup Instructions

### 1. Create PostgreSQL Database
- Create a new PostgreSQL database on your hosting provider
- Note down the connection string (DATABASE_URL)

### 2. Deploy Application
- Set the DATABASE_URL environment variable
- Deploy the application to your hosting platform

### 3. Initialize Database Schema
Run this command after deployment:
```bash
npm run db:push
```

This will create all necessary tables automatically.

## No Additional Databases Needed

Econest is designed as a **single-database application**. You do not need:
- ❌ Redis for caching
- ❌ MongoDB for document storage
- ❌ Separate analytics database
- ❌ Message queue databases
- ❌ Search databases like Elasticsearch

Everything runs on a single PostgreSQL instance for simplicity and cost-effectiveness.

## Hosting Recommendations

### Database Hosting Options
- **Neon** (current development setup) - Serverless PostgreSQL
- **Supabase** - PostgreSQL with additional features
- **Railway** - Simple PostgreSQL hosting
- **DigitalOcean Managed Database** - Traditional managed PostgreSQL
- **AWS RDS** - Enterprise-grade PostgreSQL
- **Heroku PostgreSQL** - Easy integration with Heroku apps

### Application Hosting
The application can be deployed on any Node.js hosting platform:
- Vercel
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Traditional VPS with Node.js

## Migration and Data Management

### Initial Setup
1. Deploy application code
2. Set DATABASE_URL environment variable
3. Run `npm run db:push` to create tables
4. Application is ready to use

### Updates and Schema Changes
- Schema changes are managed through Drizzle ORM
- Run `npm run db:push` to apply new schema changes
- No manual SQL migrations needed

## Security Considerations

### Database Security
- Use strong passwords for database user
- Enable SSL/TLS connections (most managed databases enable this by default)
- Restrict database access to application servers only
- Regular backups (most managed services provide automatic backups)

### Application Security
- Set strong SESSION_SECRET (minimum 32 characters)
- Use HTTPS in production
- Keep dependencies updated
- Environment variables should never be committed to code

## Performance Notes

### Expected Database Usage
- **Light usage**: 1-10 concurrent users - Any basic PostgreSQL plan
- **Medium usage**: 10-100 concurrent users - Standard managed database
- **Heavy usage**: 100+ concurrent users - High-performance managed database with read replicas

### Storage Requirements
- User data: ~1KB per user
- Consumption readings: ~100 bytes per reading
- Recommendations: ~500 bytes per recommendation
- Expected growth: ~1MB per 1000 active users per month

## Deployment Checklist

- [ ] PostgreSQL database created and accessible
- [ ] DATABASE_URL environment variable set
- [ ] SESSION_SECRET environment variable set (strong random string)
- [ ] NODE_ENV=production set
- [ ] Application deployed to hosting platform
- [ ] Database schema initialized with `npm run db:push`
- [ ] Application accessible via custom domain
- [ ] HTTPS enabled
- [ ] Optional: API keys for weather and AI services configured

## Шаг 9: Решение проблем

### 9.1 Частые проблемы и решения:

**Проблема: "Database connection failed"**
- Решение: Проверьте правильность DATABASE_URL
- Убедитесь что база данных доступна

**Проблема: "Tables not found"**
- Решение: Выполните `npm run db:push` для создания таблиц

**Проблема: "Session issues"**
- Решение: Убедитесь что SESSION_SECRET установлен и длинный (32+ символов)

**Проблема: Приложение не загружается**
- Решение: Проверьте логи приложения в панели хостинга

### 9.2 Полезные команды для отладки:
```bash
# Проверка подключения к базе данных
npm run db:studio

# Пересоздание таблиц (осторожно - удалит данные!)
npm run db:push

# Просмотр логов в режиме разработки
npm run dev
```

## Шаг 10: Итоговый чеклист

### 10.1 Перед деплоем убедитесь:
- [ ] Все файлы проекта загружены
- [ ] PostgreSQL база данных создана
- [ ] DATABASE_URL получен и добавлен в переменные
- [ ] SESSION_SECRET сгенерирован и добавлен
- [ ] NODE_ENV=production установлен
- [ ] Проект загружен на GitHub (если используете Railway/Vercel)

### 10.2 После деплоя проверьте:
- [ ] Приложение доступно по URL
- [ ] Команда `npm run db:push` выполнена успешно
- [ ] Регистрация пользователей работает
- [ ] Дашборд загружается
- [ ] Можно добавлять данные потребления
- [ ] ИИ рекомендации работают (если API ключи настроены)

## Поддержка

Если у вас возникли проблемы:
1. Проверьте логи приложения в панели хостинга
2. Убедитесь что все переменные окружения правильно настроены
3. Проверьте что база данных доступна
4. Убедитесь что все зависимости установлены

**Важно**: Проект не требует никаких дополнительных баз данных - только PostgreSQL!