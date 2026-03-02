#!/bin/bash

echo "🔐 Generating production .env file..."
echo ""

# Генеруємо паролі
DB_PASSWORD=$(openssl rand -base64 20 | tr -d '=+/' | cut -c1-24)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Створюємо .env файл
cat > .env << EOF
# Generated on $(date)
# Keep this file secure and never commit to Git!

# Database Configuration
DB_PASSWORD=$DB_PASSWORD

# JWT Authentication Secret
JWT_SECRET=$JWT_SECRET

# Environment
NODE_ENV=production
EOF

# Встановлюємо права доступу
chmod 600 .env

echo "✅ .env file created successfully!"
echo ""
echo "📋 Your credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "JWT_SECRET: ${JWT_SECRET:0:40}..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Save these credentials in a secure place!"
echo "⚠️  You won't be able to see them again!"
echo ""
echo "📁 File location: $(pwd)/.env"
echo "🔒 File permissions: $(ls -l .env | awk '{print $1}')"
echo ""
echo "Next steps:"
echo "1. Review the .env file: cat .env"
echo "2. Start Docker: docker-compose up -d --build"
echo "3. Check logs: docker-compose logs -f"
