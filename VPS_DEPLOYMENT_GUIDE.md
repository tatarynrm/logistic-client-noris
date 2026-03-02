# � Docker деплой на VPS (під root)

Найпростіший спосіб деплою з Docker та автоматичним CI/CD.

---

## 📋 Зміст

1. [Підготовка VPS](#1-підготовка-vps)
2. [Встановлення Docker](#2-встановлення-docker)
3. [Налаштування проекту](#3-налаштування-проекту)
4. [Запуск Docker](#4-запуск-docker)
5. [Налаштування Nginx](#5-налаштування-nginx)
6. [Налаштування SSL](#6-налаштування-ssl)
7. [Автодеплой GitHub Actions](#7-автодеплой-github-actions)

---

## 1. Підготовка VPS

### 1.1 Підключення

```bash
ssh root@YOUR_VPS_IP
```

### 1.2 Оновлення системи

```bash
apt update && apt upgrade -y
```

### 1.3 Базова безпека

```bash
# Firewall
apt install ufw -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 2. Встановлення Docker

### 2.1 Встановлення Docker

```bash
# Встановити Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Перевірити
docker --version
```

### 2.2 Встановлення Docker Compose

```bash
# Docker Compose вже включено в Docker
docker compose version
```

### 2.3 Встановлення Git та Nginx

```bash
apt install git nginx -y
systemctl enable nginx
systemctl enable nginx
```

---

## 3. Налаштування проекту

### 3.1 SSH ключ для GitHub

```bash
# Згенерувати ключ
ssh-keygen -t ed25519 -C "root@vps" -f ~/.ssh/github_key -N ""

# Показати публічний ключ
cat ~/.ssh/github_key.pub
```

**Додайте ключ в GitHub:**
- GitHub → Settings → SSH and GPG keys → New SSH key
- Вставте ключ

### 3.2 SSH конфіг

```bash
cat >> ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
```

### 3.3 Клонування проекту

```bash
# Створити директорію
mkdir -p /var/www
cd /var/www

# Клонувати (замініть на ваш репозиторій)
git clone git@github.com:USERNAME/REPO_NAME.git app
cd app/logistic-client
```

### 3.4 Створення .env

```bash
cat > .env << 'EOF'
DB_PASSWORD=your_secure_password_123
JWT_SECRET=your_very_long_random_secret_key_minimum_64_characters_abcdef1234567890
PUSHER_APP_ID=your_pusher_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=eu
EOF
```

**Відредагуйте .env з реальними даними:**
```bash
nano .env
```

---

## 4. Запуск Docker

### 4.1 Збірка та запуск

```bash
# Зібрати та запустити
docker compose up -d --build

# Перевірити статус
docker compose ps

# Переглянути логи
docker compose logs -f
```

### 4.2 Перевірка

```bash
# Перевірити, що контейнери запущені
docker compose ps

# Перевірити логи додатку
docker compose logs app

# Перевірити логи бази даних
docker compose logs postgres
```

Відкрийте в браузері: `http://YOUR_VPS_IP:3000`

### 4.3 Корисні команди Docker

```bash
# Перезапустити
docker compose restart

# Зупинити
docker compose down

# Зупинити та видалити volumes (БД буде очищена!)
docker compose down -v

# Переглянути логи
docker compose logs -f app

# Зайти в контейнер
docker compose exec app sh

# Виконати міграції вручну
docker compose exec app npx prisma migrate deploy

# Переглянути використання ресурсів
docker stats
```

---

## 5. Налаштування Nginx

### 5.1 Створення конфігурації

```bash
cat > /etc/nginx/sites-available/app << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    access_log /var/log/nginx/app-access.log;
    error_log /var/log/nginx/app-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймаути
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Статичні файли
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF
```

**Відредагуйте домен:**
```bash
nano /etc/nginx/sites-available/app
# Замініть your-domain.com на ваш домен
```

### 5.2 Активація

```bash
ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 5.3 Перевірка

Відкрийте: `http://your-domain.com`

---

## 6. Налаштування SSL

### 6.1 Встановлення Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 Отримання сертифікату

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Відповідайте:
- Email: ваш email
- Terms: Y
- Redirect to HTTPS: Y

### 6.3 Автооновлення

```bash
certbot renew --dry-run
```

### 6.4 Перевірка

Відкрийте: `https://your-domain.com`

---

## 7. Автодеплой GitHub Actions

### 7.1 SSH ключ для GitHub Actions

**На вашій локальній машині:**

```bash
# Згенерувати ключ
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Показати приватний ключ (для GitHub Secrets)
cat ~/.ssh/github_actions

# Показати публічний ключ (для VPS)
cat ~/.ssh/github_actions.pub
```

### 7.2 Додати публічний ключ на VPS

**На VPS:**

```bash
cat >> ~/.ssh/authorized_keys << 'EOF'
# Вставте сюди публічний ключ з ~/.ssh/github_actions.pub
EOF

chmod 600 ~/.ssh/authorized_keys
```

### 7.3 GitHub Secrets

GitHub → Repository → Settings → Secrets and variables → Actions

Створіть secrets:

| Name | Value |
|------|-------|
| `VPS_HOST` | IP адреса VPS |
| `VPS_SSH_KEY` | Приватний ключ (весь текст з `~/.ssh/github_actions`) |

### 7.4 Створення workflow

**У вашому репозиторії (локально):**

```bash
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to VPS

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            cd /var/www/app
            git pull origin main
            cd logistic-client
            docker compose down
            docker compose up -d --build
            echo "✅ Deployment completed!"
            docker compose ps
EOF
```

### 7.5 Commit та push

```bash
git add .
git commit -m "feat: add docker deployment"
git push origin main
```

### 7.6 Перевірка

GitHub → Actions → побачите запущений workflow

---

## 🔧 Корисні команди

### Docker команди

```bash
# Перезапустити все
docker compose restart

# Перезапустити тільки додаток
docker compose restart app

# Зупинити
docker compose down

# Запустити
docker compose up -d

# Переглянути логи
docker compose logs -f

# Логи тільки додатку
docker compose logs -f app

# Статус контейнерів
docker compose ps

# Використання ресурсів
docker stats
```

### Оновлення вручну

```bash
cd /var/www/app
git pull origin main
cd logistic-client
docker compose down
docker compose up -d --build
```

### Backup бази даних

```bash
# Створити backup
mkdir -p /root/backups
docker compose exec postgres pg_dump -U postgres tripmanager > /root/backups/db_$(date +%Y%m%d_%H%M%S).sql

# Відновити backup
docker compose exec -T postgres psql -U postgres tripmanager < /root/backups/db_20260302_120000.sql
```

### Очистка Docker

```bash
# Видалити невикористовувані образи
docker image prune -a

# Видалити невикористовувані volumes
docker volume prune

# Видалити все невикористовуване
docker system prune -a --volumes
```

### Nginx

```bash
# Перезапустити
systemctl restart nginx

# Перевірити конфігурацію
nginx -t

# Логи
tail -f /var/log/nginx/app-error.log
```

---

## 🐛 Troubleshooting

### Контейнери не запускаються

```bash
# Перевірити логи
docker compose logs

# Перевірити статус
docker compose ps

# Перезапустити
docker compose down
docker compose up -d --build
```

### База даних не підключається

```bash
# Перевірити логи PostgreSQL
docker compose logs postgres

# Зайти в контейнер PostgreSQL
docker compose exec postgres psql -U postgres -d tripmanager

# Перевірити змінні оточення
docker compose exec app env | grep DATABASE_URL
```

### Додаток не запускається

```bash
# Перевірити логи
docker compose logs app

# Зайти в контейнер
docker compose exec app sh

# Перевірити порт
docker compose ps
```

### Порт зайнятий

```bash
# Знайти процес на порту 3000
lsof -i :3000

# Або через Docker
docker ps | grep 3000
```

### GitHub Actions не працює

1. Перевірте Secrets: `VPS_HOST`, `VPS_SSH_KEY`
2. Перевірте SSH ключ: `cat ~/.ssh/authorized_keys`
3. Перевірте логи в GitHub Actions
4. Спробуйте підключитися вручну: `ssh -i ~/.ssh/github_actions root@VPS_IP`

### Очистити все та почати заново

```bash
cd /var/www/app/logistic-client
docker compose down -v
docker compose up -d --build
```

---

## 📝 Скрипт для швидкого деплою

```bash
cat > /root/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /var/www/app
git pull origin main

cd logistic-client
docker compose down
docker compose up -d --build

echo "✅ Deployment completed!"
docker compose ps
EOF

chmod +x /root/deploy.sh
```

Використання:
```bash
/root/deploy.sh
```

---

## 📊 Моніторинг

### Перегляд ресурсів

```bash
# Docker статистика
docker stats

# Системні ресурси
htop

# Диск
df -h

# Логи в реальному часі
docker compose logs -f
```

### Перевірка здоров'я

```bash
# Статус контейнерів
docker compose ps

# Перевірити додаток
curl http://localhost:3000

# Перевірити базу даних
docker compose exec postgres pg_isready -U postgres
```

---

## ✅ Чеклист

- [ ] VPS підготовлено
- [ ] Docker встановлено
- [ ] Проект склоновано
- [ ] .env створено з реальними даними
- [ ] Docker контейнери запущені
- [ ] Nginx налаштовано
- [ ] SSL сертифікат встановлено
- [ ] GitHub Actions працює
- [ ] Додаток доступний через HTTPS

---

## 🎉 Готово!

Тепер при кожному `git push` ваш додаток автоматично оновлюється!

**Ваш додаток:** https://your-domain.com

### Переваги Docker:

- ✅ Ізольоване середовище
- ✅ Легке відновлення (просто `docker compose up`)
- ✅ Не потрібно встановлювати Node.js, PostgreSQL
- ✅ Однакове середовище на dev та prod
- ✅ Легкий backup та міграція
- ✅ Автоматичні міграції БД при старті

### Що відбувається при git push:

1. GitHub Actions запускається
2. Підключається до VPS
3. Робить `git pull`
4. Зупиняє контейнери
5. Збирає нові образи
6. Запускає контейнери
7. Застосовує міграції БД
8. ✅ Готово!

---

**Автор:** Kiro AI  
**Дата:** 2 березня 2026  
**Версія:** Docker Deploy
