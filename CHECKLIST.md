# ✅ Чеклист налаштування автодеплою

## 📋 Одноразове налаштування (30 хвилин)

### На VPS сервері

- [ ] Підключився до VPS через SSH
- [ ] Запустив `setup-server.sh` (або встановив Docker, Git вручну)
- [ ] Створив SSH ключ для GitHub (`~/.ssh/github_deploy`)
- [ ] Створив SSH ключ для GitHub Actions (`~/.ssh/github_actions`)
- [ ] Перевірив підключення до GitHub (`ssh -T git@github.com`)

### На GitHub

- [ ] Додав Deploy Key (публічний ключ з `~/.ssh/github_deploy.pub`)
- [ ] Поставив галочку "Allow write access" на Deploy Key
- [ ] Додав Secret `VPS_HOST` (IP сервера)
- [ ] Додав Secret `VPS_USERNAME` (root)
- [ ] Додав Secret `VPS_SSH_KEY` (приватний ключ з `~/.ssh/github_actions`)
- [ ] Додав Secret `VPS_PROJECT_PATH` (/var/www/назва-репозиторію)

### На VPS - Клонування проекту

- [ ] Створив папку `/var/www`
- [ ] Клонував репозиторій: `git clone git@github.com:username/repo.git`
- [ ] Перейшов в папку проекту
- [ ] Створив `.env` файл (через `./generate-env.sh` або вручну)
- [ ] Додав `DB_PASSWORD` в .env
- [ ] Додав `JWT_SECRET` в .env
- [ ] Додав `NODE_ENV=production` в .env
- [ ] Встановив права на файли: `chmod 600 .env`
- [ ] Зробив скрипти виконуваними: `chmod +x deploy.sh docker-entrypoint.sh`

### Перший запуск

- [ ] Запустив: `docker compose up -d --build`
- [ ] Дочекався завершення (5-10 хвилин)
- [ ] Перевірив статус: `docker compose ps`
- [ ] Перевірив логи: `docker compose logs -f app`
- [ ] Перевірив що додаток працює: `curl http://localhost:3000`

### На своєму комп'ютері

- [ ] Файл `.github/workflows/deploy.yml` існує
- [ ] Перевірив що гілка правильна (main або master)
- [ ] Закомітив workflow: `git add .github/workflows/deploy.yml`
- [ ] Запушив: `git push origin main`
- [ ] Перевірив GitHub Actions (вкладка Actions)
- [ ] Дочекався зеленої галочки ✅

---

## 🎯 Щоденна робота

### Коли робиш зміни в коді:

- [ ] Зробив зміни в коді
- [ ] `git add .`
- [ ] `git commit -m "опис змін"`
- [ ] `git push origin main`
- [ ] Перевірив GitHub Actions
- [ ] Дочекався успішного деплою (3-5 хвилин)
- [ ] Перевірив що зміни на сервері

---

## 🔧 Опціональні налаштування

### Nginx + SSL (для домену)

- [ ] Встановив Nginx: `apt install nginx -y`
- [ ] Створив конфігурацію в `/etc/nginx/sites-available/`
- [ ] Активував конфігурацію
- [ ] Перевірив: `nginx -t`
- [ ] Перезапустив: `systemctl restart nginx`
- [ ] Встановив Certbot: `apt install certbot python3-certbot-nginx -y`
- [ ] Отримав SSL: `certbot --nginx -d domain.com`

### Firewall

- [ ] Встановив UFW: `apt install ufw -y`
- [ ] Дозволив SSH: `ufw allow 22/tcp`
- [ ] Дозволив HTTP: `ufw allow 80/tcp`
- [ ] Дозволив HTTPS: `ufw allow 443/tcp`
- [ ] Увімкнув: `ufw enable`
- [ ] Перевірив: `ufw status`

### Backup

- [ ] Створив скрипт backup: `/root/backup.sh`
- [ ] Зробив виконуваним: `chmod +x /root/backup.sh`
- [ ] Додав в cron: `crontab -e`
- [ ] Перевірив що backup працює

---

## 🐛 Якщо щось не працює

### Деплой failed на GitHub Actions

- [ ] Перевірив логи в GitHub Actions
- [ ] Перевірив що всі Secrets додані правильно
- [ ] Перевірив що SSH ключ правильний
- [ ] Спробував підключитись вручну: `ssh root@server-ip`

### Docker не запускається

- [ ] Перевірив логи: `docker compose logs -f`
- [ ] Перевірив .env файл: `cat .env`
- [ ] Зупинив все: `docker compose down`
- [ ] Видалив volumes: `docker compose down -v`
- [ ] Запустив заново: `docker compose up -d --build`

### База даних не підключається

- [ ] Перевірив статус: `docker compose ps postgres`
- [ ] Перевірив логи: `docker compose logs postgres`
- [ ] Перевірив пароль в .env
- [ ] Перезапустив: `docker compose restart postgres`

### Git pull не працює

- [ ] Перевірив SSH: `ssh -T git@github.com`
- [ ] Перевірив Deploy Key в GitHub
- [ ] Перевірив права на ключ: `chmod 600 ~/.ssh/github_deploy`
- [ ] Перевірив конфіг: `cat ~/.ssh/config`

---

## 📊 Перевірка що все працює

### На сервері:

```bash
# Статус контейнерів (має бути "Up")
docker compose ps

# Логи без помилок
docker compose logs --tail=50 app

# Додаток відповідає
curl http://localhost:3000

# Git працює
git pull
```

### На GitHub:

```bash
# Actions показує зелені галочки ✅
# Останній деплой успішний
# Логи без помилок
```

### В браузері:

```bash
# Сайт відкривається
# Можна залогінитись
# Всі функції працюють
```

---

## 🎉 Готово!

Якщо всі пункти виконані - у тебе повноцінний CI/CD pipeline!

Кожен `git push` автоматично оновлює сервер за 3-5 хвилин.

---

## 📚 Корисні посилання

- [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md) - Повна інструкція
- [QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md) - Швидкий старт
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker документація
- [ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md) - Налаштування .env

---

**Потрібна допомога?** Перечитай відповідний розділ в AUTO_DEPLOY_GUIDE.md
