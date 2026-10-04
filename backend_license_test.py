#!/usr/bin/env python3
"""
Backend License Management Test Suite for LAP QUIZ
Tests admin features and license redemption flow
"""
import requests
import json
import uuid
from pathlib import Path

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
    "failed": []
}

def log_pass(test_name, details=""):
    test_results["passed"].append(f"✅ {test_name}: {details}")
    print(f"✅ PASS: {test_name} - {details}")

def log_fail(test_name, details=""):
    test_results["failed"].append(f"❌ {test_name}: {details}")
    print(f"❌ FAIL: {test_name} - {details}")

print("\n" + "="*80)
print("LAP QUIZ LICENSE MANAGEMENT TEST SUITE")
print("="*80 + "\n")

# Global variables to store tokens and IDs
admin_token = None
admin_user = None
normal_token = None
normal_user = None
normal_token2 = None
normal_user2 = None
normal_token3 = None
normal_user3 = None
created_license_id = None
created_license_code = None
explicit_license_id = None
explicit_license_code = None

# Test 1: Register/login ADMIN user with admin@lapquiz.ch
print("\n--- Test 1: Register/login ADMIN user (admin@lapquiz.ch) ---")
try:
    # Try to register first
    resp = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": "admin@lapquiz.ch", "password": "pw12345", "name": "Admin User"},
        timeout=10
    )
    
    if resp.status_code == 400 and "bereits registriert" in resp.text:
        # User already exists, try login
        print("Admin user already exists, attempting login...")
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@lapquiz.ch", "password": "pw12345"},
            timeout=10
        )
    
    if resp.status_code == 200:
        data = resp.json()
        if "user" in data and "session_token" in data:
            admin_user = data["user"]
            admin_token = data["session_token"]
            
            if admin_user.get("role") == "admin":
                log_pass("Admin registration/login", f"Admin user logged in with role=admin, token={admin_token[:20]}...")
            else:
                log_fail("Admin registration/login", f"User role is '{admin_user.get('role')}', expected 'admin'")
        else:
            log_fail("Admin registration/login", f"Missing user or session_token in response: {data}")
    else:
        log_fail("Admin registration/login", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("Admin registration/login", f"Exception: {e}")

# Test 2: Register a NORMAL user
print("\n--- Test 2: Register NORMAL user ---")
try:
    random_email = f"user{uuid.uuid4().hex[:8]}@test.com"
    resp = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": random_email, "password": "testpass123", "name": "Normal User"},
        timeout=10
    )
    
    if resp.status_code == 200:
        data = resp.json()
        if "user" in data and "session_token" in data:
            normal_user = data["user"]
            normal_token = data["session_token"]
            
            if normal_user.get("role") == "user":
                log_pass("Normal user registration", f"Normal user registered with role=user, email={random_email}")
            else:
                log_fail("Normal user registration", f"User role is '{normal_user.get('role')}', expected 'user'")
        else:
            log_fail("Normal user registration", f"Missing user or session_token in response: {data}")
    else:
        log_fail("Normal user registration", f"Status {resp.status_code}: {resp.text}")
except Exception as e:
    log_fail("Normal user registration", f"Exception: {e}")

# Test 3: GET /admin/licenses as admin
print("\n--- Test 3: GET /admin/licenses as admin ---")
if admin_token:
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                # Check for seeded codes
                codes = [lic.get("code") for lic in data]
                seeded_codes = ["LAP-PRO-2025", "LAPQUIZ-LIFETIME", "DEMO-UNLOCK"]
                found_seeded = [code for code in seeded_codes if code in codes]
                
                if len(found_seeded) == 3:
                    log_pass("GET /admin/licenses (admin)", f"Returns list with {len(data)} licenses including 3 seeded codes: {found_seeded}")
                else:
                    log_fail("GET /admin/licenses (admin)", f"Expected 3 seeded codes, found: {found_seeded}")
            else:
                log_fail("GET /admin/licenses (admin)", f"Response is not a list: {type(data)}")
        else:
            log_fail("GET /admin/licenses (admin)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /admin/licenses (admin)", f"Exception: {e}")
