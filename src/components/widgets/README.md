# Система віджетів

## Архітектура

Система віджетів побудована на модульній архітектурі, що дозволяє легко додавати нові віджети без зміни основного коду.

### Структура

```
widgets/
├── WidgetSystem.tsx      # Головний компонент системи віджетів
├── WeatherWidget.tsx     # Віджет погоди
├── CurrencyRates.tsx     # Віджет курсів валют (перенесений)
└── README.md            # Документація
```

## Як додати новий віджет

### 1. Створіть компонент віджета

```tsx
// widgets/MyWidget.tsx
'use client';

export default function MyWidget() {
  return (
    <div>
      <h3>Мій віджет</h3>
      {/* Ваш контент */}
    </div>
  );
}
```

### 2. Зареєструйте віджет у WidgetSystem

```tsx
// widgets/WidgetSystem.tsx
import MyWidget from './MyWidget';

const AVAILABLE_WIDGETS: Widget[] = [
  // ... існуючі віджети
  {
    id: 'my-widget',
    name: 'Мій віджет',
    icon: '🎯',
    component: MyWidget,
  },
];
```

## Доступні віджети

### 💱 Курси валют
- Показує актуальні курси USD, EUR, PLN
- Оновлюється автоматично
- Джерело: PrivatBank API

### 🌤️ Погода
- Погода для основних міст України
- Температура, вологість, швидкість вітру
- Джерело: Open-Meteo API (безкоштовний)

## Ідеї для майбутніх віджетів

### 📊 Статистика
- Графіки заробітку по місяцях
- Топ маршрутів
- Топ замовників
- Середня маржа

### 📅 Календар
- Рейси на тиждень/місяць
- Нагадування про важливі дати
- Інтеграція з Google Calendar

### 🚗 Транспорт
- Список всіх авто
- Статистика по кожному авто
- Витрати на обслуговування

### 👥 Контакти
- Швидкий доступ до контактів водіїв
- Швидкий доступ до контактів замовників
- Історія співпраці

### 💰 Фінанси
- Очікувані платежі
- Борги
- Прогноз доходу

### 📱 Повідомлення
- SMS нагадування водіям
- Email звіти замовникам
- Telegram інтеграція

### 🗺️ Карта
- Поточні рейси на карті
- Популярні маршрути
- Аналіз відстаней

### 📈 Аналітика
- Порівняння періодів
- Тренди
- Прогнози

## Технічні деталі

### Інтерфейс Widget

```typescript
interface Widget {
  id: string;              // Унікальний ідентифікатор
  name: string;            // Назва для відображення
  icon: string;            // Емодзі іконка
  component: React.ComponentType;  // React компонент
}
```

### Особливості

- **Модальне вікно**: Всі віджети відкриваються в єдиному модальному вікні
- **Sidebar навігація**: Список віджетів зліва для швидкого перемикання
- **Responsive**: Адаптивний дизайн для всіх пристроїв
- **Lazy loading**: Компоненти завантажуються тільки при відкритті
- **Ізоляція**: Кожен віджет незалежний від інших

### Стилізація

Віджети використовують Tailwind CSS з підтримкою темної теми:
- `dark:` префікс для темної теми
- Консистентні кольори з основним додатком
- Плавні анімації та переходи

## Best Practices

1. **Продуктивність**: Використовуйте React.memo для важких компонентів
2. **Помилки**: Обробляйте помилки завантаження даних
3. **Завантаження**: Показуйте індикатори завантаження
4. **Доступність**: Додавайте aria-labels
5. **Мобільність**: Тестуйте на мобільних пристроях

## Приклад повного віджета

```tsx
'use client';

import { useState, useEffect } from 'react';

interface MyData {
  value: number;
  label: string;
}

export default function MyWidget() {
  const [data, setData] = useState<MyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/my-data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{data?.label}</h3>
        <p className="text-4xl font-bold">{data?.value}</p>
      </div>
    </div>
  );
}
```

## Підтримка

Для питань та пропозицій створюйте issue в репозиторії проекту.
