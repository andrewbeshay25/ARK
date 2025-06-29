# tests/test_auth.py
import random, string
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def random_email():
    return f"test_{''.join(random.choices(string.ascii_lowercase, k=5))}@example.com"

def test_register_and_login():
    email = random_email()
    password = "testpassword"
    register_data = {
        "email": email,
        "password": password,
        "firstName": "Test",
        "lastName": "User"
    }
    # Register a new user
    reg_response = client.post("/auth/register", json=register_data)
    assert reg_response.status_code == 200, reg_response.text
    reg_json = reg_response.json()
    assert "access_token" in reg_json
    assert "firstName" in reg_json
    assert "user_role" in reg_json

    # Login with the same credentials
    login_data = {
        "email": email,
        "password": password
    }
    login_response = client.post("/auth/login", json=login_data)
    assert login_response.status_code == 200, login_response.text
    login_json = login_response.json()
    assert "access_token" in login_json
    assert login_json["firstName"] == "Test"
    assert "user_role" in login_json
