# 🚀 Швидкий старт

## Локально (рекомендовано для розробки)

```bash
# 1. Запусти базу даних
npm run docker:dev:up

# 2. Налаштуй .env
cp .env.example .env

# 3. Встанови залежності
npm install

# 4. Застосуй міграції
npm run prisma:migrate:deploy

# 5. Запусти проект
npm run dev
```

Відкрий: http://localhost:3000

---

## Локально через Docker (повний стек)

```bash
# 1. Налаштуй .env
cp .env.example .env

# 2. Запусти все
npm run docker:prod:up

# Або вручну
docker-compose up --build
```

Відкрий: http://localhost:3000

---

## На сервері (VPS)

```bash
# 1. Клонуй проект
git clone https://github.com/your-repo/logistic-client.git
cd logistic-client

# 2. Налаштуй .env
nano .env
# Встав сильні паролі!

# 3. Запусти
docker-compose up -d --build

# 4. Перевір
docker-compose ps
docker-compose logs -f
```

---

## Корисні команди

```bash
# База даних (dev)
npm run docker:dev:up      # Запустити
npm run docker:dev:down    # Зупинити

# Production
npm run docker:prod:build  # Збудувати
npm run docker:prod:up     # Запустити
npm run docker:prod:down   # Зупинити
npm run docker:logs        # Логи

# Prisma
npm run prisma:migrate     # Створити міграцію
npm run prisma:studio      # Відкрити Prisma Studio
npm run prisma:generate    # Згенерувати клієнт
```

Детальніше: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
