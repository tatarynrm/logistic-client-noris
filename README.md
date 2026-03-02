# 🚚 Logistic Manager - Система управління рейсами

Повнофункціональна система для управління логістичними рейсами з автоматичним деплоєм на VPS через Docker.

## 🚀 Технології

- **Next.js 14** - React фреймворк
- **TypeScript** - Типобезпечність
- **Prisma 7** - ORM для PostgreSQL (мультифайлова структура)
- **TanStack Query** - Кешування та управління серверним станом
- **React Hook Form** - Управління формами
- **Zod** - Валідація схем
- **Tailwind CSS** - Стилізація
- **Socket.io** - Real-time оновлення
- **Docker** - Контейнеризація
- **GitHub Actions** - CI/CD автодеплой

## 📋 Функціонал

- ✅ Авторизація та реєстрація
- ✅ Створення та редагування рейсів
- ✅ Управління статусами рейсів
- ✅ Статистика заробітку
- ✅ Real-time оновлення через WebSocket
- ✅ Пошук та фільтрація рейсів
- ✅ Адаптивний дизайн
- ✅ Темна/світла тема
- ✅ Автоматичний деплой

---

## 📚 Документація

### 🚀 Швидкий старт
- **[QUICK_START.md](./QUICK_START.md)** - Запуск за 5 хвилин
- **[QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md)** - Автодеплой за 15 хвилин
- **[CHECKLIST.md](./CHECKLIST.md)** - Чеклист налаштування
- **[CHEATSHEET.md](./CHEATSHEET.md)** - Шпаргалка команд

### 🐳 Docker
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Повна інструкція по Docker
- **[docker-compose.yml](./docker-compose.yml)** - Production конфігурація
- **[docker-compose.dev.yml](./docker-compose.dev.yml)** - Development конфігурація

### 🔄 Автодеплой
- **[AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)** - Повна інструкція з автодеплою
- **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)** - GitHub Actions workflow
- **[WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md)** - Візуальна схема процесу

### 🗄️ База даних
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Структура бази даних
- **[PRISMA_UPGRADE.md](./PRISMA_UPGRADE.md)** - Оновлення до Prisma 7
- **[prisma/schema/README.md](./prisma/schema/README.md)** - Структура Prisma схеми

### 🔐 Налаштування
- **[ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md)** - Налаштування .env для production
- **[.env.example](./.env.example)** - Приклад змінних оточення

### 📖 Додатково
- **[FAQ.md](./FAQ.md)** - Часті питання
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Повний індекс документації

### 🛠️ Скрипти
- **[setup-server.sh](./setup-server.sh)** - Автоматичне налаштування VPS
- **[generate-env.sh](./generate-env.sh)** - Генерація .env файлу
- **[deploy.sh](./deploy.sh)** - Скрипт деплою

---

## ⚡ Швидкий старт

### Локально (тільки БД в Docker)
```bash
npm run docker:dev:up
npm install
npm run prisma:migrate:deploy
npm run dev
```

### Локально (повний стек в Docker)
```bash
docker compose up --build
```

### На сервері (VPS)
```bash
# 1. Автоматичне налаштування сервера
chmod +x setup-server.sh
./setup-server.sh

# 2. Клонування проекту
git clone git@github.com:your-username/your-repo.git
cd your-repo

# 3. Створення .env
./generate-env.sh

# 4. Запуск
docker compose up -d --build
```

Детальніше: [QUICK_START.md](./QUICK_START.md)

---

## 🔄 Автоматичний деплой

### Налаштування (одноразово)
1. Запусти `setup-server.sh` на VPS
2. Додай Deploy Key в GitHub
3. Додай Secrets в GitHub Actions
4. Закоміть `.github/workflows/deploy.yml`

### Щоденна робота
```bash
git add .
git commit -m "your changes"
git push origin main
```

GitHub Actions автоматично задеплоїть на сервер! ✨

Детальніше: [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)

---

## 🏗️ Структура проекту

