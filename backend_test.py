#!/usr/bin/env python3
"""
Backend API Testing for LAP QUIZ
Tests NEW/CHANGED endpoints: admin users management, AI auto-count, and regressions
"""
import requests
import json
import base64
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://dupe-app.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@lapquiz.ch"
ADMIN_PASSWORD = "pw12345"

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(test_name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"
    
    result = f"{status}: {test_name}"
    if details:
        result += f"\n    Details: {details}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "details": details})

def create_test_image_base64():
    """Create a small realistic test image with text content for AI processing"""
    from PIL import Image, ImageDraw, ImageFont
    import io
    
    # Create a simple image with German text (simulating learning material)
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add some text content that looks like learning material
    text_lines = [
        "Deutsch - Grammatik",
        "",
        "Der Artikel:",
        "- der (maskulin)",
        "- die (feminin)", 
        "- das (neutral)",
        "",
        "Beispiele:",
        "der Tisch, die Lampe, das Buch"
    ]
    
    y_position = 20
    for line in text_lines:
        draw.text((20, y_position), line, fill='black')
        y_position += 25
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_bytes = buffer.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')

def test_admin_login():
    """Test 0: Login as admin user"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            if "session_token" in data and data.get("user", {}).get("role") == "admin":
                log_test("Admin login", True, f"Logged in as {ADMIN_EMAIL} with role=admin")
                return data["session_token"]
            else:
                log_test("Admin login", False, f"Response missing session_token or role != admin: {data}")
                return None
        else:
            log_test("Admin login", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Admin login", False, f"Exception: {str(e)}")
        return None

def test_register_normal_user():
    """Test 0b: Register a fresh normal user"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        email = f"testuser{timestamp}@test.com"
        password = "testpass123"
        
        response = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "name": "Test User"
        })
        
        if response.status_code == 200:
            data = response.json()
            if "session_token" in data and data.get("user", {}).get("role") == "user":
                log_test("Normal user registration", True, f"Registered {email} with role=user")
                return {
                    "email": email,
                    "password": password,
                    "token": data["session_token"],
                    "user_id": data["user"]["user_id"]
                }
            else:
                log_test("Normal user registration", False, f"Response missing session_token or role != user: {data}")
                return None
        else:
            log_test("Normal user registration", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Normal user registration", False, f"Exception: {str(e)}")
        return None

def test_get_admin_users_as_admin(admin_token):
    """Test 1a: GET /admin/users as admin returns user array"""
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check first user has required fields
                user = data[0]
                required_fields = ["user_id", "email", "name", "role", "licensed", "created_at"]
                missing_fields = [f for f in required_fields if f not in user]
                
                if not missing_fields:
                    log_test("GET /admin/users as admin", True, f"Returns array of {len(data)} users with all required fields")
                    return True
                else:
                    log_test("GET /admin/users as admin", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                log_test("GET /admin/users as admin", False, f"Expected non-empty array, got: {data}")
                return False
        else:
            log_test("GET /admin/users as admin", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("GET /admin/users as admin", False, f"Exception: {str(e)}")
        return False

def test_get_admin_users_as_normal(normal_token):
    """Test 1b: GET /admin/users as normal user returns 403"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if response.status_code == 403:
            log_test("GET /admin/users as normal user → 403", True, "Correctly returns 403 Forbidden")
            return True
        else:
            log_test("GET /admin/users as normal user → 403", False, f"Expected 403, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("GET /admin/users as normal user → 403", False, f"Exception: {str(e)}")
        return False

def test_patch_admin_users_as_admin(admin_token, user_id):
    """Test 2a: PATCH /admin/users/{uid} as admin with licensed=true/false"""
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Set licensed=true
        response1 = requests.patch(f"{BASE_URL}/admin/users/{user_id}", 
                                   headers=headers, 
                                   json={"licensed": True})
        
        if response1.status_code != 200:
            log_test("PATCH /admin/users/{uid} licensed=true", False, f"Status {response1.status_code}: {response1.text}")
            return False
        
        data1 = response1.json()
        if not data1.get("licensed"):
            log_test("PATCH /admin/users/{uid} licensed=true", False, f"licensed field not true: {data1}")
            return False
        
        # Set licensed=false
        response2 = requests.patch(f"{BASE_URL}/admin/users/{user_id}", 
                                   headers=headers, 
                                   json={"licensed": False})
        
        if response2.status_code != 200:
            log_test("PATCH /admin/users/{uid} licensed=false", False, f"Status {response2.status_code}: {response2.text}")
            return False
        
        data2 = response2.json()
        if data2.get("licensed"):
            log_test("PATCH /admin/users/{uid} licensed=false", False, f"licensed field not false: {data2}")
            return False
        
        log_test("PATCH /admin/users/{uid} as admin", True, "Successfully toggled licensed=true then licensed=false")
        return True
        
    except Exception as e:
        log_test("PATCH /admin/users/{uid} as admin", False, f"Exception: {str(e)}")
        return False

def test_patch_admin_users_as_normal(normal_token, user_id):
    """Test 2b: PATCH /admin/users/{uid} as normal user returns 403"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        response = requests.patch(f"{BASE_URL}/admin/users/{user_id}", 
                                 headers=headers, 
                                 json={"licensed": True})
        
        if response.status_code == 403:
            log_test("PATCH /admin/users/{uid} as normal user → 403", True, "Correctly returns 403 Forbidden")
            return True
        else:
            log_test("PATCH /admin/users/{uid} as normal user → 403", False, f"Expected 403, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("PATCH /admin/users/{uid} as normal user → 403", False, f"Exception: {str(e)}")
        return False

def test_admin_stats_licensed_count(admin_token, user_id):
    """Test 3: Verify GET /admin/stats licensed_users count increases after licensing"""
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get initial stats
        response1 = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        if response1.status_code != 200:
            log_test("GET /admin/stats licensed count", False, f"Initial stats failed: {response1.status_code}")
            return False
        
        stats1 = response1.json()
        initial_licensed = stats1.get("licensed_users", 0)
        
        # Set user licensed=true
        requests.patch(f"{BASE_URL}/admin/users/{user_id}", 
                      headers=headers, 
                      json={"licensed": True})
        
        # Get updated stats
        response2 = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
        if response2.status_code != 200:
            log_test("GET /admin/stats licensed count", False, f"Updated stats failed: {response2.status_code}")
            return False
        
        stats2 = response2.json()
        updated_licensed = stats2.get("licensed_users", 0)
        
        if updated_licensed == initial_licensed + 1:
            log_test("GET /admin/stats licensed count increases", True, f"Count increased from {initial_licensed} to {updated_licensed}")
            return True
        else:
            log_test("GET /admin/stats licensed count increases", False, f"Expected {initial_licensed + 1}, got {updated_licensed}")
            return False
            
    except Exception as e:
        log_test("GET /admin/stats licensed count increases", False, f"Exception: {str(e)}")
        return False

def test_ai_generate_image_auto_count(normal_token):
    """Test 4: POST /ai/generate-questions with image but NO count field - should auto-determine"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        
        # Create realistic test image
        image_b64 = create_test_image_base64()
        
        # Send request WITHOUT count field
        payload = {
            "subject_name": "Deutsch",
            "image_base64": image_b64
            # NOTE: No "count" field - should auto-determine
        }
        
        response = requests.post(f"{BASE_URL}/ai/generate-questions", 
                                headers=headers, 
                                json=payload,
                                timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            if "questions" in data and isinstance(data["questions"], list):
                num_questions = len(data["questions"])
                # Should return reasonable number (3-10, capped at 12)
                if 1 <= num_questions <= 12:
                    log_test("AI auto-count (image, no count field)", True, 
                            f"Generated {num_questions} questions (expected 3-10, capped at 12)")
                    return True
                else:
                    log_test("AI auto-count (image, no count field)", False, 
                            f"Generated {num_questions} questions, expected 3-10 range")
                    return False
            else:
                log_test("AI auto-count (image, no count field)", False, f"Response missing questions array: {data}")
                return False
        else:
            log_test("AI auto-count (image, no count field)", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("AI auto-count (image, no count field)", False, f"Exception: {str(e)}")
        return False

def test_ai_generate_text_explicit_count(normal_token):
    """Test 5: POST /ai/generate-questions with text and explicit count=3"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        
        payload = {
            "subject_name": "Rechnungswesen",
            "topic": "Bilanz",
            "count": 3
        }
        
        response = requests.post(f"{BASE_URL}/ai/generate-questions", 
                                headers=headers, 
                                json=payload,
                                timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            if "questions" in data and isinstance(data["questions"], list):
                num_questions = len(data["questions"])
                # Should return about 3 questions (allow some variance)
                if 2 <= num_questions <= 4:
                    log_test("AI text with explicit count=3", True, 
                            f"Generated {num_questions} questions (requested 3)")
                    return True
                else:
                    log_test("AI text with explicit count=3", False, 
                            f"Generated {num_questions} questions, expected ~3")
                    return False
            else:
                log_test("AI text with explicit count=3", False, f"Response missing questions array: {data}")
                return False
        else:
            log_test("AI text with explicit count=3", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("AI text with explicit count=3", False, f"Exception: {str(e)}")
        return False

def test_regression_redeem(normal_token):
    """Test 6a: Regression - POST /auth/redeem with DEMO-UNLOCK still works"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        
        response = requests.post(f"{BASE_URL}/auth/redeem", 
                                headers=headers, 
                                json={"code": "DEMO-UNLOCK"})
        
        if response.status_code == 200:
            data = response.json()
            if data.get("licensed"):
                log_test("Regression: POST /auth/redeem DEMO-UNLOCK", True, "User licensed successfully")
                return True
            else:
                log_test("Regression: POST /auth/redeem DEMO-UNLOCK", False, f"User not licensed: {data}")
                return False
        else:
            log_test("Regression: POST /auth/redeem DEMO-UNLOCK", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Regression: POST /auth/redeem DEMO-UNLOCK", False, f"Exception: {str(e)}")
        return False

def test_regression_custom_exam(normal_token):
    """Test 6b: Regression - POST /entities/CustomExam create still works"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        
        payload = {
            "title": "Test Exam",
            "subject": "Rechnungswesen",
            "question_count": 10
        }
        
        response = requests.post(f"{BASE_URL}/entities/CustomExam", 
                                headers=headers, 
                                json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("title") == "Test Exam":
                log_test("Regression: POST /entities/CustomExam", True, f"Created exam with id={data['id']}")
                return True
            else:
                log_test("Regression: POST /entities/CustomExam", False, f"Response missing id or title: {data}")
                return False
        else:
            log_test("Regression: POST /entities/CustomExam", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Regression: POST /entities/CustomExam", False, f"Exception: {str(e)}")
        return False

def test_regression_user_question_bulk(normal_token):
    """Test 6c: Regression - POST /entities/UserQuestion/bulk still works"""
    try:
        headers = {"Authorization": f"Bearer {normal_token}"}
        
        payload = [
            {
                "type": "mc",
                "question": "Test question 1?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "A",
                "explanation": "Test explanation"
            },
            {
                "type": "tf",
                "question": "Test question 2?",
                "options": ["Wahr", "Falsch"],
                "correct_answer": "Wahr",
                "explanation": "Test explanation 2"
            }
        ]
        
        response = requests.post(f"{BASE_URL}/entities/UserQuestion/bulk", 
                                headers=headers, 
                                json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 2:
                log_test("Regression: POST /entities/UserQuestion/bulk", True, f"Created {len(data)} questions")
                return True
            else:
                log_test("Regression: POST /entities/UserQuestion/bulk", False, f"Expected 2 questions, got: {data}")
                return False
        else:
            log_test("Regression: POST /entities/UserQuestion/bulk", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Regression: POST /entities/UserQuestion/bulk", False, f"Exception: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("LAP QUIZ Backend API Testing - NEW/CHANGED Endpoints")
    print("=" * 80)
    print()
    
    # Setup: Login admin and register normal user
    print("SETUP: Authentication")
    print("-" * 80)
    admin_token = test_admin_login()
    if not admin_token:
        print("\n❌ CRITICAL: Admin login failed. Cannot continue tests.")
        sys.exit(1)
    
    normal_user = test_register_normal_user()
    if not normal_user:
        print("\n❌ CRITICAL: Normal user registration failed. Cannot continue tests.")
        sys.exit(1)
    
    print()
    print("TESTS: Admin User Management")
    print("-" * 80)
    
    # Test 1: GET /admin/users
    test_get_admin_users_as_admin(admin_token)
    test_get_admin_users_as_normal(normal_user["token"])
    
    # Test 2: PATCH /admin/users/{uid}
    test_patch_admin_users_as_admin(admin_token, normal_user["user_id"])
    test_patch_admin_users_as_normal(normal_user["token"], normal_user["user_id"])
    
    # Test 3: GET /admin/stats licensed count
    test_admin_stats_licensed_count(admin_token, normal_user["user_id"])
    
    print()
    print("TESTS: AI Question Generation")
    print("-" * 80)
    
    # Test 4: AI auto-count with image
    test_ai_generate_image_auto_count(normal_user["token"])
    
    # Test 5: AI text with explicit count
    test_ai_generate_text_explicit_count(normal_user["token"])
    
    print()
    print("TESTS: Regression Tests")
    print("-" * 80)
    
    # Test 6: Regressions
    test_regression_redeem(normal_user["token"])
    test_regression_custom_exam(normal_user["token"])
    test_regression_user_question_bulk(normal_user["token"])
    
    print()
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {tests_passed + tests_failed}")
    print(f"Passed: {tests_passed}")
    print(f"Failed: {tests_failed}")
    print()
    
    if tests_failed > 0:
        print("FAILED TESTS:")
        for result in test_results:
            if not result["passed"]:
                print(f"  - {result['test']}")
                if result["details"]:
                    print(f"    {result['details']}")
        sys.exit(1)
    else:
        print("✅ ALL TESTS PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    main()
