# Econest - AI-Powered Carbon Footprint Tracker

## Overview

Econest - это веб-приложение для отслеживания углеродного следа с региональными сравнениями и ИИ-аналитикой. Проект готов к деплою на Render/Railway с чистой кодовой базой.

## User Preferences

Preferred communication style: Simple, everyday language in Russian.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI
- **AI**: OpenAI integration (optional)

### Deployment Ready
- Удалены все ненужные файлы для продакшена
- Исправлены команды сборки для Render/Railway
- Подготовлена полная документация деплоя
- Настроена автоматическая миграция БД

## Recent Changes

✓ Удалены все временные и тестовые файлы
✓ Исправлены команды сборки: npm install && npm run build
✓ Добавлена автоматическая миграция с AUTO_MIGRATE=true
✓ Обновлена документация деплоя с решением ошибок Render
✓ Исправлена критическая ошибка регистрации - добавлено поле region в frontend
✓ Добавлен отсутствующий endpoint /api/contact для формы обратной связи
✓ Исправлен порядок параметров в apiRequest для Contact.tsx
✓ Включена автоматическая генерация таблицы sessions
✓ Исправлены SQL query проблемы в getUserRecommendations/getUserCO2Insights
✓ Удалены дублирующие endpoint'ы в routes.ts
✓ Проведена полная проверка API консистентности между frontend/backend
✓ Все критические backend проблемы исправлены
✓ Уточнены переменные окружения: NODE_ENV=development для Render
✓ Добавлена автоматическая очистка DATABASE_URL от psql команд
✓ Протестирована регистрация - работает идеально в Replit
✓ Проблема локализована: старая база Neon на Render повреждена
✓ Проект готов к деплою под кастомный домен
✓ УСПЕШНЫЙ ДЕПЛОЙ на Render: https://econest-q3hj.onrender.com
✓ База данных подключена и мигрирована автоматически
✓ Автоматическая очистка DATABASE_URL работает корректно
→ Проблема с таблицами: старая база Neon не создает таблицы после миграции
→ Решение: создать новую базу данных в Neon для продакшена
✓ Исправлены команды сборки для Render:
  - Build Command: npm install && npm run build
  - Start Command: node dist/index.js
  - Это решает проблему "No open ports detected"
✓ Оптимизирован запуск сервера для Render:
  - Сервер запускается первым, привязывается к порту
  - Миграция базы данных выполняется в фоне
  - Исправлена логика определения production/development режима
  - Автоматическое определение: если запуск из dist/index.js = production build
  - NODE_ENV=development для корректной работы с Render
✓ Исправлены настройки CORS и сессий для Render
✓ Добавлена регенерация сессий и правильные cookie настройки
✓ В Replit база работает корректно - проблема только на Render
✓ Применены все рекомендованные исправления для Render:
  - PostgreSQL session store с SSL поддержкой
  - Правильные CORS настройки для кросс-доменных запросов
  - process.env.PORT для совместимости с Render
  - Автоматический логин после регистрации
✓ Исправлен критический порядок middleware:
  - CORS настройки перемещены ПЕРЕД сессиями
  - Это решает проблему с cookie на Render/production
  - Порядок: CORS → Sessions → JSON parsing → Routes
✓ Исправлен экспорт schema для Drizzle Kit:
  - Добавлен export default со всеми таблицами
  - Все таблицы: sessions, users, consumptionReadings, predictions, recommendations, co2Insights, regionalStats
  - Теперь Drizzle Kit корректно видит и синхронизирует всю схему
✓ Добавлена диагностика для Render деплоя:
  - Проверка схемы таблиц при старте сервера
  - Тестирование доступности users table
  - Логирование для отладки проблем с миграцией на production
✓ Полная подготовка к деплою завершена:
  - Исправлены проблемы с белым экраном Vite
  - Добавлены все отсутствующие переводы dashboard
  - Создана краткая инструкция деплоя DEPLOY_GUIDE.md
  - Все middleware настроены корректно для Render
  - Проект готов к деплою на новую базу Neon