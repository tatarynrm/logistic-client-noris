# 🔧 Виправлення помилки на сервері

## Проблема
```
PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL
```

## Рішення

### На сервері виконай:

```bash
# 1. Зупини контейнери
docker-compose down

# 2. Оновити код з GitHub
git pull

# 3. Переконайся що .env файл існує
ls -la .env

# Якщо немає - створи:
nano .env
```

### Вміст .env файлу:
```env
DB_PASSWORD=your-strong-password
JWT_SECRET=your-very-strong-secret-key
NODE_ENV=production
```

### Продовжуй:
```bash
# 4. Очисти Docker кеш
docker system prune -af

# 5. Збудуй заново (без кешу)
docker-compose build --no-cache

# 6. Запусти
docker-compose up -d

# 7. Перевір логи
docker-compose logs -f app
```

## Перевірка що працює

```bash
# Статус контейнерів
docker-compose ps

# Має бути:
# logistic-db    running
# logistic-app   running

# Перевір додаток
curl http://localhost:3000

# Або з іншого комп'ютера
curl http://your-server-ip:3000
```

## Якщо все ще не працює

### Варіант 1: Перевір .env
```bash
cat .env
# Має бути DB_PASSWORD та JWT_SECRET
```

### Варіант 2: Подивись детальні логи
```bash
docker-compose logs app
docker-compose logs postgres
```

### Варіант 3: Зайди в контейнер
```bash
docker-compose exec app sh
env | grep DATABASE_URL
npx prisma migrate deploy
exit
```

### Варіант 4: Повне перевстановлення
```bash
# ОБЕРЕЖНО: Видалить всі дані!
docker-compose down -v
docker system prune -af
docker-compose up -d --build
```

## Що було виправлено

1. ✅ Прибрано `postinstall` скрипт з package.json
2. ✅ Додано `--ignore-scripts` при `npm ci`
3. ✅ Prisma Client копіюється з builder stage
4. ✅ Додано `docker-entrypoint.sh` для міграцій
5. ✅ Міграції запускаються при старті контейнера

## Швидкий деплой скрипт

Створи файл `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🛑 Stopping containers..."
docker-compose down

echo "📥 Pulling latest code..."
git pull

echo "🔨 Building images..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for startup..."
sleep 10

echo "📊 Checking status..."
docker-compose ps

echo "📝 Showing logs..."
docker-compose logs --tail=50 app

echo "✅ Done!"
```

Зроби виконуваним:
```bash
chmod +x deploy.sh
```

Використовуй:
```bash
./deploy.sh
```

Готово! 🎉
