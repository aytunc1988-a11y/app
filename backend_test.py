#!/usr/bin/env python3
"""
Backend API Test Suite for LAP QUIZ
Tests all endpoints at the external URL (REACT_APP_BACKEND_URL/api)
"""
import requests
import json
import base64
import os
from pathlib import Path
from PIL import Image
import io

# Read backend URL from frontend/.env
def get_backend_url():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    url = line.split("=", 1)[1].strip()
                    return f"{url}/api"
    return "https://dupe-app.preview.emergentagent.com/api"

BASE_URL = get_backend_url()
print(f"Testing backend at: {BASE_URL}")

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_pass(test_name, details=""):
    test_results["passed"].append(f"✅ {test_name}: {details}")
    print(f"✅ PASS: {test_name} - {details}")

def log_fail(test_name, details=""):
    test_results["failed"].append(f"❌ {test_name}: {details}")
    print(f"❌ FAIL: {test_name} - {details}")

def log_warning(test_name, details=""):
    test_results["warnings"].append(f"⚠️  {test_name}: {details}")
    print(f"⚠️  WARNING: {test_name} - {details}")

def create_test_image():
    """Create a realistic learning material image with text and content"""
    img = Image.new('RGB', (400, 300), color='white')
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
    
    # Add title
    draw.text((20, 20), "Deutsch - Grammatik", fill='black', font=font_title)
    draw.line([(20, 45), (380, 45)], fill='black', width=2)
    
    # Add learning content
    content = [
        "Satzarten im Deutschen:",
        "",
        "1. Hauptsatz: Kann alleine stehen",
        "   Beispiel: Der Hund bellt laut.",
        "",
        "2. Nebensatz: Braucht einen Hauptsatz",
        "   Beispiel: ..., weil er hungrig ist.",
        "",
        "Kommaregeln:",
        "- Vor 'dass', 'weil', 'wenn' kommt ein Komma",
        "- Relativsätze werden mit Kommas abgetrennt",
        "",
        "Übung: Setze die Kommas richtig!"
    ]
    
    y = 60
    for line in content:
        draw.text((30, y), line, fill='black', font=font_text)
        y += 18
    
    # Add a simple diagram box
    draw.rectangle([250, 100, 370, 180], outline='blue', width=2)
    draw.text((260, 110), "Hauptsatz", fill='blue', font=font_text)
    draw.text((260, 130), "+", fill='blue', font=font_text)
    draw.text((260, 150), "Nebensatz", fill='blue', font=font_text)
    
    # Convert to base64 JPEG
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    b64 = base64.b64encode(buffer.read()).decode('utf-8')
    return b64

print("\n" + "="*80)
print("LAP QUIZ BACKEND API TEST SUITE")
print("="*80 + "\n")

