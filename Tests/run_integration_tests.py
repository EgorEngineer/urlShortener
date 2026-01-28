#!/usr/bin/env python3
"""
Интеграционные тесты для UrlShortener API
"""

import os
import json
import requests
import time
from typing import Dict, Optional

class IntegrationTester:
    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url.rstrip('/')
        self.test_data = self.load_test_data()
        self.auth_tokens = {}
        self.results = {
            "passed": 0,
            "failed": 0,
            "tests": []
        }

    def load_test_data(self) -> Dict:
        """Загрузка тестовых данных"""
        test_data_path = "Tests/results/test_data.json"
        if not os.path.exists(test_data_path):
            print(f"✗ Файл тестовых данных не найден: {test_data_path}")
            return {"users": [], "links": []}
        
        with open(test_data_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def test_health_check(self) -> bool:
        """Проверка доступности API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/links/my-links",
                timeout=10
            )
            # Ожидаем 401 (Unauthorized), т.к. не передали токен
            success = response.status_code == 401
            self.log_test("Health Check", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_register(self, username: str, email: str, password: str) -> bool:
        """Тест регистрации пользователя"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/auth/register",
                json={
                    "username": username,
                    "email": email,
                    "password": password
                },
                timeout=10
            )
            success = response.status_code == 200
            self.log_test("Register User", success, response.status_code)
            return success
        except Exception as e:
            self.log_test("Register User", False, str(e))
            return False

    def test_login(self, username: str, password: str) -> Optional[str]:
        """Тест входа пользователя"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/auth/login",
                json={
                    "username": username,
                    "password": password
                },
                timeout=10
            )
            success = response.status_code == 200
            token = None
            if success:
                data = response.json()
                token = data.get("token")
            self.log_test("Login User", success, f"Status: {response.status_code}, Token: {'Yes' if token else 'No'}")
            return token
        except Exception as e:
            self.log_test("Login User", False, str(e))
            return None

    def test_create_link(self, token: str, original_url: str) -> Optional[str]:
        """Тест создания короткой ссылки"""
        try:
            response = requests.post(
                f"{self.api_base_url}/api/links",
                json={"originalUrl": original_url},
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            success = response.status_code == 200
            short_code = None
            if success:
                data = response.json()
                short_code = data.get("code")  # Changed from shortCode to code
            self.log_test("Create Link", success, f"Status: {response.status_code}, Code: {short_code}")
            return short_code
        except Exception as e:
            self.log_test("Create Link", False, str(e))
            return None

    def test_get_links(self, token: str) -> bool:
        """Тест получения списка ссылок"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/links/my-links",  # Changed endpoint
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            success = response.status_code == 200
            count = len(response.json()) if success else 0
            self.log_test("Get Links", success, f"Status: {response.status_code}, Count: {count}")
            return success
        except Exception as e:
            self.log_test("Get Links", False, str(e))
            return False

    def test_redirect(self, short_code: str) -> bool:
        """Тест редиректа по короткому коду"""
        try:
            response = requests.get(
                f"{self.api_base_url}/{short_code}",
                allow_redirects=False,
                timeout=10
            )
            success = response.status_code in [301, 302, 307, 308]
            self.log_test("Redirect", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Redirect", False, str(e))
            return False

    def test_get_link_details(self, token: str, short_code: str) -> bool:
        """Тест получения деталей ссылки"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/links/{short_code}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
            success = response.status_code == 200
            self.log_test("Get Link Details", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Link Details", False, str(e))
            return False

    def log_test(self, test_name: str, passed: bool, details):
        """Логирование результата теста"""
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name} - {details}")
        
        self.results["tests"].append({
            "name": test_name,
            "passed": passed,
            "details": str(details)
        })
        
        if passed:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1

    def run_tests(self):
        """Запуск всех тестов"""
        print("=" * 60)
        print("Интеграционные тесты UrlShortener API")
        print("=" * 60)
        print(f"API Base URL: {self.api_base_url}\n")

        # Проверка доступности API
        print("Проверка доступности API...")
        if not self.test_health_check():
            print("\n✗ API недоступен, тесты прерваны")
            self.save_results()
            return 1

        # Тесты регистрации нового пользователя
        print("\n--- Тест регистрации нового пользователя ---")
        new_user = f"newuser_{int(time.time())}"
        self.test_register(
            new_user,
            f"{new_user}@test.com",
            "NewTestPassword123!"
        )

        # Тесты с существующим пользователем
        if self.test_data["users"]:
            user = self.test_data["users"][0]
            print(f"\n--- Тестирование с пользователем: {user['username']} ---")
            
            # Тест логина
            token = self.test_login(user["username"], user["password"])
            
            if token:
                self.auth_tokens[user["username"]] = token
                
                # Тест получения списка ссылок
                self.test_get_links(token)
                
                # Тест создания ссылки
                print("\n--- Тест создания новой ссылки ---")
                short_code = self.test_create_link(
                    token,
                    "https://github.com/test/integration"
                )
                
                # Тест деталей созданной ссылки
                if short_code:
                    self.test_get_link_details(token, short_code)
                    self.test_redirect(short_code)
                
                # Тест редиректа с существующей ссылкой из БД
                if self.test_data["links"]:
                    print("\n--- Тест редиректа существующей ссылки ---")
                    existing_code = self.test_data["links"][0]["short_code"]
                    self.test_redirect(existing_code)
                    self.test_get_link_details(token, existing_code)

        # Сохранение результатов
        self.save_results()
        
        # Итоговая статистика
        print("\n" + "=" * 60)
        print("РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
        print("=" * 60)
        print(f"✓ Пройдено: {self.results['passed']}")
        print(f"✗ Провалено: {self.results['failed']}")
        print(f"Всего тестов: {self.results['passed'] + self.results['failed']}")
        print("=" * 60)
        
        # Возвращаем код выхода
        return 0 if self.results["failed"] == 0 else 1

    def save_results(self):
        """Сохранение результатов тестов"""
        os.makedirs("Tests/results", exist_ok=True)
        with open("Tests/results/test_results.json", 'w') as f:
            json.dump(self.results, f, indent=2)
        print("\n✓ Результаты тестов сохранены в Tests/results/test_results.json")


def main():
    api_base_url = os.getenv("API_BASE_URL", "http://localhost:5000")
    
    tester = IntegrationTester(api_base_url)
    exit_code = tester.run_tests()
    exit(exit_code)


if __name__ == "__main__":
    main()