else:
    log_fail("GET /admin/licenses (admin)", "Skipped - no admin token")

# Test 4: GET /admin/licenses as normal user (should be 403)
print("\n--- Test 4: GET /admin/licenses as normal user (should be 403) ---")
if normal_token:
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {normal_token}"},
            timeout=10
        )
        
        if resp.status_code == 403:
            log_pass("GET /admin/licenses (normal user)", "Correctly returns 403 Forbidden")
        else:
            log_fail("GET /admin/licenses (normal user)", f"Expected 403, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /admin/licenses (normal user)", f"Exception: {e}")
else:
    log_fail("GET /admin/licenses (normal user)", "Skipped - no normal user token")

# Test 5: POST /admin/licenses with auto-generated code
print("\n--- Test 5: POST /admin/licenses with auto-generated code ---")
if admin_token:
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"note": "Promo", "max_uses": 2},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if "id" in data and "code" in data:
                created_license_id = data["id"]
                created_license_code = data["code"]
                
                # Verify code starts with "LAP-"
                if data["code"].startswith("LAP-"):
                    # Verify other fields
                    if (data.get("active") == True and 
                        data.get("uses") == 0 and 
                        data.get("max_uses") == 2 and
                        data.get("note") == "Promo"):
                        log_pass("POST /admin/licenses (auto-generated)", 
                                f"Created license with code={data['code']}, id={created_license_id}, active=True, uses=0, max_uses=2")
                    else:
                        log_fail("POST /admin/licenses (auto-generated)", 
                                f"Field mismatch: active={data.get('active')}, uses={data.get('uses')}, max_uses={data.get('max_uses')}, note={data.get('note')}")
                else:
                    log_fail("POST /admin/licenses (auto-generated)", f"Code '{data['code']}' does not start with 'LAP-'")
            else:
                log_fail("POST /admin/licenses (auto-generated)", f"Missing id or code in response: {data}")
        else:
            log_fail("POST /admin/licenses (auto-generated)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /admin/licenses (auto-generated)", f"Exception: {e}")
else:
    log_fail("POST /admin/licenses (auto-generated)", "Skipped - no admin token")

# Test 6: POST /admin/licenses with explicit code
print("\n--- Test 6: POST /admin/licenses with explicit code ---")
if admin_token:
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"code": "mycode1", "note": "Explicit code test", "max_uses": 1},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if "id" in data and "code" in data:
                explicit_license_id = data["id"]
                explicit_license_code = data["code"]
                
                # Verify code is uppercased
                if data["code"] == "MYCODE1":
                    log_pass("POST /admin/licenses (explicit code)", 
                            f"Created license with uppercased code=MYCODE1, id={explicit_license_id}")
                else:
                    log_fail("POST /admin/licenses (explicit code)", 
                            f"Code '{data['code']}' is not uppercased (expected 'MYCODE1')")
            else:
                log_fail("POST /admin/licenses (explicit code)", f"Missing id or code in response: {data}")
        else:
            log_fail("POST /admin/licenses (explicit code)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /admin/licenses (explicit code)", f"Exception: {e}")
else:
    log_fail("POST /admin/licenses (explicit code)", "Skipped - no admin token")

