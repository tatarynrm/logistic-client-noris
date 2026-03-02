#!/bin/bash

# Скрипт для автоматичного деплою на VPS
# Використовується GitHub Actions

set -e  # Зупинити при помилці

echo "🚀 Starting deployment..."

# Перейти в директорію проекту
cd ~/logistic-app

echo "📥 Pulling latest changes..."
git pull origin main

# Перейти в директорію з додатком
cd logistic-client

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Building new images..."
docker compose build --no-cache

echo "▶️  Starting containers..."
docker compose up -d

echo "⏳ Waiting for database..."
sleep 10

echo "🗄️  Running database migrations..."
docker compose exec -T app npx prisma migrate deploy

echo "✅ Deployment completed successfully!"
echo "📊 Container status:"
docker compose ps

echo ""
echo "📝 Recent logs:"
docker compose logs app --tail=20
