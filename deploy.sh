#!/bin/bash
set -e

echo "🚀 Starting deployment..."
echo ""

# Зупини контейнери
echo "⏸️  Stopping containers..."
docker-compose down

# Отримай останні зміни
echo "📥 Pulling latest changes..."
git pull origin main || git pull origin master

# Очисти Docker кеш
echo "🧹 Cleaning Docker cache..."
docker system prune -f

# Збудуй нові образи
echo "🔨 Building images (this may take a while)..."
docker-compose build --no-cache

# Запусти контейнери
echo "▶️  Starting containers..."
docker-compose up -d

# Почекай поки все запуститься
echo "⏳ Waiting for services to start..."
sleep 15

# Перевір статус
echo ""
echo "✅ Checking status..."
docker-compose ps

echo ""
echo "📝 Recent logs:"
docker-compose logs --tail=30 app

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Check your app at: http://localhost:3000"
echo "View logs: docker-compose logs -f app"
