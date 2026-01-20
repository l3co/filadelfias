"""
Seed script for E2E testing.

This script populates the Firestore database with test data required
for running integration E2E tests.

Usage:
    python -m src.scripts.seed_e2e_data

Or via Poetry:
    poetry run python -m src.scripts.seed_e2e_data
"""

import asyncio
import os

# Configure environment for testing
os.environ.setdefault("ENVIRONMENT", "development")

from src.infra.repositories.member_repository import member_repository
from src.infra.repositories.membership_repository import membership_repository
from src.infra.repositories.tenant_repository import tenant_repository
from src.infra.repositories.user_repository import user_repository


# Test data constants - must match apps/web/e2e/support/fixtures.ts
TEST_ADMIN = {
    "email": "admin@igreja.com",
    "password": "MinhaS3nh@Segura",
    "name": "Administrador Teste",
}

TEST_MEMBER = {
    "email": "membro@igreja.com",
    "password": "S3nh@Membro",
    "name": "Maria Silva",
}

TEST_CHURCH = {
    "name": "Igreja Teste E2E",
    "slug": "igreja-teste-e2e",
    "street": "Av. Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "01310-100",
    "phone": "(11) 99999-9999",
    "email": "contato@igreja-teste.com",
}


async def clean_test_data():
    """Remove existing test data before seeding."""
    print("🧹 Cleaning existing test data...")

    # Delete test users if exist
    for test_user in [TEST_ADMIN, TEST_MEMBER]:
        existing_user = await user_repository.get_by_email(test_user["email"])
        if existing_user:
            # Delete memberships first
            memberships = await membership_repository.get_user_memberships(existing_user["id"])
            for m in memberships:
                await membership_repository.delete(m["id"])
            # Delete user
            await user_repository.delete(existing_user["id"])
            print(f"  ✓ Deleted user: {test_user['email']}")

    # Delete test church if exists
    existing_tenant = await tenant_repository.get_by_slug(TEST_CHURCH["slug"])
    if existing_tenant:
        # Delete members (tenant-scoped)
        members = await member_repository.get_all(existing_tenant["id"])
        for m in members:
            await member_repository.delete(existing_tenant["id"], m["id"])
        # Delete tenant
        await tenant_repository.delete(existing_tenant["id"])
        print(f"  ✓ Deleted church: {TEST_CHURCH['slug']}")


async def seed_test_data():
    """Create test data for E2E tests."""
    print("\n🌱 Seeding test data...")

    # 1. Create test church
    print("  Creating test church...")
    tenant = await tenant_repository.create_tenant(
        name=TEST_CHURCH["name"],
        slug=TEST_CHURCH["slug"],
        street=TEST_CHURCH["street"],
        number=TEST_CHURCH["number"],
        neighborhood=TEST_CHURCH["neighborhood"],
        city=TEST_CHURCH["city"],
        state=TEST_CHURCH["state"],
        postal_code=TEST_CHURCH["postal_code"],
        phone=TEST_CHURCH["phone"],
        email=TEST_CHURCH["email"],
    )
    print(f"  ✓ Church created: {tenant['name']} (ID: {tenant['id']})")

    # 2. Create admin user
    print("  Creating admin user...")
    admin_user = await user_repository.create_user(
        email=TEST_ADMIN["email"],
        name=TEST_ADMIN["name"],
        password=TEST_ADMIN["password"],
    )
    print(f"  ✓ Admin user created: {admin_user['email']} (ID: {admin_user['id']})")

    # 3. Create membership for admin (ADMIN role)
    print("  Creating admin membership...")
    admin_membership = await membership_repository.create_membership(
        user_id=admin_user["id"],
        tenant_id=tenant["id"],
        role="ADMIN",
        status="ACTIVE",
    )
    print(f"  ✓ Admin membership created (ID: {admin_membership['id']})")

    # 4. Create member user
    print("  Creating member user...")
    member_user = await user_repository.create_user(
        email=TEST_MEMBER["email"],
        name=TEST_MEMBER["name"],
        password=TEST_MEMBER["password"],
    )
    print(f"  ✓ Member user created: {member_user['email']} (ID: {member_user['id']})")

    # 5. Create membership for member (MEMBER role)
    print("  Creating member membership...")
    member_membership = await membership_repository.create_membership(
        user_id=member_user["id"],
        tenant_id=tenant["id"],
        role="MEMBER",
        status="ACTIVE",
    )
    print(f"  ✓ Member membership created (ID: {member_membership['id']})")

    # 6. Create member profile (tenant-scoped)
    print("  Creating member profile...")
    member_profile = await member_repository.create_member(
        tenant_id=tenant["id"],
        full_name=TEST_MEMBER["name"],
        email=TEST_MEMBER["email"],
        phone="(11) 88888-8888",
        status="COMUNGANTE",
        office="MEMBRO",
        user_id=member_user["id"],
    )
    print(f"  ✓ Member profile created (ID: {member_profile['id']})")

    return {
        "tenant": tenant,
        "admin_user": admin_user,
        "member_user": member_user,
    }


async def main():
    """Main function to run the seed script."""
    print("=" * 60)
    print("🧪 E2E Test Data Seeder")
    print("=" * 60)

    try:
        await clean_test_data()
        await seed_test_data()

        print("\n" + "=" * 60)
        print("✅ Seed completed successfully!")
        print("=" * 60)
        print("\nTest credentials:")
        print(f"  Admin: {TEST_ADMIN['email']} / {TEST_ADMIN['password']}")
        print(f"  Member: {TEST_MEMBER['email']} / {TEST_MEMBER['password']}")
        print(f"  Church: {TEST_CHURCH['name']} ({TEST_CHURCH['slug']})")
        print("\n")

    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(main())
