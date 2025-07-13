# Быстрый деплой на Render

## Шаг 1: Создание новой базы данных в Neon
1. Зайдите в https://neon.tech
2. Создайте новый проект
3. Скопируйте строку подключения вида:
   ```
   postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```

## Шаг 2: Настройка Render
1. Зайдите в https://render.com
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий

### Настройки сборки:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`
- **Node Version**: 18
- **Environment**: Node

### Переменные окружения:
```
NODE_ENV = development
DATABASE_URL = postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require
SESSION_SECRET = random_32_character_string
AUTO_MIGRATE = true
```

## Шаг 3: Генерация секретного ключа
Выполните в терминале:
```bash
openssl rand -base64 32
```

## Шаг 4: Деплой
1. Нажмите "Create Web Service"
2. Дождитесь завершения сборки
3. Проверьте работу по адресу: https://ваш-домен.onrender.com

## Готово!
Проект автоматически:
- Подключится к базе данных
- Создаст все необходимые таблицы
- Настроит сессии и аутентификацию
- Будет готов к использованию

## Если есть проблемы:
- Проверьте логи в Render Dashboard
- Убедитесь что DATABASE_URL корректный
- Проверьте API здоровья: `/api/health`