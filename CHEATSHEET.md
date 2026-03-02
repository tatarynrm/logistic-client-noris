# 📝 Шпаргалка команд

## 🚀 Швидкий старт на VPS

```bash
# 1. Автоналаштування
wget https://raw.githubusercontent.com/your-repo/main/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# 2. Клонування
git clone git@github.com:username/repo.git
cd repo

# 3. Налаштування
./generate-env.sh

# 4. Запуск
docker compose up -d --build
```

---

## 🐳 Docker команди

```bash
# Запуск
docker compose up -d --build      # Збудувати і запустити
docker compose up -d              # Запустити без rebuild
docker compose down               # Зупинити
docker compose restart app        # Перезапустити додаток

# Моніторинг
docker compose ps                 # Статус контейнерів
docker compose logs -f app        # Логи додатку (live)
docker compose logs --tail=50 app # Останні 50 рядків
docker stats                      # Використання ресурсів

# Виконання команд
docker compose exec app sh        # Зайти в контейнер
docker compose exec app npx prisma studio
docker compose exec postgres psql -U postgres trip-manager

# Очищення
docker compose down -v            # Зупинити + видалити volumes
docker system prune -f            # Видалити невикористовувані ресурси
docker system prune -af           # Видалити все невикористовуване
```

---

## 📦 NPM команди

```bash
# Розробка
npm run dev                       # Dev сервер
npm run build                     # Build для production
npm start                         # Production сервер

# Prisma
npm run prisma:generate           # Згенерувати клієнт
npm run prisma:migrate            # Створити міграцію
npm run prisma:migrate:deploy     # Застосувати міграції
npm run prisma:studio             # Відкрити Prisma Studio
npm run prisma:validate           # Валідувати схему
npm run prisma:format             # Форматувати схему

# Docker (локально)
npm run docker:dev:up             # Запустити БД
npm run docker:dev:down           # Зупинити БД
npm run docker:prod:build         # Збудувати образи
npm run docker:prod:up            # Запустити все
npm run docker:prod:down          # Зупинити все
npm run docker:logs               # Логи
```

---

## 🔑 SSH команди

```bash
# Підключення
ssh root@server-ip

# Генерація ключів
ssh-keygen -t ed25519 -C "comment" -f ~/.ssh/keyname

# Копіювання ключа
cat ~/.ssh/keyname.pub            # Публічний ключ
cat ~/.ssh/keyname                # Приватний ключ

# Тестування
ssh -T git@github.com             # Перевірка GitHub
```

---

## 🔐 Генерація паролів

```bash
# DB_PASSWORD (20 символів)
openssl rand -base64 20 | tr -d '=+/'

# JWT_SECRET (64 символи)
openssl rand -base64 64 | tr -d '\n'

# Або використай скрипт
./generate-env.sh
```

---

## 🌐 Nginx команди

```bash
# Перевірка конфігурації
nginx -t

# Перезапуск
systemctl restart nginx
systemctl reload nginx

# Логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# SSL (Let's Encrypt)
certbot --nginx -d domain.com
certbot renew --dry-run           # Тест оновлення
```

---

## 🔥 Firewall (UFW)

```bash
# Дозволити порти
ufw allow 22/tcp                  # SSH
ufw allow 80/tcp                  # HTTP
ufw allow 443/tcp                 # HTTPS

# Управління
ufw enable                        # Увімкнути
ufw disable                       # Вимкнути
ufw status                        # Статус
ufw status numbered               # З номерами правил
ufw delete 3                      # Видалити правило #3
```

---

## 📊 Моніторинг

```bash
# Використання ресурсів
htop                              # Інтерактивний монітор
docker stats                      # Docker контейнери
df -h                             # Диск
free -h                           # Пам'ять

# Процеси
ps aux | grep node                # Node процеси
lsof -i :3000                     # Що використовує порт 3000
netstat -tulpn                    # Всі порти
```

---

## 💾 Backup

```bash
# Створити backup
docker compose exec postgres pg_dump -U postgres trip-manager > backup_$(date +%Y%m%d).sql

# Відновити backup
docker compose exec -T postgres psql -U postgres trip-manager < backup_20260302.sql

# Автоматичний backup (cron)
crontab -e
# Додати: 0 3 * * * /root/backup.sh
```

---

## 🔄 Git команди

```bash
# Базові
git pull                          # Отримати зміни
git add .                         # Додати всі файли
git commit -m "message"           # Закомітити
git push origin main              # Запушити

# Статус
git status                        # Статус
git log -5                        # Останні 5 комітів
git log --oneline                 # Короткий лог

# Скасування
git reset --hard HEAD             # Скасувати всі зміни
git clean -fd                     # Видалити нові файли
```

---

## 🚨 Troubleshooting

```bash
# Перезапуск всього
docker compose down
docker compose up -d --build

# Повне очищення (ОБЕРЕЖНО!)
docker compose down -v
docker system prune -af
docker compose up -d --build

# Перевірка .env
cat .env
chmod 600 .env

# Перевірка логів
docker compose logs -f app
docker compose logs -f postgres

# Перевірка підключення
curl http://localhost:3000
docker compose exec app sh
```

---

## 📱 GitHub Actions

```bash
# Локально перевірити workflow
# (потрібен act: https://github.com/nektos/act)
act -l                            # Список jobs
act push                          # Запустити push event

# На GitHub
# Actions → Вибрати workflow → Re-run jobs
```

---

## 🎯 Швидкий деплой

```bash
# На своєму комп'ютері
git add .
git commit -m "update"
git push origin main

# На сервері (якщо потрібно вручну)
cd /var/www/repo
./deploy.sh
```

---

## 🔍 Корисні однорядкові команди

```bash
# Знайти великі файли
du -ah / | sort -rh | head -20

# Очистити логи Docker
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Перевірити відкриті порти
ss -tulpn

# Використання диску по папках
du -sh /*

# Топ процесів по пам'яті
ps aux --sort=-%mem | head -10

# Топ процесів по CPU
ps aux --sort=-%cpu | head -10

# Перевірити версії
docker --version
docker compose version
git --version
node --version
npm --version
```

---

## 📚 Швидкі посилання на документацію

- Docker: https://docs.docker.com/
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs
- GitHub Actions: https://docs.github.com/actions

---

## 💡 Корисні алиаси (додай в ~/.bashrc)

```bash
alias dc='docker compose'
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dcp='docker compose ps'
alias dcr='docker compose restart'

alias gp='git pull'
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gps='git push origin main'

# Після додавання:
source ~/.bashrc
```

---

Збережи цю шпаргалку і використовуй коли потрібно! 📌
