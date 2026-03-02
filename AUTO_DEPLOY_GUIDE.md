# 🚀 Повна інструкція: Автоматичний деплой з GitHub на VPS

## Що ми будемо робити?

Налаштуємо автоматичний деплой: коли ти робиш `git push` на GitHub, 
твій сервер автоматично оновлюється і перезапускає додаток.

---

## 📋 Що тобі потрібно

1. ✅ VPS сервер (Ubuntu 20.04+)
2. ✅ Доступ до сервера через SSH
3. ✅ GitHub репозиторій з проектом
4. ✅ 30 хвилин часу

---

## Частина 1: Підготовка сервера (одноразово)

### Крок 1.1: Підключись до сервера
```bash
ssh root@твій-сервер-ip
```

Приклад:
```bash
ssh root@185.123.45.67
```

### Крок 1.2: Оновлення системи
```bash
apt update && apt upgrade -y
```

### Крок 1.3: Встановлення Docker
```bash
# Встановлюємо Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Перевіряємо
docker --version
```

Має показати щось типу: `Docker version 24.0.7`

### Крок 1.4: Встановлення Docker Compose
```bash
apt install docker-compose-plugin -y

# Перевіряємо
docker compose version
```

### Крок 1.5: Встановлення Git
```bash
apt install git -y

# Перевіряємо
git --version
```

---

## Частина 2: Налаштування GitHub (одноразово)

### Крок 2.1: Створи SSH ключ на сервері
```bash
# Генеруємо ключ
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/github_deploy

# Просто натискай Enter на всі питання (без паролю)
```

### Крок 2.2: Скопіюй публічний ключ
```bash
cat ~/.ssh/github_deploy.pub
```

Скопіюй весь текст що показався (починається з `ssh-ed25519`)

### Крок 2.3: Додай ключ в GitHub
1. Відкрий https://github.com/твій-username/твій-репозиторій
2. Натисни **Settings** (вгорі справа)
3. В лівому меню: **Deploy keys**
4. Натисни **Add deploy key**
5. Title: `VPS Deploy Key`
6. Key: вставити скопійований ключ
7. ✅ Поставити галочку **Allow write access**
8. Натисни **Add key**

### Крок 2.4: Налаштуй SSH на сервері
```bash
# Створи конфіг
nano ~/.ssh/config
```

Вставити:
```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    StrictHostKeyChecking no
```

Збережи: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Встанови права
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy
```

### Крок 2.5: Перевір підключення
```bash
ssh -T git@github.com
```

Має показати: `Hi username! You've successfully authenticated`

---

## Частина 3: Клонування проекту

### Крок 3.1: Створи папку для проектів
```bash
mkdir -p /var/www
cd /var/www
```

### Крок 3.2: Клонуй репозиторій
```bash
git clone git@github.com:твій-username/твій-репозиторій.git
```

Приклад:
```bash
git clone git@github.com:john/logistic-client.git
```

### Крок 3.3: Перейди в папку проекту
```bash
cd logistic-client
# або назва твого репозиторію
```

---

## Частина 4: Налаштування проекту

### Крок 4.1: Створи .env файл
```bash
chmod +x generate-env.sh
./generate-env.sh
```

Скрипт згенерує паролі. **ЗБЕРЕЖИ ЇХ!**

Або створи вручну:
```bash
nano .env
```

Вставити:
```env
DB_PASSWORD=твій-сильний-пароль-мінімум-16-символів
JWT_SECRET=твій-дуже-довгий-секретний-ключ-мінімум-64-символи
NODE_ENV=production
```

Збережи: `Ctrl+O`, `Enter`, `Ctrl+X`

### Крок 4.2: Зроби скрипти виконуваними
```bash
chmod +x deploy.sh
chmod +x docker-entrypoint.sh
```

### Крок 4.3: Перший запуск
```bash
docker compose up -d --build
```

Це займе 5-10 хвилин при першому запуску.

### Крок 4.4: Перевір що працює
```bash
# Статус контейнерів
docker compose ps

# Логи
docker compose logs -f app
```

Натисни `Ctrl+C` щоб вийти з логів.

