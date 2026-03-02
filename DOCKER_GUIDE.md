# Docker Guide - Запуск проекту локально та на сервері

## 📦 Структура Docker файлів

```
.
├── Dockerfile              # Образ для production
├── docker-compose.yml      # Production конфігурація (app + db)
├── docker-compose.dev.yml  # Development конфігурація (тільки db)
└── .dockerignore          # Файли які не копіюються в образ
```

---

## 🏠 Локальна розробка

### Варіант 1: Тільки база даних в Docker (рекомендовано)

Запускаєш тільки PostgreSQL в Docker, а додаток локально через npm.

#### 1. Запусти базу даних
```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Налаштуй .env
```bash
cp .env.example .env
```

Переконайся що DATABASE_URL вказує на localhost:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trip-manager"
JWT_SECRET="your-secret-key"
```

#### 3. Застосуй міграції
```bash
npx prisma migrate deploy
# або
npm run prisma:migrate
```

#### 4. Запусти додаток
```bash
npm install
npm run dev
```

#### 5. Відкрий в браузері
```
http://localhost:3000
```

#### Корисні команди:
```bash
# Зупинити базу даних
docker-compose -f docker-compose.dev.yml down

# Зупинити і видалити дані
docker-compose -f docker-compose.dev.yml down -v

# Подивитись логи
docker-compose -f docker-compose.dev.yml logs -f

# Підключитись до PostgreSQL
docker exec -it logistic-db-dev psql -U postgres -d trip-manager
```

---

### Варіант 2: Повний стек в Docker

Запускаєш і базу даних, і додаток в Docker.

#### 1. Створи .env файл
```bash
cp .env.example .env
```

Відредагуй .env:
```env
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

#### 2. Збудуй і запусти
```bash
docker-compose up --build
```

#### 3. Відкрий в браузері
```
http://localhost:3000
```

#### Корисні команди:
```bash
# Запуск в фоновому режимі
docker-compose up -d

# Зупинка
docker-compose down

# Перезапуск тільки app
docker-compose restart app

# Логи
docker-compose logs -f app

# Виконати команду в контейнері
docker-compose exec app npx prisma studio
docker-compose exec app npm run prisma:migrate

# Повне очищення (видалить дані!)
docker-compose down -v
```

---

## 🚀 Запуск на VPS/Сервері

### Підготовка сервера

#### 1. Встанови Docker та Docker Compose
```bash
# Оновлення системи
sudo apt update && sudo apt upgrade -y

# Встановлення Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Додай користувача в групу docker
sudo usermod -aG docker $USER

# Встанови Docker Compose
sudo apt install docker-compose-plugin -y

# Перевір версії
docker --version
docker compose version
```

#### 2. Клонуй проект
```bash
cd /var/www
sudo git clone https://github.com/your-repo/logistic-client.git
cd logistic-client
```

#### 3. Налаштуй .env для production
```bash
sudo nano .env
```

```env
# Production налаштування
DB_PASSWORD=your-strong-password-here
JWT_SECRET=your-very-strong-secret-key-here
NODE_ENV=production
```

⚠️ **ВАЖЛИВО**: Використовуй сильні паролі для production!

#### 4. Запусти проект
```bash
# Збудуй образи
sudo docker-compose build

# Запусти в фоновому режимі
sudo docker-compose up -d

# Перевір статус
sudo docker-compose ps

# Подивись логи
sudo docker-compose logs -f
```

#### 5. Перевір що працює
```bash
curl http://localhost:3000
```

---

### Налаштування Nginx (для доступу через домен)

#### 1. Встанови Nginx
```bash
sudo apt install nginx -y
```

#### 2. Створи конфігурацію
```bash
sudo nano /etc/nginx/sites-available/logistic
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Активуй конфігурацію
```bash
sudo ln -s /etc/nginx/sites-available/logistic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Встанови SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Автоматичний деплой

#### Створи скрипт deploy.sh
```bash
nano deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Зупини контейнери
echo "⏸️  Stopping containers..."
docker-compose down

