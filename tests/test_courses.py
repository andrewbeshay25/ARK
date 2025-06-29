# tests/test_courses.py
import random, string
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def random_email():
    return f"test_{''.join(random.choices(string.ascii_lowercase, k=5))}@example.com"

def random_string(length=5):
    return "".join(random.choices(string.ascii_lowercase, k=length))

# Fixture to create and login a test user and return authorization headers
def get_auth_headers():
    email = random_email()
    password = "testpassword"
    register_data = {
        "email": email,
        "password": password,
        "firstName": "Test",
        "lastName": "User"
    }
    # Register
    reg_response = client.post("/auth/register", json=register_data)
    assert reg_response.status_code == 200
    # Login
    login_data = {"email": email, "password": password}
    login_response = client.post("/auth/login", json=login_data)
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_course():
    headers = get_auth_headers()
    course_data = {
        "course_name": "Test Course",
        "course_description": "This is a test course."
    }
    response = client.post("/courses/createCourse", json=course_data, headers=headers)
    assert response.status_code == 200, response.text
    course = response.json()
    assert course["course_name"] == "Test Course"
    assert "course_id" in course
    assert "course_code" in course

def test_read_courses():
    headers = get_auth_headers()
    response = client.get("/courses", headers=headers)
    assert response.status_code == 200, response.text
    courses = response.json()
    # Expecting a list
    assert isinstance(courses, list)

def test_join_course():
    # Create a course with one user
    headers1 = get_auth_headers()
    course_data = {
        "course_name": "Joinable Course",
        "course_description": "For join testing."
    }
    create_resp = client.post("/courses/createCourse", json=course_data, headers=headers1)
    assert create_resp.status_code == 200, create_resp.text
    course = create_resp.json()
    course_code = course.get("course_code")
    assert course_code is not None

    # Create a second user to join the course
    headers2 = get_auth_headers()
    join_data = {"course_code": course_code}
    join_resp = client.post("/courses/joinCourse", json=join_data, headers=headers2)
    assert join_resp.status_code == 200, join_resp.text

def test_get_course_dashboard():
    headers = get_auth_headers()
    # Create a course
    course_data = {
        "course_name": "Dashboard Course",
        "course_description": "For dashboard testing."
    }
    create_resp = client.post("/courses/createCourse", json=course_data, headers=headers)
    assert create_resp.status_code == 200, create_resp.text
    course = create_resp.json()
    course_id = course["course_id"]
    # Now get the dashboard
    dash_resp = client.get(f"/courses/{course_id}/dashboard", headers=headers)
    assert dash_resp.status_code == 200, dash_resp.text
    dashboard = dash_resp.json()
    assert dashboard["course_name"] == "Dashboard Course"