```
logistic-client/
├── .github/workflows/     # GitHub Actions (автодеплой)
├── src/
│   ├── app/              # Next.js сторінки та API routes
│   ├── components/       # React компоненти
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Утиліти та конфігурація
│   └── types/            # TypeScript типи
├── prisma/
│   └── schema/           # Prisma моделі (мультифайлова структура)
│       ├── schema.prisma # Головний файл
│       ├── base.prisma   # Енуми
│       ├── user.prisma   # Модель User
│       ├── tender.prisma # Модель Tender
│       └── tender_route.prisma # Модель TenderRoute
├── Dockerfile            # Docker образ
├── docker-compose.yml    # Production конфігурація
└── deploy.sh             # Скрипт деплою
```

---

## 🔧 Корисні команди

### NPM скрипти
```bash
# Розробка
npm run dev                    # Запустити dev сервер
npm run build                  # Зібрати для production
npm start                      # Запустити production

# Prisma
npm run prisma:generate        # Згенерувати клієнт
npm run prisma:migrate         # Створити міграцію
npm run prisma:migrate:deploy  # Застосувати міграції
npm run prisma:studio          # Відкрити Prisma Studio
npm run prisma:validate        # Валідувати схему

# Docker
npm run docker:dev:up          # Запустити БД (dev)
npm run docker:dev:down        # Зупинити БД (dev)
npm run docker:prod:build      # Збудувати образи
npm run docker:prod:up         # Запустити все
npm run docker:prod:down       # Зупинити все
npm run docker:logs            # Переглянути логи
```

### Docker команди
```bash
# Запуск
docker compose up -d --build   # Збудувати і запустити
docker compose down            # Зупинити
docker compose restart app     # Перезапустити додаток

# Моніторинг
docker compose ps              # Статус контейнерів
docker compose logs -f app     # Логи додатку
docker stats                   # Використання ресурсів

# Очищення
docker system prune -f         # Видалити невикористовувані ресурси
```

---

## 🔐 Змінні оточення

### Development (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trip-manager"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Production (.env на VPS)
```env
DB_PASSWORD="strong-random-password-min-16-chars"
JWT_SECRET="very-long-random-secret-min-64-chars"
NODE_ENV="production"
```

Генерація паролів:
```bash
./generate-env.sh
```

Детальніше: [ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md)

---

## 🎯 Особливості

### Prisma 7 з мультифайловою структурою
- Кожна модель в окремому файлі
- Енуми замість строк для статусів
- PascalCase для моделей, camelCase для полів
- Автоматичне об'єднання файлів

### TanStack Query
- Автоматичне кешування
- Оптимістичні оновлення
- Автоматична синхронізація

### Docker
- Multi-stage build для оптимізації
- Автоматичні міграції при старті
- Health checks для бази даних

### GitHub Actions
- Автоматичний деплой при push
- SSH підключення до VPS
- Логи деплою в GitHub

---

## 🐛 Troubleshooting

### Docker не запускається
```bash
docker compose logs -f
docker compose down -v
docker compose up -d --build
```

### База даних не підключається
```bash
docker compose ps postgres
docker compose logs postgres
```

### Автодеплой не працює
```bash
# На сервері
cd /var/www/your-repo
git pull
docker compose logs -f
```

Детальніше: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md#troubleshooting)

---

## 📊 Моніторинг

### На сервері
```bash
docker compose ps              # Статус
docker compose logs -f app     # Логи
docker stats                   # Ресурси
```

### На GitHub
- **Actions** → Історія деплоїв
- Логи кожного деплою
- Статус успішності

---

## 🔒 Безпека

- ✅ Сильні паролі (генеруються автоматично)
- ✅ JWT токени для аутентифікації
- ✅ HTTPS через Let's Encrypt
- ✅ Firewall налаштування
- ✅ .env не комітиться в Git
- ✅ SSH ключі для деплою

---

## 📝 Ліцензія

MIT

## 👨‍💻 Автор

Створено з ❤️ за допомогою Kiro AI

---

**Версія:** 3.0.0 (Prisma 7 + Docker + Auto-deploy)  
**Дата:** 2 березня 2026
