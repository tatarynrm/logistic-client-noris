# 🚚 Logistic Manager - Система управління рейсами

Повнофункціональна система для управління логістичними рейсами з автоматичним деплоєм на VPS.

## 🚀 Технології

- **Next.js 14** - React фреймворк
- **TypeScript** - Типобезпечність
- **Prisma 5** - ORM для PostgreSQL
- **TanStack Query** - Кешування та управління серверним станом
- **React Hook Form** - Управління формами
- **Zod** - Валідація схем
- **Tailwind CSS** - Стилізація
- **Socket.io** - Real-time оновлення
- **PM2** - Process manager
- **Nginx** - Reverse proxy

## 📋 Функціонал

- ✅ Авторизація та реєстрація
- ✅ Створення та редагування рейсів
- ✅ Управління статусами рейсів
- ✅ Статистика заробітку
- ✅ Real-time оновлення через WebSocket
- ✅ Пошук та фільтрація рейсів
- ✅ Пагінація
- ✅ Темна/світла тема
- ✅ Адаптивний дизайн

## 🏗️ Структура проекту

```
logistic-client/
├── src/
│   ├── app/              # Next.js сторінки та API routes
│   ├── components/       # React компоненти
│   ├── hooks/            # Custom React hooks (TanStack Query)
│   ├── lib/              # Утиліти та конфігурація
│   ├── contexts/         # React contexts
│   └── types/            # TypeScript типи
├── prisma/               # Prisma схема та міграції
├── public/               # Статичні файли
└── scripts/              # Скрипти для деплою
```

## 🚀 Швидкий старт (локально)

### 1. Встановлення залежностей

```bash
cd logistic-client
npm install
```

### 2. Налаштування бази даних

```bash
# Створити базу даних PostgreSQL
createdb tripmanager

# Скопіювати .env.example в .env
cp .env.example .env

# Відредагувати .env з вашими даними
nano .env
```

### 3. Міграції

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Запуск

```bash
npm run dev
```

Відкрийте http://localhost:3000

## 📦 Деплой на VPS

### Повна інструкція

Дивіться **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** для детальної інструкції з:

- Налаштування VPS з нуля
- Встановлення PostgreSQL, Node.js, PM2, Nginx
- Налаштування SSL (Let's Encrypt)
- Автоматичний деплой через GitHub Actions
- Моніторинг та логи

### Швидкий деплой

```bash
# На VPS
cd ~/apps/logistic-app
git pull origin main
cd logistic-client
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart logistic-app
```

## 🔧 Корисні команди

### Розробка

```bash
npm run dev          # Запустити dev сервер
npm run build        # Зібрати для production
npm start            # Запустити production сервер
```

### Prisma

```bash
npx prisma generate           # Згенерувати Prisma Client
npx prisma migrate dev        # Створити міграцію
npx prisma migrate deploy     # Застосувати міграції
npx prisma studio             # Відкрити Prisma Studio
```

### PM2 (на VPS)

```bash
pm2 status                    # Статус додатків
pm2 logs logistic-app         # Переглянути логи
pm2 restart logistic-app      # Перезапустити
pm2 monit                     # Моніторинг
```

## 📚 Документація

- **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** - Повна інструкція з деплою
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - Структура бази даних

## 🔐 Змінні оточення

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tripmanager"
JWT_SECRET="your-secret-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
NODE_ENV="production"
PORT=3000
```

## 🎯 Особливості

### TanStack Query
- Автоматичне кешування запитів
- Оптимістичні оновлення UI
- Автоматична синхронізація даних
- DevTools для дебагу

### React Hook Form + Zod
- Типобезпечні форми
- Автоматична валідація
- Валідація на клієнті та сервері
- Менше boilerplate коду

### Real-time оновлення
- Socket.io для миттєвих оновлень
- Автоматична синхронізація між користувачами
- Підтримка кількох вкладок

## 🐛 Troubleshooting

### База даних не підключається

```bash
# Перевірити статус PostgreSQL
sudo systemctl status postgresql

# Перевірити підключення
psql -U deploy -d tripmanager
```

### Додаток не запускається

```bash
# Перевірити логи
pm2 logs logistic-app

# Перезапустити
pm2 restart logistic-app
```

### Nginx помилки

```bash
# Перевірити конфігурацію
sudo nginx -t

# Переглянути логи
sudo tail -f /var/log/nginx/error.log
```

## 📝 Ліцензія

MIT

## 👨‍💻 Автор

Створено з ❤️ за допомогою Kiro AI

---

**Версія:** 2.0.0  
**Дата:** 2 березня 2026
