# Prisma Schema Structure

Цей проект використовує **Prisma 7** з підтримкою мультифайлової структури схеми.

## Структура файлів

```
prisma/
├── schema/
│   ├── schema.prisma      # Головний файл з generator та datasource
│   ├── base.prisma        # Енуми та базові типи
│   ├── user.prisma        # Модель User
│   ├── tender.prisma      # Модель Tender
│   └── tender_route.prisma # Модель TenderRoute
├── migrations/            # Міграції бази даних
└── prisma.config.ts       # Конфігурація Prisma
```

## Моделі

### User
Користувачі системи з аутентифікацією.

### Tender
Основна модель для управління поїздками/тендерами.

### TenderRoute
Маршрути завантаження/розвантаження для тендерів.

## Енуми

### TenderStatus
- `PENDING` - Очікує
- `IN_PROGRESS` - В процесі
- `COMPLETED` - Завершено
- `CANCELLED` - Скасовано

### MarginPayer
- `CLIENT` - Клієнт платить маржу
- `OWNER` - Власник платить маржу

### RouteType
- `LOADING` - Точка завантаження
- `UNLOADING` - Точка розвантаження

## Команди

```bash
# Валідація схеми
npx prisma validate

# Генерація Prisma Client
npx prisma generate

# Створення міграції
npx prisma migrate dev --name migration_name

# Застосування міграцій
npx prisma migrate deploy

# Відкрити Prisma Studio
npx prisma studio
```

## Важливо

- Всі файли `.prisma` мають бути в папці `prisma/schema/`
- Файл `schema.prisma` містить тільки `generator` та `datasource` блоки
- Моделі можуть посилатися одна на одну між файлами без імпортів
- Prisma автоматично об'єднує всі файли при генерації