# Test 7: POST /admin/licenses with duplicate code (should be 400)
print("\n--- Test 7: POST /admin/licenses with duplicate code (should be 400) ---")
if admin_token and explicit_license_code:
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"code": explicit_license_code, "note": "Duplicate test"},
            timeout=10
        )
        
        if resp.status_code == 400:
            log_pass("POST /admin/licenses (duplicate)", "Correctly returns 400 for duplicate code")
        else:
            log_fail("POST /admin/licenses (duplicate)", f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /admin/licenses (duplicate)", f"Exception: {e}")
else:
    log_fail("POST /admin/licenses (duplicate)", "Skipped - no admin token or explicit code")

# Test 8: GET /admin/stats as admin
print("\n--- Test 8: GET /admin/stats as admin ---")
if admin_token:
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            required_fields = ["total_users", "licensed_users", "total_codes", "active_codes"]
            
            if all(field in data for field in required_fields):
                # Verify all values are numbers
                if all(isinstance(data[field], int) for field in required_fields):
                    log_pass("GET /admin/stats (admin)", 
                            f"Returns stats: total_users={data['total_users']}, licensed_users={data['licensed_users']}, total_codes={data['total_codes']}, active_codes={data['active_codes']}")
                else:
                    log_fail("GET /admin/stats (admin)", f"Some values are not integers: {data}")
            else:
                log_fail("GET /admin/stats (admin)", f"Missing required fields. Got: {data}")
        else:
            log_fail("GET /admin/stats (admin)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /admin/stats (admin)", f"Exception: {e}")
else:
    log_fail("GET /admin/stats (admin)", "Skipped - no admin token")

# Test 9: GET /admin/stats as normal user (should be 403)
print("\n--- Test 9: GET /admin/stats as normal user (should be 403) ---")
if normal_token:
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/stats",
            headers={"Authorization": f"Bearer {normal_token}"},
            timeout=10
        )
        
        if resp.status_code == 403:
            log_pass("GET /admin/stats (normal user)", "Correctly returns 403 Forbidden")
        else:
            log_fail("GET /admin/stats (normal user)", f"Expected 403, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /admin/stats (normal user)", f"Exception: {e}")
else:
    log_fail("GET /admin/stats (normal user)", "Skipped - no normal user token")

# Test 10: POST /auth/redeem with valid code
print("\n--- Test 10: POST /auth/redeem with valid code (DEMO-UNLOCK) ---")
if normal_token:
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/redeem",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={"code": "DEMO-UNLOCK"},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("licensed") == True:
                log_pass("POST /auth/redeem (valid code)", f"User licensed=True after redeeming DEMO-UNLOCK")
                
                # Verify license uses incremented
                if admin_token:
                    resp2 = requests.get(
                        f"{BASE_URL}/admin/licenses",
                        headers={"Authorization": f"Bearer {admin_token}"},
                        timeout=10
                    )
                    if resp2.status_code == 200:
                        licenses = resp2.json()
                        demo_lic = next((lic for lic in licenses if lic.get("code") == "DEMO-UNLOCK"), None)
                        if demo_lic:
                            if demo_lic.get("uses") >= 1 and normal_user["user_id"] in demo_lic.get("used_by", []):
                                log_pass("License uses verification", f"DEMO-UNLOCK uses={demo_lic.get('uses')}, user in used_by list")
                            else:
                                log_fail("License uses verification", f"uses={demo_lic.get('uses')}, used_by={demo_lic.get('used_by')}")
            else:
                log_fail("POST /auth/redeem (valid code)", f"User licensed={data.get('licensed')}, expected True")
        else:
            log_fail("POST /auth/redeem (valid code)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /auth/redeem (valid code)", f"Exception: {e}")
else:
    log_fail("POST /auth/redeem (valid code)", "Skipped - no normal user token")

