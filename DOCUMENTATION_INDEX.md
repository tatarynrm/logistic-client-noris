# 📚 Індекс документації

Повний список всієї документації проекту.

---

## 🚀 Швидкий старт

### Для новачків
1. **[QUICK_START.md](./QUICK_START.md)** - Запуск за 5 хвилин
2. **[QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md)** - Автодеплой за 15 хвилин
3. **[CHECKLIST.md](./CHECKLIST.md)** - Чеклист налаштування
4. **[CHEATSHEET.md](./CHEATSHEET.md)** - Шпаргалка команд

### Для досвідчених
- **[README.md](./README.md)** - Огляд проекту
- **[AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)** - Повна інструкція автодеплою

---

## 🐳 Docker

### Основні файли
- **[Dockerfile](./Dockerfile)** - Docker образ
- **[docker-compose.yml](./docker-compose.yml)** - Production конфігурація
- **[docker-compose.dev.yml](./docker-compose.dev.yml)** - Development конфігурація
- **[.dockerignore](./.dockerignore)** - Ігноровані файли
- **[docker-entrypoint.sh](./docker-entrypoint.sh)** - Entrypoint скрипт

### Документація
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Повна інструкція по Docker
  - Локальна розробка
  - Production деплой
  - Troubleshooting
  - Моніторинг
  - Backup

---

## 🔄 CI/CD та Автодеплой

### GitHub Actions
- **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)** - Workflow автодеплою

### Документація
- **[AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)** - Повна інструкція (10 частин)
  - Підготовка сервера
  - Налаштування GitHub
  - Клонування проекту
  - Налаштування проекту
  - GitHub Actions
  - Nginx + SSL
  - Тестування
  - Troubleshooting

- **[QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md)** - Швидка інструкція
- **[FIX_SERVER.md](./FIX_SERVER.md)** - Виправлення помилок на сервері

---

## 🗄️ База даних (Prisma)

### Схема
- **[prisma/schema/schema.prisma](./prisma/schema/schema.prisma)** - Головний файл
- **[prisma/schema/base.prisma](./prisma/schema/base.prisma)** - Енуми
- **[prisma/schema/user.prisma](./prisma/schema/user.prisma)** - Модель User
- **[prisma/schema/tender.prisma](./prisma/schema/tender.prisma)** - Модель Tender
- **[prisma/schema/tender_route.prisma](./prisma/schema/tender_route.prisma)** - Модель TenderRoute
- **[prisma.config.ts](./prisma.config.ts)** - Конфігурація Prisma

### Документація
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Структура бази даних
- **[PRISMA_UPGRADE.md](./PRISMA_UPGRADE.md)** - Оновлення до Prisma 7
- **[prisma/schema/README.md](./prisma/schema/README.md)** - Структура схеми
- **[SCHEMA_GUIDE.md](./prisma/SCHEMA_GUIDE.md)** - Гайд по схемі (якщо є)

---

## 🔐 Налаштування та Безпека

### Змінні оточення
- **[.env.example](./.env.example)** - Приклад .env
- **[.env.production](./.env.production)** - Шаблон для production

### Документація
- **[ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md)** - Повний гайд по .env
  - Як генерувати паролі
  - Вимоги до безпеки
  - Troubleshooting

---

## 🛠️ Скрипти

### Автоматизація
- **[setup-server.sh](./setup-server.sh)** - Автоналаштування VPS
- **[generate-env.sh](./generate-env.sh)** - Генерація .env
- **[deploy.sh](./deploy.sh)** - Скрипт деплою
- **[docker-entrypoint.sh](./docker-entrypoint.sh)** - Docker entrypoint

### Старі скрипти (якщо є)
- **[scripts/deploy.sh](./scripts/deploy.sh)** - Старий деплой скрипт
- **[scripts/setup-vps.sh](./scripts/setup-vps.sh)** - Старий setup скрипт
- **[scripts/rollback.sh](./scripts/rollback.sh)** - Rollback скрипт

---

## 📖 Додаткова документація

### Деплой
- **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** - Старий гайд (PM2)

### Чеклісти та шпаргалки
- **[CHECKLIST.md](./CHECKLIST.md)** - Чеклист налаштування
- **[CHEATSHEET.md](./CHEATSHEET.md)** - Шпаргалка команд

---

## 🎯 Рекомендований порядок читання

### Якщо ти новачок:
1. [README.md](./README.md) - Огляд проекту
2. [QUICK_START.md](./QUICK_START.md) - Локальний запуск
3. [QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md) - Швидкий автодеплой
4. [CHECKLIST.md](./CHECKLIST.md) - Перевірка що все працює
5. [CHEATSHEET.md](./CHEATSHEET.md) - Збережи для швидкого доступу

### Якщо хочеш зрозуміти деталі:
1. [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md) - Повна інструкція
2. [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Все про Docker
3. [ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md) - Безпека
4. [PRISMA_UPGRADE.md](./PRISMA_UPGRADE.md) - Prisma 7

### Якщо щось не працює:
1. [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) → Troubleshooting
2. [FIX_SERVER.md](./FIX_SERVER.md) - Виправлення помилок
3. [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md) → Troubleshooting
4. [CHEATSHEET.md](./CHEATSHEET.md) → Troubleshooting

---

## 🔍 Пошук по темах

### Docker
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- [QUICK_START.md](./QUICK_START.md)

### Автодеплой
- [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)
- [QUICK_AUTODEPLOY.md](./QUICK_AUTODEPLOY.md)
- [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)
- [setup-server.sh](./setup-server.sh)

### База даних
- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)
- [PRISMA_UPGRADE.md](./PRISMA_UPGRADE.md)
- [prisma/schema/README.md](./prisma/schema/README.md)

### Безпека
- [ENV_PRODUCTION_GUIDE.md](./ENV_PRODUCTION_GUIDE.md)
- [generate-env.sh](./generate-env.sh)
- [.env.production](./.env.production)

### Команди
- [CHEATSHEET.md](./CHEATSHEET.md)
- [package.json](./package.json) → scripts

---

## 📊 Статистика документації

- **Всього файлів:** 20+
- **Гайдів:** 8
- **Конфігураційних файлів:** 6
- **Скриптів:** 4
- **Чеклістів:** 2

---

## 💡 Поради

1. **Почни з README.md** - там огляд всього проекту
2. **Використовуй QUICK_START** - для швидкого старту
3. **Збережи CHEATSHEET** - для щоденної роботи
4. **Читай AUTO_DEPLOY_GUIDE** - якщо хочеш зрозуміти як все працює
5. **Використовуй CHECKLIST** - щоб нічого не забути

---

## 🆘 Потрібна допомога?

1. Перевір [CHECKLIST.md](./CHECKLIST.md) - можливо щось пропустив
2. Подивись [CHEATSHEET.md](./CHEATSHEET.md) → Troubleshooting
3. Прочитай відповідний розділ в повному гайді
4. Перевір логи: `docker compose logs -f app`

---

Ця документація постійно оновлюється. Якщо знайшов помилку або є пропозиції - створи Issue на GitHub!

**Версія документації:** 1.0.0  
**Дата оновлення:** 2 березня 2026
