# 🗄️ Структура бази даних

## Огляд

Проект використовує PostgreSQL з Prisma ORM.

### Таблиці
- `users` - користувачі системи
- `tenders` - перевезення (тендери)
- `tender_routes` - точки маршруту (завантаження/вигрузка)

## Діаграма зв'язків

```
┌─────────────┐
│    users    │
├─────────────┤
│ id          │◄─────┐
│ email       │      │
│ password    │      │
│ name        │      │
│ created_at  │      │
│ updated_at  │      │
└─────────────┘      │
                     │ 1:N
                     │
┌─────────────────┐  │
│    tenders      │  │
├─────────────────┤  │
│ id              │  │
│ user_id         │──┘
│ load_date       │
│ unload_date     │
│ driver_name     │
│ driver_phone    │
│ vehicle_info    │◄─────┐
│ owner_name      │      │
│ owner_phone     │      │
│ client_name     │      │
│ client_phone    │      │
│ client_payment  │      │
│ my_margin       │      │
│ margin_payer    │      │
│ status          │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │ 1:N
                         │
┌──────────────────┐     │
│  tender_routes   │     │
├──────────────────┤     │
│ id               │     │
│ tender_id        │─────┘
│ type             │ (load/unload)
│ sequence         │ (порядок)
│ name             │
│ lat              │
│ lng              │
│ display_name     │
│ created_at       │
└──────────────────┘
```

## Детальний опис таблиць

### users (Користувачі)