```bash
# Перевір додаток
curl http://localhost:3000
```

Має показати HTML код сторінки.

---

## Частина 5: Налаштування автодеплою (GitHub Actions)

### Крок 5.1: Створи SSH ключ для GitHub Actions
```bash
# На сервері
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Без паролю (просто Enter)
```

### Крок 5.2: Додай публічний ключ в authorized_keys
```bash
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

### Крок 5.3: Скопіюй приватний ключ
```bash
cat ~/.ssh/github_actions
```

Скопіюй **ВЕСЬ** текст (від `-----BEGIN` до `-----END`)

### Крок 5.4: Додай секрети в GitHub
1. Відкрий https://github.com/твій-username/твій-репозиторій
2. **Settings** → **Secrets and variables** → **Actions**
3. Натисни **New repository secret**

Додай 3 секрети:

**Секрет 1:**
- Name: `VPS_HOST`
- Value: `185.123.45.67` (твій IP сервера)

**Секрет 2:**
- Name: `VPS_USERNAME`  
- Value: `root`

**Секрет 3:**
- Name: `VPS_SSH_KEY`
- Value: вставити приватний ключ (весь текст з `cat ~/.ssh/github_actions`)

### Крок 5.5: Додай шлях до проекту
**Секрет 4:**
- Name: `VPS_PROJECT_PATH`
- Value: `/var/www/logistic-client` (або твій шлях)

---

## Частина 6: Створення GitHub Actions workflow

### Крок 6.1: На своєму комп'ютері
```bash
# Перейди в папку проекту
cd /шлях/до/твого/проекту

# Створи папку для workflows
mkdir -p .github/workflows
```

### Крок 6.2: Створи файл deploy.yml
```bash
nano .github/workflows/deploy.yml
```

Або відкрий в редакторі та створи файл `.github/workflows/deploy.yml`

---


## Частина 7: Створення GitHub Actions файлу

Створи файл `.github/workflows/deploy.yml` з таким вмістом:

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main  # або master, залежно від твоєї гілки

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 🚀 Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ${{ secrets.VPS_PROJECT_PATH }}
            echo "📥 Pulling latest changes..."
            git pull origin main
            echo "🔨 Building and restarting containers..."
            docker compose down
            docker compose up -d --build
            echo "⏳ Waiting for services..."
            sleep 15
            echo "✅ Deployment complete!"
            docker compose ps
```

---

## Частина 8: Перший автодеплой

### Крок 8.1: Закоміть файл
```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow"
git push origin main
```

### Крок 8.2: Перевір деплой
1. Відкрий https://github.com/твій-username/твій-репозиторій
2. Перейди на вкладку **Actions**
3. Побачиш процес деплою

### Крок 8.3: Дочекайся завершення
Деплой займе 3-5 хвилин. Коли побачиш зелену галочку ✅ - готово!

---

## Частина 9: Налаштування Nginx (опціонально, для домену)

### Крок 9.1: Встановлення Nginx
```bash
apt install nginx -y
```

### Крок 9.2: Створи конфігурацію
```bash
nano /etc/nginx/sites-available/logistic
```

Вставити:
```nginx
server {
    listen 80;
    server_name твій-домен.com www.твій-домен.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Збережи: `Ctrl+O`, `Enter`, `Ctrl+X`

### Крок 9.3: Активуй конфігурацію
```bash
ln -s /etc/nginx/sites-available/logistic /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Крок 9.4: Встановлення SSL (HTTPS)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d твій-домен.com -d www.твій-домен.com
```

Слідуй інструкціям certbot.

---

## Частина 10: Тестування автодеплою

### Крок 10.1: Зроби зміну в коді
На своєму комп'ютері:
```bash
# Відкрий будь-який файл і зміни щось
nano README.md
# Додай рядок: "Test auto-deploy"
```

### Крок 10.2: Закоміть і запуш
```bash
git add .
git commit -m "Test auto-deploy"
git push origin main
```

### Крок 10.3: Перевір GitHub Actions
1. Відкрий https://github.com/твій-username/твій-репозиторій/actions
2. Побачиш новий workflow що запустився
3. Дочекайся зеленої галочки ✅

### Крок 10.4: Перевір на сервері
```bash
ssh root@твій-сервер-ip
cd /var/www/logistic-client
git log -1  # Має показати твій останній коміт
docker compose ps  # Контейнери мають бути running
```

---

## 🎉 Готово! Тепер у тебе автодеплой!

### Як це працює:
1. Ти робиш зміни в коді на своєму комп'ютері
2. Робиш `git push origin main`
3. GitHub Actions автоматично:
   - Підключається до твого VPS
   - Робить `git pull`
   - Перезбудовує Docker контейнери
   - Перезапускає додаток
4. Через 3-5 хвилин зміни вже на сервері!

---

## 📊 Моніторинг та логи

### На сервері:
```bash
# Статус контейнерів
docker compose ps