# Test 1: GET /me
print("\n--- Test 1: GET /me ---")
try:
    resp = requests.get(f"{BASE_URL}/me", timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("full_name") == "Demo Lernende" and data.get("profession") == "kaufmann":
            log_pass("GET /me", f"Returns correct demo user: {data.get('full_name')}, {data.get('profession')}")
        else:
            log_fail("GET /me", f"Incorrect user data: full_name={data.get('full_name')}, profession={data.get('profession')}")
    else:
        log_fail("GET /me", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("GET /me", f"Exception: {e}")

# Test 2: PUT /me
print("\n--- Test 2: PUT /me ---")
try:
    resp = requests.put(f"{BASE_URL}/me", json={"ort": "Bern"}, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("ort") == "Bern":
            log_pass("PUT /me", "Successfully updated ort to Bern")
            # Verify persistence with GET
            resp2 = requests.get(f"{BASE_URL}/me", timeout=10)
            if resp2.status_code == 200:
                data2 = resp2.json()
                if data2.get("ort") == "Bern":
                    log_pass("PUT /me persistence", "GET /me reflects updated ort=Bern")
                else:
                    log_fail("PUT /me persistence", f"GET /me shows ort={data2.get('ort')}, expected Bern")
        else:
            log_fail("PUT /me", f"Response ort={data.get('ort')}, expected Bern")
    else:
        log_fail("PUT /me", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("PUT /me", f"Exception: {e}")

# Test 3: POST /entities/Question/list with filter
print("\n--- Test 3: POST /entities/Question/list (filter: rechnungswesen) ---")
try:
    resp = requests.post(
        f"{BASE_URL}/entities/Question/list",
        json={"filter": {"subject": "rechnungswesen"}, "sort": "-created_date", "limit": 100},
        timeout=10
    )
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            count = len(data)
            if count == 7:
                log_pass("POST /entities/Question/list", f"Returns {count} seeded rechnungswesen questions")
            else:
                log_warning("POST /entities/Question/list", f"Expected 7 questions, got {count}")
        else:
            log_fail("POST /entities/Question/list", f"Response is not a list: {type(data)}")
    else:
        log_fail("POST /entities/Question/list", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/Question/list", f"Exception: {e}")

# Test 4: POST /entities/Listing/list
print("\n--- Test 4: POST /entities/Listing/list ---")
try:
    resp = requests.post(
        f"{BASE_URL}/entities/Listing/list",
        json={"limit": 100},
        timeout=10
    )
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            count = len(data)
            if count == 6:
                log_pass("POST /entities/Listing/list", f"Returns {count} seeded listings")
            else:
                log_warning("POST /entities/Listing/list", f"Expected 6 listings, got {count}")
        else:
            log_fail("POST /entities/Listing/list", f"Response is not a list: {type(data)}")
    else:
        log_fail("POST /entities/Listing/list", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/Listing/list", f"Exception: {e}")

# Test 5: POST /entities/LiebeProfile/list
print("\n--- Test 5: POST /entities/LiebeProfile/list ---")
try:
    resp = requests.post(
        f"{BASE_URL}/entities/LiebeProfile/list",
        json={"limit": 100},
        timeout=10
    )
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list):
            count = len(data)
            if count == 12:
                log_pass("POST /entities/LiebeProfile/list", f"Returns {count} seeded profiles")
            else:
                log_warning("POST /entities/LiebeProfile/list", f"Expected 12 profiles, got {count}")
        else:
            log_fail("POST /entities/LiebeProfile/list", f"Response is not a list: {type(data)}")
    else:
        log_fail("POST /entities/LiebeProfile/list", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/LiebeProfile/list", f"Exception: {e}")

# Test 6: POST /entities/UserQuestion (create)
print("\n--- Test 6: POST /entities/UserQuestion (create) ---")
created_id = None
try:
    payload = {
        "subject": "rechnungswesen",
        "type": "mc",
        "question": "Test question?",
        "options": ["a", "b", "c", "d"],
        "correct_answer": "a",
        "explanation": "Test explanation"
    }
    resp = requests.post(f"{BASE_URL}/entities/UserQuestion", json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if "id" in data and "created_date" in data and "created_by_id" in data:
            created_id = data["id"]
            log_pass("POST /entities/UserQuestion", f"Created with id={created_id}")
        else:
            log_fail("POST /entities/UserQuestion", f"Missing required fields: {data}")
    else:
        log_fail("POST /entities/UserQuestion", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/UserQuestion", f"Exception: {e}")

# Test 7: GET /entities/UserQuestion/{id}
print("\n--- Test 7: GET /entities/UserQuestion/{id} ---")
if created_id:
    try:
        resp = requests.get(f"{BASE_URL}/entities/UserQuestion/{created_id}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data and data.get("id") == created_id:
                log_pass("GET /entities/UserQuestion/{id}", f"Retrieved question with id={created_id}")
            else:
                log_fail("GET /entities/UserQuestion/{id}", f"Data mismatch: {data}")
        else:
            log_fail("GET /entities/UserQuestion/{id}", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /entities/UserQuestion/{id}", f"Exception: {e}")
else:
    log_warning("GET /entities/UserQuestion/{id}", "Skipped - no created_id from previous test")

# Test 8: PUT /entities/UserQuestion/{id}
print("\n--- Test 8: PUT /entities/UserQuestion/{id} ---")
if created_id:
    try:
        resp = requests.put(
            f"{BASE_URL}/entities/UserQuestion/{created_id}",
            json={"question": "Updated question?"},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("question") == "Updated question?":
                log_pass("PUT /entities/UserQuestion/{id}", "Successfully updated question")
            else:
                log_fail("PUT /entities/UserQuestion/{id}", f"Question not updated: {data.get('question')}")
        else:
            log_fail("PUT /entities/UserQuestion/{id}", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("PUT /entities/UserQuestion/{id}", f"Exception: {e}")
else:
    log_warning("PUT /entities/UserQuestion/{id}", "Skipped - no created_id from previous test")

# Test 9: POST /entities/UserQuestion/bulk
print("\n--- Test 9: POST /entities/UserQuestion/bulk ---")
bulk_ids = []
try:
    payload = [
        {
            "subject": "wg",
            "type": "tf",
            "question": "Bulk test 1?",
            "options": ["Wahr", "Falsch"],
            "correct_answer": "Wahr",
            "explanation": "Bulk explanation 1"
        },
        {
            "subject": "wg",
            "type": "mc",
            "question": "Bulk test 2?",
            "options": ["a", "b", "c", "d"],
            "correct_answer": "b",
            "explanation": "Bulk explanation 2"
        }
    ]
    resp = requests.post(f"{BASE_URL}/entities/UserQuestion/bulk", json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and len(data) == 2:
            bulk_ids = [item["id"] for item in data if "id" in item]
            log_pass("POST /entities/UserQuestion/bulk", f"Created 2 items: {bulk_ids}")
        else:
            log_fail("POST /entities/UserQuestion/bulk", f"Expected 2 items, got: {data}")
    else:
        log_fail("POST /entities/UserQuestion/bulk", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/UserQuestion/bulk", f"Exception: {e}")

# Test 10: DELETE /entities/UserQuestion/{id}
print("\n--- Test 10: DELETE /entities/UserQuestion/{id} ---")
if created_id:
    try:
        resp = requests.delete(f"{BASE_URL}/entities/UserQuestion/{created_id}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok"):
                log_pass("DELETE /entities/UserQuestion/{id}", f"Deleted id={created_id}")
                # Verify deletion with GET
                resp2 = requests.get(f"{BASE_URL}/entities/UserQuestion/{created_id}", timeout=10)
                if resp2.status_code == 200:
                    data2 = resp2.json()
                    if data2 is None:
                        log_pass("DELETE verification", "GET returns null after deletion")
                    else:
                        log_fail("DELETE verification", f"GET still returns data: {data2}")
            else:
                log_fail("DELETE /entities/UserQuestion/{id}", f"Response not ok: {data}")
        else:
            log_fail("DELETE /entities/UserQuestion/{id}", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("DELETE /entities/UserQuestion/{id}", f"Exception: {e}")
else:
    log_warning("DELETE /entities/UserQuestion/{id}", "Skipped - no created_id from previous test")

# Test 11: POST /entities/StudySession (create) and delete-many
print("\n--- Test 11: POST /entities/StudySession (create & delete-many) ---")
session_id = None
try:
    payload = {
        "subject": "test_subject",
        "question_count": 5,
        "correct_count": 3,
        "duration_seconds": 120
    }
    resp = requests.post(f"{BASE_URL}/entities/StudySession", json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if "id" in data:
            session_id = data["id"]
            log_pass("POST /entities/StudySession", f"Created session id={session_id}")
            
            # Now test delete-many
            resp2 = requests.post(
                f"{BASE_URL}/entities/StudySession/delete-many",
                json={"filter": {"created_by_id": "demo-user"}},
                timeout=10
            )
            if resp2.status_code == 200:
                data2 = resp2.json()
                if data2.get("ok"):
                    log_pass("POST /entities/StudySession/delete-many", "Successfully deleted sessions")
                else:
                    log_fail("POST /entities/StudySession/delete-many", f"Response not ok: {data2}")
            else:
                log_fail("POST /entities/StudySession/delete-many", f"Status {resp2.status_code}: {resp2.text}")
        else:
            log_fail("POST /entities/StudySession", f"Missing id: {data}")
    else:
        log_fail("POST /entities/StudySession", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/StudySession", f"Exception: {e}")

# Test 12: POST /entities/CustomExam (create)
print("\n--- Test 12: POST /entities/CustomExam (create) ---")
try:
    payload = {
        "title": "Test Exam",
        "mode": "learn",
        "question_ids": ["test-q-1", "test-q-2"]
    }
    resp = requests.post(f"{BASE_URL}/entities/CustomExam", json=payload, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if "id" in data and data.get("title") == "Test Exam":
            log_pass("POST /entities/CustomExam", f"Created exam id={data['id']}")
        else:
            log_fail("POST /entities/CustomExam", f"Data mismatch: {data}")
    else:
        log_fail("POST /entities/CustomExam", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/CustomExam", f"Exception: {e}")

# Test 13: Invalid entity name
print("\n--- Test 13: POST /entities/Foo/list (invalid entity) ---")
try:
    resp = requests.post(f"{BASE_URL}/entities/Foo/list", json={"limit": 10}, timeout=10)
    if resp.status_code == 404:
        log_pass("POST /entities/Foo/list", "Correctly returns 404 for invalid entity")
    else:
        log_fail("POST /entities/Foo/list", f"Expected 404, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /entities/Foo/list", f"Exception: {e}")

# Test 14: POST /ai/generate-questions (without image)
print("\n--- Test 14: POST /ai/generate-questions (without image) ---")
try:
    payload = {
        "subject_name": "Rechnungswesen",
        "topic": "Bilanz",
        "count": 3
    }
    resp = requests.post(f"{BASE_URL}/ai/generate-questions", json=payload, timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        if "questions" in data and isinstance(data["questions"], list):
            questions = data["questions"]
            count = len(questions)
            if 1 <= count <= 5:
                # Validate question structure
                valid = True
                for q in questions:
                    if q.get("type") not in ["mc", "tf", "gap"]:
                        valid = False
                        log_fail("AI question validation", f"Invalid type: {q.get('type')}")
                    if not q.get("question"):
                        valid = False
                        log_fail("AI question validation", "Missing question text")
                    if not q.get("correct_answer"):
                        valid = False
                        log_fail("AI question validation", "Missing correct_answer")
                    if "options" not in q:
                        valid = False
                        log_fail("AI question validation", "Missing options field")
                    else:
                        opts = q["options"]
                        qtype = q.get("type")
                        if qtype == "mc" and len(opts) != 4:
                            valid = False
                            log_fail("AI question validation", f"MC should have 4 options, got {len(opts)}")
                        elif qtype == "tf" and len(opts) != 2:
                            valid = False
                            log_fail("AI question validation", f"TF should have 2 options, got {len(opts)}")
                        elif qtype == "gap" and len(opts) != 0:
                            valid = False
                            log_fail("AI question validation", f"Gap should have 0 options, got {len(opts)}")
                
                if valid:
                    log_pass("POST /ai/generate-questions", f"Generated {count} valid questions (types: {[q['type'] for q in questions]})")
                else:
                    log_fail("POST /ai/generate-questions", "Questions generated but validation failed")
            else:
                log_fail("POST /ai/generate-questions", f"Expected 1-5 questions, got {count}")
        else:
            log_fail("POST /ai/generate-questions", f"Invalid response structure: {data}")
    else:
        log_fail("POST /ai/generate-questions", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /ai/generate-questions", f"Exception: {e}")

# Test 15: POST /ai/generate-questions (with image)
print("\n--- Test 15: POST /ai/generate-questions (with image) ---")
try:
    # Create a valid test image with real visual features
    image_b64 = create_test_image()
    
    payload = {
        "subject_name": "Deutsch",
        "count": 2,
        "image_base64": image_b64
    }
    resp = requests.post(f"{BASE_URL}/ai/generate-questions", json=payload, timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        if "questions" in data and isinstance(data["questions"], list):
            questions = data["questions"]
            count = len(questions)
            if count >= 1:
                log_pass("POST /ai/generate-questions (image)", f"Generated {count} questions from image")
            else:
                log_fail("POST /ai/generate-questions (image)", f"Expected at least 1 question, got {count}")
        else:
            log_fail("POST /ai/generate-questions (image)", f"Invalid response structure: {data}")
    else:
        log_fail("POST /ai/generate-questions (image)", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("POST /ai/generate-questions (image)", f"Exception: {e}")

# Print summary
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)
print(f"\n✅ PASSED: {len(test_results['passed'])}")
for result in test_results['passed']:
    print(f"  {result}")

if test_results['warnings']:
    print(f"\n⚠️  WARNINGS: {len(test_results['warnings'])}")
    for result in test_results['warnings']:
        print(f"  {result}")

if test_results['failed']:
    print(f"\n❌ FAILED: {len(test_results['failed'])}")
    for result in test_results['failed']:
        print(f"  {result}")
else:
    print("\n🎉 ALL TESTS PASSED!")

print("\n" + "="*80)
print(f"Total: {len(test_results['passed'])} passed, {len(test_results['warnings'])} warnings, {len(test_results['failed'])} failed")
print("="*80 + "\n")

# Exit with appropriate code
exit(0 if len(test_results['failed']) == 0 else 1)