```sql
CREATE TABLE users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

**Поля:**
- `id` - унікальний ідентифікатор (cuid)
- `email` - email користувача (унікальний)
- `password` - хеш пароля (bcrypt)
- `name` - ім'я користувача
- `created_at` - дата створення
- `updated_at` - дата оновлення

**Індекси:**
- PRIMARY KEY на `id`
- UNIQUE на `email`

### tenders (Перевезення)

```sql
CREATE TABLE tenders (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Дати
    load_date       TIMESTAMP NOT NULL,
    unload_date     TIMESTAMP,
    
    -- Водій
    driver_name     TEXT NOT NULL,
    driver_phone    TEXT NOT NULL,
    vehicle_info    TEXT NOT NULL,
    
    -- Власник
    owner_name      TEXT,
    owner_phone     TEXT,
    
    -- Замовник
    client_name     TEXT NOT NULL,
    client_phone    TEXT,
    
    -- Фінанси
    client_payment  DECIMAL NOT NULL,
    my_margin       DECIMAL NOT NULL,
    margin_payer    TEXT DEFAULT 'client',
    
    -- Статус
    status          TEXT DEFAULT 'pending',
    
    -- Метадані
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenders_user_id ON tenders(user_id);
CREATE INDEX idx_tenders_load_date ON tenders(load_date);
CREATE INDEX idx_tenders_status ON tenders(status);
```

**Поля:**
- `id` - унікальний ідентифікатор
- `user_id` - зв'язок з користувачем
- `load_date` - дата завантаження (обов'язкова)
- `unload_date` - дата вигрузки (опціональна)
- `driver_name` - ім'я водія (обов'язкове)
- `driver_phone` - телефон водія (обов'язковий)
- `vehicle_info` - дані авто (обов'язкове, наприклад: "ДАФ АТ7654ВС / АХ5566ВХ")
- `owner_name` - ім'я власника (опціональне)
- `owner_phone` - телефон власника (опціональний)
- `client_name` - ім'я замовника (обов'язкове)
- `client_phone` - телефон замовника (опціональний)
- `client_payment` - оплата від замовника
- `my_margin` - ваша маржа
- `margin_payer` - хто платить маржу ("client" або "carrier")
- `status` - статус ("pending", "waiting", "paid")
- `created_at` - дата створення
- `updated_at` - дата оновлення

**Індекси:**
- PRIMARY KEY на `id`
- INDEX на `user_id` (для швидкого пошуку рейсів користувача)
- INDEX на `load_date` (для сортування по даті)
- INDEX на `status` (для фільтрації по статусу)

### tender_routes (Маршрути)

```sql
CREATE TABLE tender_routes (
    id              TEXT PRIMARY KEY,
    tender_id       TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,  -- 'load' або 'unload'
    sequence        INTEGER NOT NULL,
    name            TEXT NOT NULL,
    lat             DECIMAL NOT NULL,
    lng             DECIMAL NOT NULL,
    display_name    TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tender_routes_tender_id ON tender_routes(tender_id);
CREATE INDEX idx_tender_routes_type ON tender_routes(type);
```

**Поля:**
- `id` - унікальний ідентифікатор
- `tender_id` - зв'язок з тендером
- `type` - тип точки ("load" - завантаження, "unload" - вигрузка)
- `sequence` - порядковий номер точки (0, 1, 2, ...)
- `name` - повна назва з OpenStreetMap
- `lat` - широта
- `lng` - довгота
- `display_name` - коротка назва для відображення
- `created_at` - дата створення

**Індекси:**
- PRIMARY KEY на `id`
- INDEX на `tender_id` (для швидкого пошуку маршрутів тендера)
- INDEX на `type` (для фільтрації по типу)

## Приклади запитів

### Отримати всі тендери користувача з маршрутами

```typescript
const tenders = await prisma.tender.findMany({
  where: { user_id: userId },
  include: {
    routes: {
      orderBy: { sequence: 'asc' }
    }
  },
  orderBy: { load_date: 'desc' }
});
```

### Створити новий тендер

```typescript
await prisma.tender.create({
  data: {
    user_id: userId,
    load_date: new Date('2026-03-01'),
    driver_name: 'Іван Петренко',
    driver_phone: '+380501234567',
    vehicle_info: 'ДАФ АТ7654ВС / АХ5566ВХ',
    client_name: 'ТОВ "Логістика"',
    client_payment: 15000,
    my_margin: 2000,
    status: 'pending',
    routes: {
      create: [
        {
          type: 'load',
          sequence: 0,
          name: 'Kyiv, Ukraine',
          lat: 50.4501,
          lng: 30.5234,
          display_name: 'Київ'
        },
        {
          type: 'unload',
          sequence: 0,
          name: 'Lviv, Ukraine',
          lat: 49.8397,
          lng: 24.0297,
          display_name: 'Львів'
        }
      ]
    }
  }
});
```

### Пошук тендерів по маршруту

```typescript
const tenders = await prisma.tender.findMany({
  where: {
    routes: {
      some: {
        display_name: {
          contains: 'Київ',
          mode: 'insensitive'
        }
      }
    }
  },
  include: {
    routes: {
      orderBy: { sequence: 'asc' }
    }
  }
});
```

### Статистика по популярних маршрутах

```typescript
const popularRoutes = await prisma.tender_route.groupBy({
  by: ['display_name'],
  _count: {
    id: true
  },
  orderBy: {
    _count: {
      id: 'desc'
    }
  },
  take: 10
});
```

### Фінансова статистика

```typescript
const stats = await prisma.tender.aggregate({
  where: {
    user_id: userId,
    status: 'paid'
  },
  _sum: {
    client_payment: true,
    my_margin: true
  },
  _count: true
});
```

## Міграції

Всі міграції знаходяться в `prisma/migrations/`.

### Історія міграцій

1. `20260227234813_init` - початкова схема
2. `20260228000013_update_schema` - оновлення схеми
3. `20260228002311_simplify_trip_schema` - спрощення
4. `20260228003531_add_multiple_points` - множинні точки
5. `20260301000000_update_trip_fields` - нові поля
6. `20260301000001_make_vehicle_info_required` - vehicle_info обов'язкове
7. `20260301000002_rename_to_tender` - перейменування на tender

### Застосування міграцій

```bash
# Розробка
npx prisma migrate dev

# Production
npx prisma migrate deploy

# Статус
npx prisma migrate status

# Скидання (ОБЕРЕЖНО!)
npx prisma migrate reset
```

## Backup та відновлення

### Створення backup

```bash
# Повний backup
pg_dump tripmanager > backup.sql

# Тільки схема
pg_dump --schema-only tripmanager > schema.sql

# Тільки дані
pg_dump --data-only tripmanager > data.sql
```

### Відновлення

```bash
# Відновити все
psql tripmanager < backup.sql

# Відновити тільки дані
psql tripmanager < data.sql
```

## Оптимізація

### Індекси

Всі важливі поля мають індекси:
- `users.email` - UNIQUE INDEX
- `tenders.user_id` - INDEX
- `tenders.load_date` - INDEX
- `tenders.status` - INDEX
- `tender_routes.tender_id` - INDEX
- `tender_routes.type` - INDEX

### Composite індекси (майбутнє)

```sql
-- Для пошуку по користувачу та статусу
CREATE INDEX idx_tenders_user_status ON tenders(user_id, status);

-- Для пошуку по даті та статусу
CREATE INDEX idx_tenders_date_status ON tenders(load_date, status);
```

## Безпека

### Foreign Keys

Всі зв'язки мають `ON DELETE CASCADE`:
- При видаленні користувача видаляються всі його тендери
- При видаленні тендера видаляються всі його маршрути

### Валідація

Валідація даних відбувається на рівні:
1. Prisma схема (типи, обов'язкові поля)
2. API routes (додаткова валідація)
3. Frontend форми (UX валідація)

## Моніторинг

### Корисні запити для моніторингу

```sql
-- Розмір таблиць
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Кількість записів
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tenders', COUNT(*) FROM tenders
UNION ALL
SELECT 'tender_routes', COUNT(*) FROM tender_routes;

-- Активні з'єднання
SELECT COUNT(*) FROM pg_stat_activity;
```

## Документація

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- `SCHEMA_GUIDE.md` - гід по структурі схеми
- `MIGRATION_GUIDE.md` - гід по міграції
