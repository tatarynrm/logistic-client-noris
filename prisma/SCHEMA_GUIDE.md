# 📚 Гід по структурі схеми Prisma

## Поточна структура

### Один файл (schema.prisma)
```
prisma/
├── schema.prisma          # Всі моделі в одному файлі
└── migrations/            # Міграції
```

**Переваги:**
- ✅ Простота для малих проектів
- ✅ Все в одному місці
- ✅ Легко знайти моделі

**Недоліки:**
- ❌ Важко підтримувати при багатьох моделях
- ❌ Конфлікти при роботі в команді
- ❌ Важко навігувати у великому файлі

## Рекомендована структура (для великих проектів)

### Варіант 1: Розділення по папках (НЕ ПІДТРИМУЄТЬСЯ PRISMA)

⚠️ **ВАЖЛИВО**: Prisma НЕ підтримує розділення схеми на кілька файлів!

Але можна використовувати інструменти для об'єднання:

```
prisma/
├── schema.prisma          # Головний файл (генерується)
├── schema/                # Окремі моделі
│   ├── user.prisma
│   ├── tender.prisma
│   └── tender_route.prisma
└── scripts/
    └── merge-schemas.js   # Скрипт об'єднання
```

### Варіант 2: Коментарі та секції (РЕКОМЕНДОВАНО)

```prisma
// ============================================
// КОНФІГУРАЦІЯ
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// МОДЕЛЬ: USER (Користувачі)
// ============================================

model user {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tenders   tender[]

  @@map("users")
}

// ============================================
// МОДЕЛЬ: TENDER (Перевезення)
// ============================================

model tender {
  id                    String         @id @default(cuid())
  user_id               String
  user                  user           @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  // Дати
  load_date             DateTime
  unload_date           DateTime?
  
  // Водій
  driver_name           String
  driver_phone          String
  vehicle_info          String
  
  // Власник
  owner_name            String?
  owner_phone           String?
  
  // Замовник
  client_name           String
  client_phone          String?
  
  // Фінанси
  client_payment        Float
  my_margin             Float
  margin_payer          String         @default("client")
  
  // Статус
  status                String         @default("pending")
  
  // Метадані
  created_at            DateTime       @default(now())
  updated_at            DateTime       @updatedAt
  
  // Зв'язки
  routes                tender_route[]

  @@index([user_id])
  @@index([load_date])
  @@index([status])
  @@map("tenders")
}

// ============================================
// МОДЕЛЬ: TENDER_ROUTE (Маршрути)
// ============================================

model tender_route {
  id         String   @id @default(cuid())
  tender_id  String
  tender     tender   @relation(fields: [tender_id], references: [id], onDelete: Cascade)
  
  type       String   // "load" або "unload"
  sequence   Int      // порядок точки
  
  name       String
  lat        Float
  lng        Float
  display_name String @map("display_name")
  
  created_at DateTime @default(now())

  @@index([tender_id])
  @@index([type])
  @@map("tender_routes")
}
```

## Варіант 3: Використання Prisma Schema Builder

Для автоматичного об'єднання файлів:

### 1. Встановіть пакет
```bash
npm install -D prisma-merge
```

### 2. Створіть структуру
```
prisma/
├── schema/
│   ├── base.prisma        # generator + datasource
│   ├── user.prisma
│   ├── tender.prisma
│   └── tender_route.prisma
└── schema.prisma          # Згенерований файл
```

### 3. Створіть скрипт (package.json)
```json
{
  "scripts": {
    "prisma:merge": "prisma-merge -i prisma/schema -o prisma/schema.prisma",
    "prisma:generate": "npm run prisma:merge && prisma generate",
    "prisma:migrate": "npm run prisma:merge && prisma migrate dev"
  }
}
```

### 4. Використання
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Найкращі практики

### 1. Іменування таблиць
```prisma
// ✅ ДОБРЕ: snake_case для таблиць
model user {
  @@map("users")
}

model tender_route {
  @@map("tender_routes")
}

// ❌ ПОГАНО: PascalCase
model User {
  // без @@map
}
```

### 2. Іменування полів
```prisma
// ✅ ДОБРЕ: snake_case
model user {
  created_at DateTime @default(now())
  user_id    String
}

// ❌ ПОГАНО: camelCase
model user {
  createdAt DateTime @default(now())
  userId    String
}
```

### 3. Коментарі
```prisma
// ✅ ДОБРЕ: Детальні коментарі
model tender {
  /// Унікальний ідентифікатор тендера
  id String @id @default(cuid())
  
  /// Дата завантаження (обов'язкова)
  load_date DateTime
  
  /// Дата вигрузки (опціональна)
  unload_date DateTime?
}
```

### 4. Індекси
```prisma
// ✅ ДОБРЕ: Індекси для частих запитів
model tender {
  user_id    String
  load_date  DateTime
  status     String
  
  @@index([user_id])           // Пошук по користувачу
  @@index([load_date])         // Сортування по даті
  @@index([status])            // Фільтр по статусу
  @@index([user_id, status])   // Комбінований індекс
}
```

### 5. Зв'язки
```prisma
// ✅ ДОБРЕ: Явні зв'язки з onDelete
model tender {
  user_id String
  user    user   @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

// ❌ ПОГАНО: Без onDelete
model tender {
  user_id String
  user    user   @relation(fields: [user_id], references: [id])
}
```

## Міграція з Trip на Tender

### Крок 1: Створіть нові таблиці
```sql
-- Створюємо нові таблиці
CREATE TABLE users (LIKE "User");
CREATE TABLE tenders (LIKE "Trip");
CREATE TABLE tender_routes (...);
```

### Крок 2: Скопіюйте дані
```sql
-- Копіюємо користувачів
INSERT INTO users SELECT * FROM "User";

-- Копіюємо тендери
INSERT INTO tenders SELECT * FROM "Trip";

-- Конвертуємо JSON в tender_routes
-- (потрібен окремий скрипт)
```

### Крок 3: Видаліть старі таблиці
```sql
DROP TABLE "Trip";
DROP TABLE "User";
```

## Альтернатива: Prisma Studio

Для візуального управління схемою:

```bash
npx prisma studio
```

Відкриється веб-інтерфейс для:
- Перегляду моделей
- Редагування даних
- Створення зв'язків

## Корисні команди

```bash
# Форматування схеми
npx prisma format

# Валідація схеми
npx prisma validate

# Генерація клієнта
npx prisma generate

# Створення міграції
npx prisma migrate dev --name migration_name

# Застосування міграцій
npx prisma migrate deploy

# Скидання бази даних
npx prisma migrate reset

# Відкриття Prisma Studio
npx prisma studio
```

## Висновок

Для вашого проекту рекомендую:

1. **Зараз**: Використовуйте один файл з коментарями та секціями
2. **Майбутнє**: Якщо проект росте, використовуйте prisma-merge

Це забезпечить:
- ✅ Чистий код
- ✅ Легку навігацію
- ✅ Простоту підтримки
- ✅ Роботу в команді
