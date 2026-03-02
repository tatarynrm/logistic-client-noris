# ❓ Часті питання (FAQ)

## 🚀 Загальні питання

### Що таке автодеплой?
Це коли ти робиш `git push`, і твій код автоматично оновлюється на сервері без ручних дій.

### Скільки часу займає налаштування?
- Перше налаштування: 30-40 хвилин
- Наступні деплої: 3-5 хвилин автоматично

### Чи потрібні знання DevOps?
Ні! Інструкція написана для новачків. Просто слідуй кроково.

---

## 🐳 Docker

### Навіщо Docker?
- Однакове середовище локально та на сервері
- Легке розгортання
- Ізоляція додатку
- Простий rollback

### Чи можна без Docker?
Так, але Docker спрощує деплой в рази. Альтернатива - PM2 + Nginx вручну.

### Скільки займає Docker образ?
~500MB-1GB. Використовується alpine образ для мінімального розміру.

### Чи можна запустити тільки БД в Docker?
Так! Використовуй `docker-compose.dev.yml`:
```bash
npm run docker:dev:up
```

---

## 🔐 Безпека

### Чи безпечно зберігати паролі в .env?
Так, якщо:
- .env НЕ в Git (вже в .gitignore)
- Права доступу `chmod 600 .env`
- Сильні паролі

### Як згенерувати сильний пароль?
```bash
./generate-env.sh
# або
openssl rand -base64 64
```

### Що робити якщо .env потрапив в Git?
1. Видали з Git: `git rm --cached .env`
2. Додай в .gitignore
3. Згенеруй НОВІ паролі
4. Оновити .env на сервері

### Чи потрібен SSL?
Так, для production обов'язково! Використовуй Let's Encrypt (безкоштовно).

---

## 🔄 GitHub Actions

### Чому деплой не запускається?
Перевір:
- [ ] Файл `.github/workflows/deploy.yml` існує
- [ ] Гілка правильна (main або master)
- [ ] Всі Secrets додані в GitHub
- [ ] Deploy Key має права "Allow write access"

### Де подивитись логи деплою?
GitHub → Репозиторій → Actions → Вибрати workflow

### Як зупинити автодеплой?
Видали або перейменуй `.github/workflows/deploy.yml`

### Чи можна деплоїти тільки певні гілки?
Так, змінити в `deploy.yml`:
```yaml
on:
  push:
    branches:
      - production  # тільки ця гілка
```

---

## 🗄️ База даних

### Де зберігаються дані?
В Docker volume `postgres_data`. Дані зберігаються навіть після `docker compose down`.

### Як зробити backup?
```bash
docker compose exec postgres pg_dump -U postgres trip-manager > backup.sql
```

### Як відновити backup?
```bash
docker compose exec -T postgres psql -U postgres trip-manager < backup.sql
```

### Чи втратяться дані при оновленні?
Ні, якщо не використовуєш `docker compose down -v` (прапорець -v видаляє volumes).

### Як змінити пароль БД?
1. Зупини: `docker compose down`
2. Видали volume: `docker volume rm project_postgres_data`
3. Зміни `DB_PASSWORD` в .env
4. Запусти: `docker compose up -d`

---

## 🔧 Troubleshooting

### "Cannot resolve environment variable: DATABASE_URL"
Перевір що .env файл існує і містить `DB_PASSWORD`.

### "Authentication failed" при підключенні до БД
Пароль в .env не співпадає з тим що в контейнері. Видали volume і перезапусти.

### "Port 3000 already in use"
```bash
# Знайди процес
lsof -i :3000
# Вбий процес
kill -9 PID
```

### Деплой failed на GitHub Actions
1. Перевір логи в GitHub Actions
2. Перевір SSH підключення: `ssh root@server-ip`
3. Перевір що всі Secrets правильні

### Docker образ не будується
```bash
# Очисти кеш
docker system prune -af
# Збудуй заново
docker compose build --no-cache
```

### Контейнер постійно перезапускається
```bash
# Подивись логи
docker compose logs -f app
# Зазвичай помилка в коді або міграціях
```

---

## 📊 Продуктивність

