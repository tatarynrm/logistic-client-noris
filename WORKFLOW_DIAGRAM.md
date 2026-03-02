# 🔄 Діаграма робочого процесу

## Автоматичний деплой - Як це працює?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТВІЙ КОМП'ЮТЕР                               │
│                                                                 │
│  1. Робиш зміни в коді                                         │
│     ├── Редагуєш файли                                         │
│     ├── git add .                                              │
│     ├── git commit -m "update"                                 │
│     └── git push origin main                                   │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GITHUB                                    │
│                                                                 │
│  2. GitHub отримує push                                        │
│     ├── Зберігає код в репозиторії                            │
│     └── Запускає GitHub Actions                               │
│                                                                 │
│  3. GitHub Actions (Workflow)                                  │
│     ├── Читає .github/workflows/deploy.yml                    │
│     ├── Бере Secrets (VPS_HOST, VPS_SSH_KEY)                 │
│     └── Підключається до VPS через SSH                        │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS СЕРВЕР                                   │
│                                                                 │
│  4. GitHub Actions виконує команди:                            │
│     ├── cd /var/www/твій-проект                               │
│     ├── git pull origin main                                   │
│     ├── docker compose down                                    │
│     └── docker compose up -d --build                           │
│                                                                 │
│  5. Docker:                                                     │
│     ├── Збудовує новий образ (Dockerfile)                     │
│     ├── Встановлює залежності (npm ci)                        │
│     ├── Генерує Prisma Client                                 │
│     ├── Будує Next.js (npm run build)                         │
│     └── Запускає контейнери                                    │
│                                                                 │
│  6. Контейнери запускаються:                                   │
│     ├── PostgreSQL (база даних)                               │
│     └── App (твій додаток)                                     │
│                                                                 │
│  7. Entrypoint скрипт:                                         │
│     ├── Застосовує міграції (prisma migrate deploy)           │
│     └── Запускає додаток (npm start)                          │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ДОДАТОК ПРАЦЮЄ!                                │
│                                                                 │
│  ✅ Нова версія доступна на http://твій-домен.com             │
│  ✅ Всі зміни застосовані                                      │
│  ✅ База даних оновлена                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Часова лінія деплою

```
0:00  │ git push origin main
      │
0:05  │ GitHub отримує код
      │ ├── Зберігає в репозиторії
      │ └── Запускає GitHub Actions
      │
0:10  │ GitHub Actions підключається до VPS
      │ └── SSH з'єднання встановлено
      │
0:15  │ git pull на VPS
      │ └── Код оновлено
      │
0:20  │ docker compose down
      │ └── Старі контейнери зупинено
      │
0:30  │ docker compose build
      │ ├── Збудова образу (2-3 хв)
      │ ├── npm ci
      │ ├── prisma generate
      │ └── npm run build
      │
3:00  │ docker compose up -d
      │ ├── Запуск PostgreSQL
      │ └── Запуск App
      │
3:15  │ Entrypoint скрипт
      │ ├── prisma migrate deploy
      │ └── npm start
      │
3:30  │ ✅ ГОТОВО!
      │ Додаток працює з новою версією
```

---

## Структура файлів на VPS

```
/var/www/твій-проект/
│
├── .git/                      # Git репозиторій
├── .env                       # Змінні оточення (НЕ в Git!)
│   ├── DB_PASSWORD
│   ├── JWT_SECRET
│   └── NODE_ENV=production
│
├── src/                       # Вихідний код
├── prisma/                    # База даних
│   ├── schema/               # Моделі Prisma
│   └── migrations/           # Міграції
│
├── Dockerfile                 # Інструкції для Docker
├── docker-compose.yml         # Конфігурація контейнерів
├── docker-entrypoint.sh       # Скрипт запуску
│
└── node_modules/             # Залежності (в контейнері)
```

---

## Docker контейнери

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS СЕРВЕР                           │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Docker Network: app-network                      │    │
│  │                                                    │    │
│  │  ┌──────────────────┐    ┌──────────────────┐   │    │
│  │  │   PostgreSQL     │    │   App (Next.js)  │   │    │
│  │  │                  │    │                  │   │    │
│  │  │  Port: 5432      │◄───┤  Port: 3000      │   │    │
│  │  │  User: postgres  │    │  Node.js         │   │    │
│  │  │  DB: trip-manager│    │  Prisma Client   │   │    │
│  │  │                  │    │                  │   │    │
│  │  │  Volume:         │    │                  │   │    │
│  │  │  postgres_data   │    │                  │   │    │
│  │  └──────────────────┘    └──────────────────┘   │    │
│  │                                                    │    │
│  └───────────────────────────────────────────────────┘    │
│                              │                             │
│                              ▼                             │
│                      ┌──────────────┐                     │
│                      │    Nginx     │                     │
│                      │  Port: 80    │                     │
│                      │  Port: 443   │                     │
│                      │  (SSL)       │                     │
│                      └──────────────┘                     │
│                              │                             │
└──────────────────────────────┼─────────────────────────────┘
                               │
                               ▼
                        ІНТЕРНЕТ 🌐
                    http://твій-домен.com