# Отримай останні зміни
echo "📥 Pulling latest changes..."
git pull origin main

# Збудуй нові образи
echo "🔨 Building images..."
docker-compose build --no-cache

# Запусти контейнери
echo "▶️  Starting containers..."
docker-compose up -d

# Почекай поки база даних запуститься
echo "⏳ Waiting for database..."
sleep 10

# Застосуй міграції
echo "🗄️  Running migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Перевір статус
echo "✅ Checking status..."
docker-compose ps

echo "🎉 Deployment complete!"
```

#### Зроби скрипт виконуваним
```bash
chmod +x deploy.sh
```

#### Використовуй для деплою
```bash
./deploy.sh
```

---

## 🔧 Корисні команди для production

### Моніторинг
```bash
# Статус контейнерів
docker-compose ps

# Логи всіх сервісів
docker-compose logs -f

# Логи тільки app
docker-compose logs -f app

# Логи тільки бази даних
docker-compose logs -f postgres

# Використання ресурсів
docker stats
```

### Управління
```bash
# Перезапуск всього
docker-compose restart

# Перезапуск тільки app
docker-compose restart app

# Зупинка
docker-compose stop

# Запуск
docker-compose start

# Повна зупинка і видалення
docker-compose down

# Видалення з даними (ОБЕРЕЖНО!)
docker-compose down -v
```

### Backup бази даних
```bash
# Створити backup
docker-compose exec postgres pg_dump -U postgres trip-manager > backup_$(date +%Y%m%d_%H%M%S).sql

# Відновити з backup
docker-compose exec -T postgres psql -U postgres trip-manager < backup_20260302_120000.sql
```

### Оновлення проекту
```bash
# Швидке оновлення
git pull
docker-compose up -d --build

# Повне оновлення з міграціями
./deploy.sh
```

### Очищення Docker
```bash
# Видалити невикористовувані образи
docker image prune -a

# Видалити невикористовувані volumes
docker volume prune

# Повне очищення
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Проблема: Контейнер не запускається
```bash
# Подивись детальні логи
docker-compose logs app

# Перевір чи порт не зайнятий
sudo lsof -i :3000
sudo lsof -i :5432
```

### Проблема: База даних не підключається
```bash
# Перевір чи база даних запущена
docker-compose ps postgres

# Перевір логи бази даних
docker-compose logs postgres

# Перевір підключення
docker-compose exec postgres psql -U postgres -d trip-manager
```

### Проблема: Міграції не застосовуються
```bash
# Застосуй міграції вручну
docker-compose exec app npx prisma migrate deploy

# Або зайди в контейнер
docker-compose exec app sh
npx prisma migrate deploy
exit
```

### Проблема: Недостатньо пам'яті
```bash
# Додай обмеження в docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

---

## 📊 Моніторинг та логування

### Встановлення Portainer (опціонально)
```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Відкрий: `http://your-server-ip:9000`

---

## 🔐 Безпека

1. **Змінюй паролі**: Ніколи не використовуй дефолтні паролі в production
2. **Використовуй SSL**: Завжди налаштовуй HTTPS через Let's Encrypt
3. **Обмеж доступ**: Закрий порти бази даних ззовні
4. **Регулярні backup**: Роби backup бази даних щодня
5. **Оновлення**: Регулярно оновлюй Docker образи та залежності

```bash
# Приклад firewall правил
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## 📝 Чеклист для production

- [ ] Змінено всі паролі в .env
- [ ] Налаштовано SSL сертифікат
- [ ] Налаштовано Nginx reverse proxy
- [ ] Налаштовано автоматичні backup
- [ ] Налаштовано firewall
- [ ] Перевірено логи на помилки
- [ ] Протестовано всі функції
- [ ] Налаштовано моніторинг

---

Готово! Тепер ти можеш запускати проект локально та на сервері через Docker 🐳