### Скільки RAM потрібно?
Мінімум 1GB, рекомендовано 2GB+.

### Скільки CPU потрібно?
1 vCPU достатньо для невеликого навантаження.

### Як оптимізувати Docker образ?
Вже оптимізовано:
- Multi-stage build
- Alpine образ
- Тільки production залежності

### Чи можна масштабувати?
Так, через Docker Swarm або Kubernetes, але для початку достатньо одного сервера.

---

## 🌐 Домен та SSL

### Як підключити домен?
1. Налаштуй A-запис домену на IP сервера
2. Налаштуй Nginx
3. Отримай SSL через certbot

### Скільки коштує домен?
$10-15/рік залежно від зони (.com, .net, .ua)

### Чи можна без домену?
Так, використовуй IP сервера. Але SSL буде складніше налаштувати.

### Як оновити SSL сертифікат?
Автоматично через certbot. Перевір: `certbot renew --dry-run`

---

## 💰 Вартість

### Скільки коштує VPS?
$5-10/місяць для базового сервера (DigitalOcean, Hetzner, Vultr).

### Чи потрібно платити за GitHub Actions?
Ні, для публічних репозиторіїв безкоштовно. Для приватних - 2000 хвилин/місяць безкоштовно.

### Чи потрібно платити за Docker?
Ні, Docker безкоштовний для використання.

---

## 🔄 Оновлення

### Як оновити Prisma?
```bash
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

### Як оновити Next.js?
```bash
npm install next@latest react@latest react-dom@latest
```

### Як оновити Node.js в Docker?
Змінити в Dockerfile: `FROM node:20-alpine` → `FROM node:22-alpine`

---

## 📱 Моніторинг

### Як подивитись логи?
```bash
docker compose logs -f app
```

### Як подивитись використання ресурсів?
```bash
docker stats
```

### Чи є готові рішення для моніторингу?
Так: Portainer, Grafana + Prometheus, Uptime Kuma.

---

## 🚨 Аварійні ситуації

### Сайт не працює!
```bash
# 1. Перевір статус
docker compose ps

# 2. Подивись логи
docker compose logs -f app

# 3. Перезапусти
docker compose restart app
```

### Потрібно відкотити до попередньої версії
```bash
# 1. Знайди попередній коміт
git log --oneline

# 2. Відкоти
git reset --hard COMMIT_HASH
git push -f origin main

# 3. Або на сервері
cd /var/www/repo
git reset --hard COMMIT_HASH
docker compose up -d --build
```

### База даних зламалась
```bash
# Відновити з backup
docker compose exec -T postgres psql -U postgres trip-manager < backup.sql
```

---

## 🎓 Навчання

### Де вчитись Docker?
- [Docker Documentation](https://docs.docker.com/)
- [Docker Tutorial](https://docker-curriculum.com/)

### Де вчитись GitHub Actions?
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Actions Tutorial](https://github.com/skills/hello-github-actions)

### Де вчитись Prisma?
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Tutorial](https://www.prisma.io/docs/getting-started)

---

## 🤝 Підтримка

### Де задати питання?
1. Перечитай відповідний розділ документації
2. Перевір [CHECKLIST.md](./CHECKLIST.md)
3. Подивись [TROUBLESHOOTING](./DOCKER_GUIDE.md#troubleshooting)
4. Створи Issue на GitHub

### Як повідомити про баг?
Створи Issue на GitHub з:
- Описом проблеми
- Кроками для відтворення
- Логами (`docker compose logs`)
- Версією (`docker --version`, `node --version`)

---

## 📝 Інше

### Чи можна використовувати для інших проектів?
Так! Ця конфігурація підходить для будь-якого Next.js + Prisma проекту.

### Чи можна змінити порт?
Так, в `docker-compose.yml` змінити `ports: - "3000:3000"` на інший.

### Чи можна використовувати іншу БД?
Так, але потрібно змінити Prisma provider та docker-compose.yml.

### Як додати Redis/MongoDB/інше?
Додати сервіс в `docker-compose.yml`:
```yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

---

Не знайшов відповідь? Перевір [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) для повного списку документації!
