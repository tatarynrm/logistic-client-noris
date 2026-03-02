#!/bin/bash
set -e

echo "🚀 Setting up VPS for auto-deploy..."
echo ""

# Кольори для виводу
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Перевірка що запущено від root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (use: sudo su)"
  exit 1
fi

echo -e "${GREEN}Step 1/7: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

echo ""
echo -e "${GREEN}Step 2/7: Installing Docker Compose...${NC}"
apt install -y docker-compose-plugin
echo "✅ Docker Compose installed"

echo ""
echo -e "${GREEN}Step 3/7: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
    echo "✅ Git installed"
else
    echo "✅ Git already installed"
fi

echo ""
echo -e "${GREEN}Step 4/7: Creating SSH keys...${NC}"
if [ ! -f ~/.ssh/github_deploy ]; then
    ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
    echo "✅ GitHub deploy key created"
else
    echo "✅ GitHub deploy key already exists"
fi

if [ ! -f ~/.ssh/github_actions ]; then
    ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
    cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
    echo "✅ GitHub Actions key created"
else
    echo "✅ GitHub Actions key already exists"
fi

echo ""
echo -e "${GREEN}Step 5/7: Configuring SSH...${NC}"
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
chmod 600 ~/.ssh/github_actions
echo "✅ SSH configured"

echo ""
echo -e "${GREEN}Step 6/7: Testing GitHub connection...${NC}"
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "✅ GitHub connection OK" || echo "⚠️  GitHub connection failed (add deploy key first)"

echo ""
echo -e "${GREEN}Step 7/7: Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall setup"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Server setup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1️⃣  Add this DEPLOY KEY to GitHub:"
echo "   GitHub → Settings → Deploy keys → Add deploy key"
echo "   ✅ Enable 'Allow write access'"
echo ""
cat ~/.ssh/github_deploy.pub
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣  Add these SECRETS to GitHub Actions:"
echo "   GitHub → Settings → Secrets and variables → Actions"
echo ""
echo "   VPS_HOST = $(curl -s ifconfig.me)"
echo "   VPS_USERNAME = root"
echo "   VPS_PROJECT_PATH = /var/www/YOUR-REPO-NAME"
echo ""
echo "   VPS_SSH_KEY = (copy the private key below)"
echo ""
cat ~/.ssh/github_actions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣  Clone your repository:"
echo "   mkdir -p /var/www && cd /var/www"
echo "   git clone git@github.com:YOUR-USERNAME/YOUR-REPO.git"
echo "   cd YOUR-REPO"
echo ""
echo "4️⃣  Create .env file:"
echo "   ./generate-env.sh"
echo ""
echo "5️⃣  Start the application:"
echo "   chmod +x deploy.sh docker-entrypoint.sh"
echo "   docker compose up -d --build"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Full guide: AUTO_DEPLOY_GUIDE.md"
echo "⚡ Quick guide: QUICK_AUTODEPLOY.md"
echo ""
