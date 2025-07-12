# Проблемы с базами данных - диагностика

## Частые проблемы Neon + Render

### 1. Проблемы с подключением
- **Неправильный формат URL** - `psql 'postgresql://...'` вместо чистого URL
- **SSL проблемы** - отсутствует `?sslmode=require`
- **Истекший пароль** - Neon периодически меняет пароли
- **Региональные ограничения** - база в одном регионе, Render в другом

### 2. Проблемы с сетью
- **Таймауты подключения** - медленная сеть между Render и Neon
- **Блокировка firewall** - некоторые IP заблокированы
- **Connection pooling** - превышен лимит подключений

### 3. Проблемы с конфигурацией
- **Неправильные переменные** - DATABASE_URL содержит спецсимволы
- **Кодировка URL** - %20 и другие символы не декодированы
- **Лишние кавычки** - URL обернут в кавычки

### 4. Проблемы Neon-специфичные
- **Serverless sleep** - база "засыпает" без активности
- **Connection limits** - бесплатный план ограничивает подключения
- **Region mismatch** - база и приложение в разных регионах

## Диагностика

### Проверить формат URL:
```bash
echo $DATABASE_URL | head -c 50
```

### Проверить подключение:
```bash
psql "$DATABASE_URL" -c "SELECT NOW();"
```

### Проверить SSL:
Убедитесь что URL содержит `?sslmode=require`

## Решения

### 1. Пересоздать переменную DATABASE_URL
1. Зайти в Neon Dashboard
2. Скопировать новую connection string
3. Заменить в Render Environment Variables

### 2. Проверить регион базы
- Neon база должна быть в ближайшем к Render регионе
- US East для быстрого подключения

### 3. Использовать pooled connection
Вместо прямого подключения использовать pooler:
```
postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db
```

### 4. Добавить retry логику
```javascript
const pool = new Pool({ 
  connectionString: databaseUrl,
  max: 1, // Limit connections for free tier
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});
```