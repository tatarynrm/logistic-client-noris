#!/bin/bash

# Скрипт для початкового налаштування VPS
# Запустіть цей скрипт на VPS після першого підключення

set -e

echo "🔧 Setting up VPS for auto-deployment..."

# Оновлення системи
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Встановлення Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Встановлення Docker Compose
echo "🔧 Installing Docker Compose..."
sudo apt install docker-compose-plugin -y

# Встановлення Git
echo "📚 Installing Git..."
sudo apt install git -y

# Створення SSH ключа для GitHub
echo "🔑 Creating SSH key for GitHub..."
if [ ! -f ~/.ssh/github_deploy ]; then
    ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/github_deploy
    
    # Створення SSH конфігу
    cat >> ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    StrictHostKeyChecking no
EOF
    chmod 600 ~/.ssh/config
else
    echo "SSH key already exists"
fi

echo ""
echo "✅ VPS setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add this public key to GitHub Deploy Keys:"
echo ""
cat ~/.ssh/github_deploy.pub
echo ""
echo "2. Clone your repository:"
echo "   mkdir -p ~/logistic-app"
echo "   cd ~/logistic-app"
echo "   git clone git@github.com:username/repo.git ."
echo ""
echo "3. Create .env file in logistic-client directory"
echo "4. Run: cd logistic-client && docker compose up -d"
echo ""
echo "⚠️  IMPORTANT: You need to re-login for Docker group changes to take effect!"
echo "   Run: exit"
echo "   Then reconnect: ssh user@your-vps-ip"
