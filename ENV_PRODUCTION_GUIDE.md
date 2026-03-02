# 🔐 Production Environment Variables Guide

## Як має виглядати .env на сервері

### Мінімальна конфігурація (для Docker)

```env
# Database password (використовується в docker-compose.yml)
DB_PASSWORD=Qw3rTy!9#Kl2mN8pZ$xC

# JWT Secret для токенів аутентифікації
JWT_SECRET=a8f3d9e2b7c4f1a6e9d3b8c2f7a4e1d9b6c3f8a2e7d4b1c9f6a3e8d2b7c4f1a9

# Node environment
NODE_ENV=production
```

---

## 📝 Детальний опис кожної змінної

### 1. DB_PASSWORD
**Що це:** Пароль для PostgreSQL бази даних в Docker контейнері

**Вимоги:**
- Мінімум 16 символів
- Використовуй великі та малі літери, цифри, спецсимволи
- НЕ використовуй прості паролі типу "password123"

**Як згенерувати:**
```bash
# Варіант 1: Випадковий пароль (20 символів)
openssl rand -base64 20

# Варіант 2: Складний пароль (32 символи)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# Варіант 3: Онлайн генератор
# https://passwordsgenerator.net/
```

**Приклад:**
```env
DB_PASSWORD=Xk9mP2nQ7wR4tY8uI3oL
```

---

### 2. JWT_SECRET
**Що це:** Секретний ключ для підпису JWT токенів (аутентифікація користувачів)

**Вимоги:**
- Мінімум 64 символи (рекомендовано 128+)
- Випадкова послідовність символів
- НІКОЛИ не використовуй один і той же ключ на різних серверах

**Як згенерувати:**
```bash
# Варіант 1: 64 символи
openssl rand -base64 64 | tr -d '\n'

# Варіант 2: 128 символів (найбезпечніше)
openssl rand -base64 128 | tr -d '\n'

# Варіант 3: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Приклад:**
```env
JWT_SECRET=a8f3d9e2b7c4f1a6e9d3b8c2f7a4e1d9b6c3f8a2e7d4b1c9f6a3e8d2b7c4f1a9e6d3b8c2f7a4e1d9
```

---

### 3. NODE_ENV
**Що це:** Режим роботи додатку

**Значення:**
```env
NODE_ENV=production
```

**Важливо:** Завжди `production` на сервері!

---

## 🚀 Швидке налаштування на сервері

### Крок 1: Підключись до VPS
```bash
ssh root@your-server-ip
cd /path/to/your/project
```

### Крок 2: Створи .env файл
```bash
nano .env
```

### Крок 3: Згенеруй паролі прямо на сервері
```bash
# Згенеруй DB_PASSWORD
echo "DB_PASSWORD=$(openssl rand -base64 20 | tr -d '=+/')"

# Згенеруй JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')"
```

### Крок 4: Скопіюй результат в .env
```env
DB_PASSWORD=тут_буде_згенерований_пароль
JWT_SECRET=тут_буде_згенерований_секрет
NODE_ENV=production
```

### Крок 5: Збережи та закрий
```
Ctrl + O  (зберегти)
Enter     (підтвердити)
Ctrl + X  (вийти)
```

### Крок 6: Перевір що файл створено
```bash
cat .env
```

### Крок 7: Встанови правильні права доступу
```bash
chmod 600 .env
```

---

## 🔒 Безпека

### ✅ DO (Роби так):
- Використовуй сильні випадкові паролі
- Генеруй нові паролі для кожного сервера
- Зберігай .env в безпечному місці (password manager)
- Встановлюй права доступу `chmod 600 .env`
- Додай .env в .gitignore (вже додано)
- Регулярно міняй паролі (раз на 3-6 місяців)

### ❌ DON'T (Не роби так):
- НЕ використовуй прості паролі
- НЕ комітуй .env в Git
- НЕ використовуй один пароль на всіх серверах
- НЕ діліться паролями через незахищені канали
- НЕ залишай дефолтні значення

---

## 📋 Повний приклад .env для production

```env
# Database Configuration
DB_PASSWORD=Xk9mP2nQ7wR4tY8uI3oL5aS6dF7gH8jK

# JWT Authentication
JWT_SECRET=a8f3d9e2b7c4f1a6e9d3b8c2f7a4e1d9b6c3f8a2e7d4b1c9f6a3e8d2b7c4f1a9e6d3b8c2f7a4e1d9b6c3f8a2e7d4b1c9

# Environment
NODE_ENV=production
```

---

## 🧪 Перевірка конфігурації

### Після створення .env, перевір:

```bash
# 1. Файл існує
ls -la .env

# 2. Права доступу (має бути -rw-------)
ls -l .env

# 3. Вміст (без показу паролів)
cat .env | sed 's/=.*/=***HIDDEN***/g'

# 4. Змінні доступні в Docker
docker-compose config
```

---

## 🔄 Зміна паролів

Якщо потрібно змінити паролі:

```bash
# 1. Зупини контейнери
docker-compose down

# 2. Відредагуй .env
nano .env

# 3. Видали старі дані бази (ОБЕРЕЖНО!)
docker volume rm logistic-client_postgres_data

# 4. Запусти заново
docker-compose up -d --build
```

---

## 🆘 Troubleshooting

### Проблема: "Cannot resolve environment variable"
**Рішення:** Перевір що .env файл існує в корені проекту
```bash
ls -la .env
cat .env
```

### Проблема: "Authentication failed"
**Рішення:** Перевір що DB_PASSWORD в .env співпадає з тим що використовується
```bash
docker-compose down -v
docker-compose up -d
```

### Проблема: "JWT malformed"
**Рішення:** Згенеруй новий JWT_SECRET
```bash
openssl rand -base64 64 | tr -d '\n'
```

---

## 📚 Додаткові ресурси

- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

---

## 🎯 Швидкий чеклист

- [ ] Створено .env файл на сервері
- [ ] Згенеровано сильний DB_PASSWORD (мін. 16 символів)
- [ ] Згенеровано сильний JWT_SECRET (мін. 64 символи)
- [ ] Встановлено NODE_ENV=production
- [ ] Встановлено права доступу chmod 600 .env
- [ ] .env НЕ закомічено в Git
- [ ] Паролі збережено в безпечному місці
- [ ] Протестовано запуск docker-compose up -d

Готово! Тепер твій production environment налаштовано безпечно 🔐