# Test 11: POST /auth/redeem with unknown code
print("\n--- Test 11: POST /auth/redeem with unknown code (NOPE) ---")
if normal_token:
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/redeem",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={"code": "NOPE"},
            timeout=10
        )
        
        if resp.status_code == 400:
            if "Ungültiger Lizenzcode" in resp.text:
                log_pass("POST /auth/redeem (unknown code)", "Correctly returns 400 'Ungültiger Lizenzcode'")
            else:
                log_fail("POST /auth/redeem (unknown code)", f"Returns 400 but wrong message: {resp.text}")
        else:
            log_fail("POST /auth/redeem (unknown code)", f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /auth/redeem (unknown code)", f"Exception: {e}")
else:
    log_fail("POST /auth/redeem (unknown code)", "Skipped - no normal user token")

# Test 12: PATCH /admin/licenses/{id} to deactivate, then redeem
print("\n--- Test 12: PATCH /admin/licenses/{id} to deactivate, then redeem ---")
if admin_token and created_license_id and created_license_code:
    try:
        # First, deactivate the license
        resp = requests.patch(
            f"{BASE_URL}/admin/licenses/{created_license_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"active": False},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("active") == False:
                log_pass("PATCH /admin/licenses/{id}", f"Successfully deactivated license {created_license_id}")
                
                # Now try to redeem with a new user
                random_email2 = f"user{uuid.uuid4().hex[:8]}@test.com"
                resp2 = requests.post(
                    f"{BASE_URL}/auth/register",
                    json={"email": random_email2, "password": "testpass123", "name": "Normal User 2"},
                    timeout=10
                )
                
                if resp2.status_code == 200:
                    normal_token2 = resp2.json()["session_token"]
                    
                    # Try to redeem the deactivated code
                    resp3 = requests.post(
                        f"{BASE_URL}/auth/redeem",
                        headers={"Authorization": f"Bearer {normal_token2}"},
                        json={"code": created_license_code},
                        timeout=10
                    )
                    
                    if resp3.status_code == 400:
                        if "gesperrt" in resp3.text:
                            log_pass("POST /auth/redeem (deactivated)", "Correctly returns 400 'gesperrt' for deactivated code")
                        else:
                            log_fail("POST /auth/redeem (deactivated)", f"Returns 400 but wrong message: {resp3.text}")
                    else:
                        log_fail("POST /auth/redeem (deactivated)", f"Expected 400, got {resp3.status_code}: {resp3.text}")
                else:
                    log_fail("POST /auth/redeem (deactivated)", f"Failed to register user 2: {resp2.status_code}")
            else:
                log_fail("PATCH /admin/licenses/{id}", f"License active={data.get('active')}, expected False")
        else:
            log_fail("PATCH /admin/licenses/{id}", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("PATCH /admin/licenses/{id}", f"Exception: {e}")
else:
    log_fail("PATCH /admin/licenses/{id}", "Skipped - missing admin token or created license")

# Test 13: Create license with max_uses=1, redeem twice
print("\n--- Test 13: Create license with max_uses=1, redeem twice ---")
if admin_token:
    try:
        # Create a license with max_uses=1
        resp = requests.post(
            f"{BASE_URL}/admin/licenses",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"note": "Single use", "max_uses": 1},
            timeout=10
        )
        
        if resp.status_code == 200:
            single_use_license = resp.json()
            single_use_code = single_use_license["code"]
            
            # Register first user and redeem
            random_email3 = f"user{uuid.uuid4().hex[:8]}@test.com"
            resp2 = requests.post(
                f"{BASE_URL}/auth/register",
                json={"email": random_email3, "password": "testpass123", "name": "User 3"},
                timeout=10
            )
            
            if resp2.status_code == 200:
                normal_token3 = resp2.json()["session_token"]
                
                # First redemption (should succeed)
                resp3 = requests.post(
                    f"{BASE_URL}/auth/redeem",
                    headers={"Authorization": f"Bearer {normal_token3}"},
                    json={"code": single_use_code},
                    timeout=10
                )
                
                if resp3.status_code == 200:
                    log_pass("POST /auth/redeem (first use)", f"First user successfully redeemed {single_use_code}")
                    
                    # Register second user and try to redeem same code
                    random_email4 = f"user{uuid.uuid4().hex[:8]}@test.com"
                    resp4 = requests.post(
                        f"{BASE_URL}/auth/register",
                        json={"email": random_email4, "password": "testpass123", "name": "User 4"},
                        timeout=10
                    )
                    
                    if resp4.status_code == 200:
                        normal_token4 = resp4.json()["session_token"]
                        
                        # Second redemption (should fail)
                        resp5 = requests.post(
                            f"{BASE_URL}/auth/redeem",
                            headers={"Authorization": f"Bearer {normal_token4}"},
                            json={"code": single_use_code},
                            timeout=10
                        )
                        
                        if resp5.status_code == 400:
                            if "Limit erreicht" in resp5.text or "limit" in resp5.text.lower():
                                log_pass("POST /auth/redeem (max_uses limit)", "Correctly returns 400 limit reached for second user")
                            else:
                                log_fail("POST /auth/redeem (max_uses limit)", f"Returns 400 but wrong message: {resp5.text}")
                        else:
                            log_fail("POST /auth/redeem (max_uses limit)", f"Expected 400, got {resp5.status_code}: {resp5.text}")
                    else:
                        log_fail("POST /auth/redeem (max_uses limit)", f"Failed to register user 4: {resp4.status_code}")
                else:
                    log_fail("POST /auth/redeem (first use)", f"First redemption failed: {resp3.status_code} {resp3.text}")
            else:
                log_fail("POST /auth/redeem (first use)", f"Failed to register user 3: {resp2.status_code}")
        else:
            log_fail("Create single-use license", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("Create single-use license", f"Exception: {e}")
else:
    log_fail("Create single-use license", "Skipped - no admin token")

# Test 14: DELETE /admin/licenses/{id}
print("\n--- Test 14: DELETE /admin/licenses/{id} ---")
if admin_token and explicit_license_id:
    try:
        resp = requests.delete(
            f"{BASE_URL}/admin/licenses/{explicit_license_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok"):
                log_pass("DELETE /admin/licenses/{id}", f"Successfully deleted license {explicit_license_id}")
                
                # Verify it's gone from the list
                resp2 = requests.get(
                    f"{BASE_URL}/admin/licenses",
                    headers={"Authorization": f"Bearer {admin_token}"},
                    timeout=10
                )
                
                if resp2.status_code == 200:
                    licenses = resp2.json()
                    deleted_lic = next((lic for lic in licenses if lic.get("id") == explicit_license_id), None)
                    if deleted_lic is None:
                        log_pass("DELETE verification", f"License {explicit_license_id} no longer in list")
                    else:
                        log_fail("DELETE verification", f"License {explicit_license_id} still in list")
            else:
                log_fail("DELETE /admin/licenses/{id}", f"Response not ok: {data}")
        else:
            log_fail("DELETE /admin/licenses/{id}", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("DELETE /admin/licenses/{id}", f"Exception: {e}")
else:
    log_fail("DELETE /admin/licenses/{id}", "Skipped - missing admin token or explicit license ID")

# Test 15: Confirm GET /auth/me includes role field
print("\n--- Test 15: Confirm GET /auth/me includes role field ---")
if admin_token:
    try:
        resp = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if "role" in data:
                if data["role"] == "admin":
                    log_pass("GET /auth/me (role field)", f"Admin user has role=admin")
                else:
                    log_fail("GET /auth/me (role field)", f"Admin user has role={data['role']}, expected admin")
            else:
                log_fail("GET /auth/me (role field)", "Missing 'role' field in response")
        else:
            log_fail("GET /auth/me (role field)", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("GET /auth/me (role field)", f"Exception: {e}")
else:
    log_fail("GET /auth/me (role field)", "Skipped - no admin token")

# Test 16: Confirm POST /entities/Question/list returns 24 curated questions
print("\n--- Test 16: Confirm POST /entities/Question/list returns curated questions ---")
if normal_token:
    try:
        resp = requests.post(
            f"{BASE_URL}/entities/Question/list",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={"limit": 100},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                count = len(data)
                if count == 24:
                    log_pass("POST /entities/Question/list", f"Returns {count} curated questions")
                else:
                    log_fail("POST /entities/Question/list", f"Expected 24 questions, got {count}")
            else:
                log_fail("POST /entities/Question/list", f"Response is not a list: {type(data)}")
        else:
            log_fail("POST /entities/Question/list", f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_fail("POST /entities/Question/list", f"Exception: {e}")
else:
    log_fail("POST /entities/Question/list", "Skipped - no normal user token")

# Print summary
print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)
print(f"\n✅ PASSED: {len(test_results['passed'])}")
for result in test_results['passed']:
    print(f"  {result}")

if test_results['failed']:
    print(f"\n❌ FAILED: {len(test_results['failed'])}")
    for result in test_results['failed']:
        print(f"  {result}")
else:
    print("\n🎉 ALL TESTS PASSED!")

print("\n" + "="*80)
print(f"Total: {len(test_results['passed'])} passed, {len(test_results['failed'])} failed")
print("="*80 + "\n")

# Exit with appropriate code
exit(0 if len(test_results['failed']) == 0 else 1)
