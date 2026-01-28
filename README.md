# URL Shortener

Полнофункциональное приложение для сокращения ссылок на ASP.NET Core 8.0 + React + PostgreSQL.

## Функционал

- ✂️ Сокращение длинных URL
- 📊 Статистика переходов по каждой ссылке
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
- `JWT_KEY` - секретный jwt ключ (> 32 символов)

#### Frontend

- `DOMAIN_NAME` - доменное имя для nginx server_name
  - По умолчанию: `localhost`
  - Для боевого окружения: укажите ваш домен (например, `yourdomain.com`)

#### База данных (PostgreSQL)

- `DB_PASSWORD` - пароль для PostgreSQL

### Запуск с переменными окружения

#### Локальная разработка

```bash
docker-compose up -d
```

#### Для обработки любого домена

```bash
DOMAIN_NAME=_ docker-compose up -d
```

## Структура проекта

```
UrlShortener/
├── Controllers/
│   ├── AuthController.cs       
│   ├── LinksController.cs      # Управление ссылками
│   └── RedirectController.cs   # Редиректы
├── Data/
│   └── AppDbContext.cs         
├── Models/
│   ├── User.cs                 
│   └── ShortLink.cs            
├── Services/
│   ├── JwtService.cs           
│   ├── PasswordHasher.cs       
│   ├── LinkGeneratorService.cs # Генерация кодов
│   ├── QRCodeService.cs        # QR-коды
│   └── CacheService.cs         
├── Front/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx       # Страница входа
│   │   │   ├── Register.jsx    # Регистрация
│   │   │   ├── Dashboard.jsx   # Личный кабинет
│   │   │   ├── URLShortener.jsx
│   │   │   └── LinkDetails.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx 
│   │   └── services/
│   │       └── api.js         
│   └── nginx.conf.template     
├── Program.cs
├── Dockerfile
├── docker-compose.yml
└── README.md
```
