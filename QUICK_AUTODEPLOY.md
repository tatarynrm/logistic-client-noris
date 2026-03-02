# ⚡ Швидкий старт: Автодеплой за 15 хвилин

## На сервері (VPS)

```bash
# 1. Встановлення Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin git -y

# 2. Створення SSH ключа для GitHub
ssh-keygen -t ed25519 -C "github" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub
# Скопіюй ключ і додай в GitHub → Settings → Deploy keys

# 3. Налаштування SSH
cat > ~/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config ~/.ssh/github_deploy

# 4. Клонування проекту
mkdir -p /var/www && cd /var/www
git clone git@github.com:твій-username/твій-репозиторій.git
cd твій-репозиторій

# 5. Створення .env
./generate-env.sh
# АБО вручну:
nano .env
# Вставити:
# DB_PASSWORD=твій-пароль
# JWT_SECRET=твій-секрет
# NODE_ENV=production

# 6. Перший запуск
chmod +x deploy.sh docker-entrypoint.sh
docker compose up -d --build

# 7. Створення ключа для GitHub Actions
ssh-keygen -t ed25519 -C "actions" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions
# Скопіюй ВЕСЬ приватний ключ
```

---

## На GitHub

### 1. Додай Deploy Key
- Settings → Deploy keys → Add deploy key
- Вставити публічний ключ з `~/.ssh/github_deploy.pub`
- ✅ Allow write access

### 2. Додай Secrets
Settings → Secrets and variables → Actions → New repository secret

Додай 4 секрети:
- `VPS_HOST` = IP твого сервера (185.123.45.67)
- `VPS_USERNAME` = root
- `VPS_SSH_KEY` = приватний ключ з `~/.ssh/github_actions`
- `VPS_PROJECT_PATH` = /var/www/твій-репозиторій

---

## На своєму комп'ютері

```bash
# 1. Файл вже створено: .github/workflows/deploy.yml
# Перевір що гілка правильна (main або master)

# 2. Закоміть і запуш
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy"
git push origin main

# 3. Перевір деплой
# GitHub → Actions → Дочекайся зеленої галочки ✅
```

---

## Тестування

```bash
# Зроби будь-яку зміну
echo "# Test" >> README.md
git add .
git commit -m "Test auto-deploy"
git push origin main

# Перевір GitHub Actions
# Через 3-5 хвилин зміни будуть на сервері!
```

---

## Готово! 🎉

Тепер кожен `git push` автоматично оновлює сервер!

Детальна інструкція: [AUTO_DEPLOY_GUIDE.md](./AUTO_DEPLOY_GUIDE.md)
