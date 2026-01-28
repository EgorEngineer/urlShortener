# URL Shortener

Полнофункциональное приложение для сокращения ссылок на ASP.NET Core 8.0 + React + PostgreSQL.

## Функционал

- ✂️ Сокращение длинных URL
- 📊 Статистика переходов
- 🔗 Генерация уникальных коротких кодов
- 📱 QR-коды для каждой ссылки


## Стек

### Backend
- ASP.NET Core 8.0
- Entity Framework Core 9.0
- PostgreSQL
- QRCoder
- Memory Cache

### Frontend
- React 18
- React Router v6
- Axios
- Vite
- Modern CSS

## Установка и запуск

### Необходимое ПО

- .NET 8.0 SDK
- PostgreSQL 16+
- Node.js 16+
- Docker

### Сборка docker-образов

```bash
# Backend
docker build -t urlshortener-api .

# Frontend
docker build -t urlshortener-frontend ./Front
```

### Переменные окружения для Docker

Backend контейнер поддерживает следующие переменные:

- `ASPNETCORE_ENVIRONMENT` - окружение (Production/Development)
- `ASPNETCORE_URLS` - URL для прослушивания
- `ConnectionStrings__DefaultConnection` - строка подключения к PostgreSQL

#### Frontend

- `DOMAIN_NAME` - доменное имя для nginx server_name
  - По умолчанию: `localhost`
  - Для боевого окружения: укажите ваш домен (например, `yourdomain.com`)

#### База данных (PostgreSQL)

- `DB_PASSWORD` - пароль для PostgreSQL

### Запуск с переменными окружения

#### Локальная разработка (по умолчанию)

```bash
docker-compose up -d
```

#### Продакшн (с настройкой домена)

Создайте файл `.env` в корне проекта:

```env
# База данных
DB_PASSWORD=your_secure_password

# Frontend
DOMAIN_NAME=yourdomain.com
```

Или укажите переменные напрямую:

```bash
DOMAIN_NAME=yourdomain.com DB_PASSWORD=secure_pass docker-compose up -d
```

#### Для обработки любого домена

```bash
DOMAIN_NAME=_ docker-compose up -d
```

### ⚠️ Важно для продакшн

1. **Измените пароль БД**: Установите надежный пароль через `DB_PASSWORD`
2. **Укажите домен**: Задайте `DOMAIN_NAME` для вашего домена
3. **Используйте HTTPS**: Рекомендуется настроить reverse proxy (nginx/Traefik) с SSL сертификатами
4. **Проверьте порты**: Убедитесь, что порты 3000 и 5000 доступны или измените их в `docker-compose.yml`

## Структура проекта

```
UrlShortener/
├── Controllers/           
├── Data/                  
├── Models/                
├── Services/              
├── Front/                 
├── Program.cs             
├── Dockerfile             
├── docker-compose.yml     
└── README.md
```