```

---

## Процес збудови Docker образу

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILDER STAGE                            │
│                                                             │
│  1. FROM node:20-alpine                                    │
│  2. COPY package*.json                                     │
│  3. COPY prisma/                                           │
│  4. npm ci (встановлення залежностей)                     │
│  5. COPY src/                                              │
│  6. npx prisma generate                                    │
│  7. npm run build (Next.js build)                         │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUNNER STAGE                             │
│                                                             │
│  1. FROM node:20-alpine                                    │
│  2. COPY package*.json                                     │
│  3. npm ci --omit=dev (тільки production)                 │
│  4. COPY --from=builder (готові файли)                    │
│     ├── .next/                                             │
│     ├── node_modules/.prisma/                             │
│     └── src/                                               │
│  5. COPY docker-entrypoint.sh                             │
│  6. EXPOSE 3000                                            │
│  7. ENTRYPOINT ["./docker-entrypoint.sh"]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## GitHub Actions Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  .github/workflows/deploy.yml                              │
│                                                             │
│  on:                                                        │
│    push:                                                    │
│      branches: [main]  ◄── Тригер: push в main            │
│                                                             │
│  jobs:                                                      │
│    deploy:                                                  │
│      runs-on: ubuntu-latest                                │
│                                                             │
│      steps:                                                 │
│        - name: Deploy to VPS                               │
│          uses: appleboy/ssh-action                         │
│          with:                                              │
│            host: ${{ secrets.VPS_HOST }}                   │
│            username: ${{ secrets.VPS_USERNAME }}           │
│            key: ${{ secrets.VPS_SSH_KEY }}                 │
│            script: |                                        │
│              cd ${{ secrets.VPS_PROJECT_PATH }}            │
│              git pull origin main                          │
│              docker compose down                           │
│              docker compose up -d --build                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Потік даних

```
Користувач
    │
    ▼
Браузер (http://domain.com)
    │
    ▼
Nginx (порт 80/443)
    │
    ▼
Docker App Container (порт 3000)
    │
    ├─► Next.js API Routes
    │   │
    │   ▼
    │   Prisma Client
    │   │
    │   ▼
    │   PostgreSQL Container (порт 5432)
    │
    └─► Next.js Pages (SSR/SSG)
        │
        ▼
        HTML → Браузер
```

---

## Безпека та доступи

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB                                   │
│                                                             │
│  Deploy Key (публічний)                                    │
│  ├── Дозволяє: git pull                                    │
│  └── Права: Read + Write                                   │
│                                                             │
│  Secrets (приватні)                                        │
│  ├── VPS_HOST (IP сервера)                                │
│  ├── VPS_USERNAME (root)                                   │
│  ├── VPS_SSH_KEY (приватний ключ)                         │
│  └── VPS_PROJECT_PATH (/var/www/repo)                     │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    VPS СЕРВЕР                               │
│                                                             │
│  ~/.ssh/                                                    │
│  ├── github_deploy (приватний для git)                    │
│  ├── github_deploy.pub (публічний → GitHub)               │
│  ├── github_actions (приватний для Actions)               │
│  ├── github_actions.pub (в authorized_keys)               │
│  └── config (налаштування SSH)                            │
│                                                             │
│  .env (НІКОЛИ не в Git!)                                   │
│  ├── DB_PASSWORD                                           │
│  ├── JWT_SECRET                                            │
│  └── NODE_ENV                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Що відбувається при помилці?

```
Помилка в коді
    │
    ▼
git push
    │
    ▼
GitHub Actions запускається
    │
    ▼
Збудова Docker образу
    │
    ├─► ❌ Помилка компіляції
    │   └─► GitHub Actions: FAILED ❌
    │       └─► Старий додаток продовжує працювати ✅
    │
    ├─► ❌ Помилка тестів
    │   └─► GitHub Actions: FAILED ❌
    │       └─► Старий додаток продовжує працювати ✅
    │
    └─► ✅ Збудова успішна
        └─► Деплой на VPS
            └─► Новий додаток запущено ✅
```

---

Ця діаграма показує повний цикл від коду до production! 🚀
