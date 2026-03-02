# Оновлення Prisma до версії 7.4.2

## Що було зроблено

### 1. Оновлення Prisma
- Оновлено `prisma` до версії `7.4.2`
- Оновлено `@prisma/client` до версії `7.4.2`
- Додано `@prisma/adapter-pg` для роботи з PostgreSQL
- Додано `pg` та `@types/pg` для підключення до бази даних
- Додано `dotenv` для роботи з змінними оточення

### 2. Реструктуризація схеми
Всі моделі Prisma тепер розділені по окремих файлах у папці `prisma/schema/`:

```
prisma/
├── schema/
│   ├── schema.prisma      # Головний файл (generator + datasource)
│   ├── base.prisma        # Енуми (TenderStatus, MarginPayer, RouteType)
│   ├── user.prisma        # Модель User
│   ├── tender.prisma      # Модель Tender
│   └── tender_route.prisma # Модель TenderRoute
```

### 3. Зміни в моделях

#### Назви моделей (PascalCase)
- `user` → `User`
- `tender` → `Tender`
- `tender_route` → `TenderRoute`

#### Назви полів (camelCase)
- `user_id` → `userId`
- `load_date` → `loadDate`
- `unload_date` → `unloadDate`
- `driver_name` → `driverName`
- `driver_phone` → `driverPhone`
- `vehicle_info` → `vehicleInfo`
- `owner_name` → `ownerName`
- `owner_phone` → `ownerPhone`
- `client_name` → `clientName`
- `client_phone` → `clientPhone`
- `client_payment` → `clientPayment`
- `my_margin` → `myMargin`
- `margin_payer` → `marginPayer`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- `tender_id` → `tenderId`
- `display_name` → `displayName`

#### Енуми замість строк
- `status`: `'pending' | 'in_progress' | 'completed' | 'cancelled'` → `TenderStatus` enum
- `margin_payer`: `'client' | 'owner'` → `MarginPayer` enum
- `type`: `'load' | 'unload'` → `RouteType` enum

### 4. Оновлення коду

#### src/lib/db.ts
Додано підтримку Prisma 7 з адаптером PostgreSQL:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

#### src/types/prisma.ts
Оновлено типи для використання згенерованих Prisma типів:
```typescript
export type User = Prisma.UserGetPayload<{}>;
export type Tender = Prisma.TenderGetPayload<{}>;
export type TenderRoute = Prisma.TenderRouteGetPayload<{}>;
export { TenderStatus, MarginPayer, RouteType } from '@prisma/client';
```

#### API Routes
Оновлено всі API роути для використання нових назв моделей та полів:
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/trips/route.ts`
- `src/app/api/trips/[id]/route.ts`
- `src/app/api/trips/[id]/status/route.ts`
- `src/app/api/earnings/route.ts`

### 5. Міграція бази даних
Створено міграцію `20260302091537_fix_schema_structure` яка:
- Додає енуми `TenderStatus`, `MarginPayer`, `RouteType`
- Конвертує існуючі дані в нові енуми
- Додає індекси для покращення продуктивності
- Зберігає всі існуючі дані

### 6. Нові npm скрипти
```json
{
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:migrate:deploy": "prisma migrate deploy",
  "prisma:studio": "prisma studio",
  "prisma:validate": "prisma validate",
  "prisma:format": "prisma format"
}
```

## Як використовувати

### Генерація Prisma Client
```bash
npm run prisma:generate
```

### Створення нової міграції
```bash
npm run prisma:migrate
```

### Застосування міграцій на продакшені
```bash
npm run prisma:migrate:deploy
```

### Відкрити Prisma Studio
```bash
npm run prisma:studio
```

### Валідація схеми
```bash
npm run prisma:validate
```

### Форматування схеми
```bash
npm run prisma:format
```

## Важливі зміни для розробників

1. **Використовуйте camelCase** для полів моделей у коді
2. **Використовуйте енуми** замість строк для статусів та типів
3. **Імпортуйте типи** з `@prisma/client` або `@/types/prisma`
4. **Всі файли схеми** мають бути в папці `prisma/schema/`

## Приклад використання

```typescript
import { prisma } from '@/lib/db';
import { TenderStatus, MarginPayer, RouteType } from '@prisma/client';

// Створення тендера
const tender = await prisma.tender.create({
  data: {
    userId: 'user-id',
    loadDate: new Date(),
    driverName: 'Іван',
    driverPhone: '+380123456789',
    vehicleInfo: 'Mercedes Actros',
    clientName: 'Компанія',
    clientPayment: 5000,
    myMargin: 500,
    marginPayer: MarginPayer.CLIENT,
    status: TenderStatus.PENDING,
    routes: {
      create: [
        {
          type: RouteType.LOADING,
          sequence: 0,
          name: 'Київ',
          lat: 50.4501,
          lng: 30.5234,
          displayName: 'Київ, Україна'
        }
      ]
    }
  }
});

// Отримання тендерів з маршрутами
const tenders = await prisma.tender.findMany({
  where: { userId: 'user-id' },
  include: { routes: true }
});
```

## Переваги нової структури

1. ✅ Краща організація коду - кожна модель в окремому файлі
2. ✅ Типобезпека - використання енумів замість строк
3. ✅ Сучасні конвенції - PascalCase для моделей, camelCase для полів
4. ✅ Покращена продуктивність - додаткові індекси
5. ✅ Легше підтримувати - зміни в одній моделі не впливають на інші
6. ✅ Автоматичне об'єднання файлів - Prisma сам об'єднує всі файли
7. ✅ Найновіша версія Prisma 7 з усіма новими можливостями
