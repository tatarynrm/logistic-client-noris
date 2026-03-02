#!/bin/bash

# Скрипт для відкату до попередньої версії

set -e

echo "⚠️  Rolling back to previous version..."

cd ~/logistic-app

# Показати останні коміти
echo "Recent commits:"
git log --oneline -5

# Запитати коміт для відкату
read -p "Enter commit hash to rollback to: " COMMIT_HASH

if [ -z "$COMMIT_HASH" ]; then
    echo "❌ Commit hash is required"
    exit 1
fi

echo "🔄 Rolling back to $COMMIT_HASH..."
git reset --hard $COMMIT_HASH

cd logistic-client

echo "🛑 Stopping containers..."
docker compose down

echo "🔨 Rebuilding..."
docker compose build --no-cache

echo "▶️  Starting containers..."
docker compose up -d

echo "⏳ Waiting for database..."
sleep 10

echo "✅ Rollback completed!"
docker compose ps
