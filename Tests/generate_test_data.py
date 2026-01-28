#!/usr/bin/env python3
"""
Генератор тестовых данных для UrlShortener
Создает тестовых пользователей и короткие ссылки для интеграционного тестирования
"""

import os
import json
import random
import string
from datetime import datetime, timedelta
from typing import List, Dict
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Константы
TEST_USERS_COUNT = 5
TEST_LINKS_PER_USER = 10
OUTPUT_DIR = "Tests/results"

class TestDataGenerator:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.conn = None
        self.test_data = {
            "users": [],
            "links": [],
            "generated_at": datetime.now().isoformat()
        }

    def connect(self):
        """Подключение к базе данных"""
        try:
            self.conn = psycopg2.connect(self.database_url)
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            print("✓ Подключение к базе данных установлено")
        except Exception as e:
            print(f"✗ Ошибка подключения к БД: {e}")
            raise

    def close(self):
        """Закрытие соединения"""
        if self.conn:
            self.conn.close()
            print("✓ Соединение с БД закрыто")

    def generate_password_hash(self, password: str) -> str:
        """Простая имитация хеширования пароля для тестов"""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

    def generate_short_code(self, length: int = 7) -> str:
        """Генерация короткого кода"""
        chars = string.ascii_letters + string.digits
        return ''.join(random.choices(chars, k=length))

    def generate_test_users(self) -> List[Dict]:
        """Генерация тестовых пользователей"""
        users = []
        for i in range(TEST_USERS_COUNT):
            user = {
                "username": f"testuser{i+1}",
                "email": f"testuser{i+1}@example.com",
                "password": f"TestPassword{i+1}!",
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30))
            }
            users.append(user)
        return users

    def generate_test_links(self, user_id: int, username: str) -> List[Dict]:
        """Генерация тестовых ссылок для пользователя"""
        links = []
        test_urls = [
            "https://github.com/dotnet/aspnetcore",
            "https://react.dev/learn",
            "https://www.postgresql.org/docs/",
            "https://learn.microsoft.com/en-us/dotnet/",
            "https://developer.mozilla.org/en-US/",
            "https://stackoverflow.com/questions/tagged/asp.net-core",
            "https://www.docker.com/get-started/",
            "https://nodejs.org/en/docs/",
            "https://vitejs.dev/guide/",
            "https://nginx.org/en/docs/"
        ]
        
        for i in range(TEST_LINKS_PER_USER):
            link = {
                "short_code": self.generate_short_code(),
                "original_url": random.choice(test_urls) + f"/{username}/{i}",
                "user_id": user_id,
                "clicks": random.randint(0, 100),
                "created_at": datetime.now() - timedelta(days=random.randint(0, 15))
            }
            links.append(link)
        return links

    def insert_test_data(self):
        """Вставка тестовых данных в базу"""
        cursor = self.conn.cursor()
        
        try:
            # Генерация и вставка пользователей
            users = self.generate_test_users()
            for user in users:
                cursor.execute("""
                    INSERT INTO "Users" ("Username", "Email", "PasswordHash", "CreatedAt")
                    VALUES (%s, %s, %s, %s)
                    RETURNING "Id"
                """, (
                    user["username"],
                    user["email"],
                    self.generate_password_hash(user["password"]),
                    user["created_at"]
                ))
                user_id = cursor.fetchone()[0]
                user["id"] = user_id
                self.test_data["users"].append({
                    "id": user_id,
                    "username": user["username"],
                    "email": user["email"],
                    "password": user["password"]  # Сохраняем plain password для тестов
                })
                
                print(f"✓ Создан пользователь: {user['username']} (ID: {user_id})")
                
                # Генерация и вставка ссылок для пользователя
                links = self.generate_test_links(user_id, user["username"])
                for link in links:
                    cursor.execute("""
                        INSERT INTO "ShortLinks" ("Code", "OriginalUrl", "UserId", "Clicks", "CreatedAt")
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING "Id"
                    """, (
                        link["short_code"],
                        link["original_url"],
                        link["user_id"],
                        link["clicks"],
                        link["created_at"]
                    ))
                    link_id = cursor.fetchone()[0]
                    link["id"] = link_id
                    self.test_data["links"].append({
                        "id": link_id,
                        "short_code": link["short_code"],
                        "original_url": link["original_url"],
                        "user_id": link["user_id"],
                        "username": user["username"]
                    })
                
                print(f"  ✓ Создано {len(links)} ссылок для {user['username']}")
            
            print(f"\n✓ Всего создано {len(self.test_data['users'])} пользователей")
            print(f"✓ Всего создано {len(self.test_data['links'])} ссылок")
            
        except Exception as e:
            print(f"✗ Ошибка при вставке данных: {e}")
            raise
        finally:
            cursor.close()

    def save_test_data(self):
        """Сохранение тестовых данных в JSON файл"""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output_file = os.path.join(OUTPUT_DIR, "test_data.json")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Тестовые данные сохранены в {output_file}")

    def generate(self):
        """Главный метод генерации"""
        print("=" * 60)
        print("Генератор тестовых данных для UrlShortener")
        print("=" * 60)
        
        try:
            self.connect()
            self.insert_test_data()
            self.save_test_data()
            print("\n" + "=" * 60)
            print("✓ Генерация тестовых данных завершена успешно!")
            print("=" * 60)
        except Exception as e:
            print(f"\n✗ Ошибка: {e}")
            raise
        finally:
            self.close()


def main():
    # Получаем строку подключения из переменной окружения
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("✗ Ошибка: переменная окружения DATABASE_URL не установлена")
        print("Пример: DATABASE_URL='host=localhost port=5432 dbname=urlshortener_test user=postgres password=test'")
        exit(1)
    
    generator = TestDataGenerator(database_url)
    generator.generate()


if __name__ == "__main__":
    main()

