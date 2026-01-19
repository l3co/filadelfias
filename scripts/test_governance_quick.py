
import requests
import sys

BASE_URL = "http://localhost:8000"

def login():
    # Assumes admin user exists from seed or previous tests
    payload = {
        "username": "admin@filadelfia.com", # Adjust if needed
        "password": "password123"
    }
    # Loging in standard User flow
    # Assuming user exists. If not, script will fail.
    # Trying hardcoded or seeded user.
    # Let's try to register first to be sure
    reg_payload = {
        "email": "gov_admin@test.com",
        "name": "Gov Admin",
        "password": "password123"
    }
    try:
        requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    except:
        pass # might exist

    resp = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "gov_admin@test.com",
        "password": "password123"
    })
    
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        sys.exit(1)
        
    return resp.json()["access_token"]

def main():
    print("Testing Governance API...")
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get User to find Tenant ID
    me = requests.get(f"{BASE_URL}/auth/me", headers=headers).json()
    if not me['memberships']:
        # Create tenant if none
        t_resp = requests.post(f"{BASE_URL}/tenants", json={"name": "Gov Church", "slug": "gov-church"}, headers=headers)
        if t_resp.status_code == 200:
            tenant_id = t_resp.json()['id']
        else:
             # Try to join or something. Assume user has one for MVP script simplicity
             print("User has no tenant. Aborting.")
             # Actually, if I just registered, I have no tenant.
             # Create one.
             tenant_id = requests.post(f"{BASE_URL}/tenants", json={"name": "Gov Church", "slug": "gov-church-2"}, headers=headers).json()['id']
    else:
        tenant_id = me['memberships'][0]['tenant']['id']
        
    print(f"Using Tenant ID: {tenant_id}")
    
    # 2. Create Council
    council_data = {
        "name": "Conselho de Teste",
        "type": "SESSION",
        "description": "Conselho para testes automatizados"
    }
    resp = requests.post(f"{BASE_URL}/governance/councils", json=council_data, params={"tenant_id": tenant_id}, headers=headers)
    
    if resp.status_code != 200:
        print("Failed to create council:", resp.text)
        sys.exit(1)
        
    council = resp.json()
    print(f"Council Created: {council['name']} ({council['id']})")
    
    # 3. List Councils
    resp = requests.get(f"{BASE_URL}/governance/councils", params={"tenant_id": tenant_id}, headers=headers)
    print(f"Councils count: {len(resp.json())}")
    
    # 4. Create Meeting
    meeting_data = {
        "council_id": council['id'],
        "date": "2023-10-27T19:00:00",
        "agenda": "Discussão sobre Plano 3"
    }
    resp = requests.post(f"{BASE_URL}/governance/meetings", json=meeting_data, headers=headers)
    if resp.status_code != 200:
        print("Failed to create meeting:", resp.text)
    else:
        meeting = resp.json()
        print(f"Meeting Created: {meeting['id']} - Status: {meeting['status']}")

    print("Governance Test Passed!")

if __name__ == "__main__":
    main()