# Логи додатку
docker compose logs -f app

# Логи бази даних
docker compose logs -f postgres

# Використання ресурсів
docker stats
```

### На GitHub:
- **Actions** → Історія всіх деплоїв
- Можна переглянути логи кожного деплою
- Можна перезапустити failed деплой

---

## 🔧 Troubleshooting

### Проблема: Деплой failed
```bash
# На сервері перевір логи
cd /var/www/logistic-client
docker compose logs -f
```

### Проблема: Git pull не працює
```bash
# Перевір SSH ключ
ssh -T git@github.com

# Якщо помилка - перегенеруй ключ
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub
# Додай в GitHub Deploy Keys
```

### Проблема: Docker не запускається
```bash
# Перевір .env файл
cat .env

# Перевір що контейнери зупинені
docker compose down

# Запусти заново
docker compose up -d --build
```

### Проблема: Порт 3000 зайнятий
```bash
# Подивись що використовує порт
lsof -i :3000

# Зупини процес
kill -9 PID
```

---

## 🔐 Безпека

### Firewall (рекомендовано)
```bash
# Дозволь тільки потрібні порти
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### Регулярні оновлення
```bash
# Раз на тиждень
apt update && apt upgrade -y
docker system prune -f
```

### Backup бази даних
```bash
# Створи backup скрипт
nano /root/backup.sh
```

Вставити:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U postgres trip-manager > $BACKUP_DIR/backup_$DATE.sql
# Видали старі backup (старші 7 днів)
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup.sh

# Додай в cron (щодня о 3:00)
crontab -e
```

Додати рядок:
```
0 3 * * * /root/backup.sh
```

---

## 📝 Чеклист

### Одноразове налаштування:
- [ ] Встановлено Docker на VPS
- [ ] Встановлено Git на VPS
- [ ] Створено SSH ключ для GitHub
- [ ] Додано Deploy Key в GitHub
- [ ] Клоновано репозиторій на VPS
- [ ] Створено .env файл
- [ ] Додано секрети в GitHub Actions
- [ ] Створено .github/workflows/deploy.yml
- [ ] Перший деплой успішний
- [ ] Налаштовано Nginx (якщо потрібно)
- [ ] Встановлено SSL (якщо потрібно)

### Щоденна робота:
- [ ] Роблю зміни в коді
- [ ] `git add .`
- [ ] `git commit -m "опис змін"`
- [ ] `git push origin main`
- [ ] Перевіряю GitHub Actions
- [ ] Дочекаюсь зеленої галочки ✅
- [ ] Перевіряю сайт

---

## 🎓 Додаткові можливості

### Деплой тільки при тегах
Змінити в `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    tags:
      - 'v*'  # Деплой тільки при git tag v1.0.0
```

### Деплой на різні сервери
Створити окремі workflows:
- `.github/workflows/deploy-staging.yml` (для тестового сервера)
- `.github/workflows/deploy-production.yml` (для продакшн)

### Slack/Telegram нотифікації
Додати в workflow:
```yaml
- name: Send notification
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: "✅ Deploy successful!"
```

---

## 📚 Корисні посилання

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

Готово! Тепер у тебе повноцінний CI/CD pipeline! 🚀

Кожен `git push` автоматично оновлює твій сервер. Просто пиши код і пуш - все інше відбувається автоматично!
