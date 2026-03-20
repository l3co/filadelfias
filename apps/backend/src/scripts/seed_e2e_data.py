"""
Seed script for E2E testing.

This script populates the PostgreSQL database with test data required
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

print("DEBUG: Script Start")
print(f"DEBUG: DATABASE_URL={os.getenv('DATABASE_URL')}")

# Defer imports to avoid early initialization
from src.infra.repositories.member_repository import member_repository  # noqa: E402
from src.infra.repositories.membership_repository import membership_repository  # noqa: E402
from src.infra.repositories.tenant_repository import tenant_repository  # noqa: E402
from src.infra.repositories.user_repository import user_repository  # noqa: E402

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

# RBAC test users - must match apps/web/e2e/support/fixtures.ts
TEST_PASTOR = {
    "email": "pastor@igreja.com",
    "password": "S3nh@Pastor",
    "name": "Rev. João Silva",
    "office": "PASTOR",
}

TEST_PRESBITERO = {
    "email": "presbitero@igreja.com",
    "password": "S3nh@Presb",
    "name": "Presb. Carlos Santos",
    "office": "PRESBITERO",
}

TEST_DIACONO = {
    "email": "diacono@igreja.com",
    "password": "S3nh@Diac",
    "name": "Diác. Pedro Lima",
    "office": "DIACONO",
}

TEST_TESOUREIRO = {
    "email": "tesoureiro@igreja.com",
    "password": "S3nh@Tes",
    "name": "Ana Tesoureira",
    "office": "MEMBRO",
    "functions": ["TESOUREIRO"],
}

TEST_SECRETARIO = {
    "email": "secretario@igreja.com",
    "password": "S3nh@Sec",
    "name": "José Secretário",
    "office": "MEMBRO",
    "functions": ["SECRETARIO"],
}

ALL_TEST_USERS = [TEST_ADMIN, TEST_MEMBER, TEST_PASTOR, TEST_PRESBITERO, TEST_DIACONO, TEST_TESOUREIRO, TEST_SECRETARIO]

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

    # Delete all test users if exist
    for test_user in ALL_TEST_USERS:
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

    # 7. Create RBAC test users (Pastor, Presbítero, Diácono, Tesoureiro, Secretário)
    rbac_users = [TEST_PASTOR, TEST_PRESBITERO, TEST_DIACONO, TEST_TESOUREIRO, TEST_SECRETARIO]
    for test_user in rbac_users:
        print(f"  Creating {test_user['office']} user: {test_user['name']}...")

        # Create user
        user = await user_repository.create_user(
            email=test_user["email"],
            name=test_user["name"],
            password=test_user["password"],
        )

        # Create membership (ADMIN for officers, MEMBER for functions)
        role = "ADMIN" if test_user["office"] in ["PASTOR", "PRESBITERO", "DIACONO"] else "MEMBER"
        await membership_repository.create_membership(
            user_id=user["id"],
            tenant_id=tenant["id"],
            role=role,
            status="ACTIVE",
        )

        # Create member profile with office
        await member_repository.create_member(
            tenant_id=tenant["id"],
            full_name=test_user["name"],
            email=test_user["email"],
            phone="(11) 77777-7777",
            status="COMUNGANTE",
            office=test_user["office"],
            functions=test_user.get("functions"),
            user_id=user["id"],
        )
        print(f"  ✓ {test_user['office']} created: {test_user['email']}")

    # 8. Create sample Missionary
    from src.modules.missions.repository import missionary_repository
    from src.modules.missions.schemas import MissionaryCreate

    print("  Creating sample missionary...")
    mission_data = MissionaryCreate(
        name="Missionário Paulo",
        field_name="África do Sul",
        country_code="ZA",
        latitude=-30.5595,
        longitude=22.9375,
        bio="Missionário teste",
    )
    missionary = await missionary_repository.create(tenant["id"], mission_data)
    print(f"  ✓ Missionary created: {missionary['name']}")

    # 8. Create sample EBD Class
    from src.modules.ebd.repository import ebd_class_repository

    print("  Creating sample EBD class...")
    ebd_class = await ebd_class_repository.create_class(
        tenant_id=tenant["id"],
        name="Jovens",
        description="Estudo Bíblico para jovens",
        location="Sala 1",
        min_age=18,
        max_age=30,
    )
    print(f"  ✓ EBD Class created: {ebd_class['name']}")

    # 9. Create sample Financial Accounts, Categories and Transactions
    from src.modules.financial.repository import (
        financial_account_repository,
        transaction_category_repository,
        transaction_repository,
    )

    print("  Creating sample financial accounts...")
    account_bank = await financial_account_repository.create_account(
        tenant_id=tenant["id"],
        name="Banco do Brasil",
        type="BANK",
        balance=10000.0,
    )
    print(f"  ✓ Financial Account created: {account_bank['name']}")

    account_cash = await financial_account_repository.create_account(
        tenant_id=tenant["id"],
        name="Caixa Geral",
        type="CASH",
        balance=500.0,
    )
    print(f"  ✓ Financial Account created: {account_cash['name']}")

    print("  Creating sample financial categories...")
    cat_tithe = await transaction_category_repository.create_category(
        tenant_id=tenant["id"],
        name="Dízimos",
        type="INCOME",
    )
    print(f"  ✓ Category created: {cat_tithe['name']}")

    cat_offering = await transaction_category_repository.create_category(
        tenant_id=tenant["id"],
        name="Ofertas",
        type="INCOME",
    )
    print(f"  ✓ Category created: {cat_offering['name']}")

    cat_utilities = await transaction_category_repository.create_category(
        tenant_id=tenant["id"],
        name="Contas de Consumo",
        type="EXPENSE",
    )
    print(f"  ✓ Category created: {cat_utilities['name']}")

    print("  Creating sample transactions (12+ for pagination test)...")
    from datetime import date

    transactions_data = [
        {"description": "Dízimo Janeiro", "amount": 500, "type": "CREDIT", "date": date(2026, 1, 5)},
        {"description": "Oferta Culto", "amount": 150, "type": "CREDIT", "date": date(2026, 1, 7)},
        {"description": "Conta de Luz", "amount": 200, "type": "DEBIT", "date": date(2026, 1, 10)},
        {"description": "Dízimo Janeiro", "amount": 800, "type": "CREDIT", "date": date(2026, 1, 12)},
        {"description": "Oferta Missões", "amount": 300, "type": "CREDIT", "date": date(2026, 1, 14)},
        {"description": "Material Limpeza", "amount": 50, "type": "DEBIT", "date": date(2026, 1, 15)},
        {"description": "Dízimo Janeiro", "amount": 1200, "type": "CREDIT", "date": date(2026, 1, 18)},
        {"description": "Conta de Água", "amount": 80, "type": "DEBIT", "date": date(2026, 1, 20)},
        {"description": "Oferta Especial", "amount": 500, "type": "CREDIT", "date": date(2026, 1, 22)},
        {"description": "Manutenção", "amount": 350, "type": "DEBIT", "date": date(2026, 1, 24)},
        {"description": "Dízimo Janeiro", "amount": 600, "type": "CREDIT", "date": date(2026, 1, 25)},
        {"description": "Internet", "amount": 120, "type": "DEBIT", "date": date(2026, 1, 26)},
    ]
    for tx in transactions_data:
        cat_id = (
            cat_tithe["id"]
            if "Dízimo" in tx["description"]
            else (cat_offering["id"] if "Oferta" in tx["description"] else cat_utilities["id"])
        )
        await transaction_repository.create_transaction(
            tenant_id=tenant["id"],
            account_id=account_bank["id"],
            category_id=cat_id,
            description=tx["description"],
            amount=tx["amount"],
            transaction_type=tx["type"],
            transaction_date=tx["date"],
        )
    print(f"  ✓ {len(transactions_data)} transactions created")

    # 9b. Create sample Tithe Records (pending for treasurer approval)
    from src.modules.tithe.repository import tithe_record_repository

    print("  Creating sample tithe records...")
    # Get member_id for the member user
    member_records = await member_repository.get_all(tenant["id"])
    member_with_user = next((m for m in member_records if m.get("user_id") == member_user["id"]), None)

    if member_with_user:
        # Create pending tithe record
        tithe_pending = await tithe_record_repository.create(
            tenant_id=tenant["id"],
            member_id=member_with_user["id"],
            amount=500.0,
            type="DIZIMO",
            date=date(2026, 1, 15),
            notes="Dízimo de janeiro - aguardando aprovação",
        )
        print(f"  ✓ Tithe record created (PENDING): R$ {tithe_pending['amount']}")

        # Create another pending offering
        tithe_pending2 = await tithe_record_repository.create(
            tenant_id=tenant["id"],
            member_id=member_with_user["id"],
            amount=200.0,
            type="OFERTA",
            date=date(2026, 1, 20),
            notes="Oferta missionária",
        )
        print(f"  ✓ Tithe record created (PENDING): R$ {tithe_pending2['amount']}")
    else:
        print("  ⚠ Could not create tithe records - member not found")

    # 10. Create sample Governance Council
    from src.modules.governance.repository import council_repository

    print("  Creating sample council...")
    council = await council_repository.create_council(
        tenant_id=tenant["id"],
        name="Conselho da Igreja",
        type="SESSION",  # Enum value
        description="Reunião de Presbíteros",
    )
    print(f"  ✓ Council created: {council['name']}")

    # 11. Create test member "Pedro Santos" for EBD tests
    print("  Creating test member Pedro Santos...")
    pedro_member = await member_repository.create_member(
        tenant_id=tenant["id"],
        full_name="Pedro Santos",
        email="pedro@email.com",
        phone="(11) 77777-7777",
        status="COMUNGANTE",
        office="MEMBRO",
    )
    print(f"  ✓ Member created: {pedro_member['full_name']}")

    # 12. Create sample Devotional (today)
    from datetime import date, datetime, timedelta

    from src.modules.devotionals.repository import devotional_repository
    from src.modules.devotionals.schemas import DevotionalCreate

    print("  Creating sample devotional...")
    devotional_data = DevotionalCreate(
        title="O Amor de Deus",
        date=date.today(),
        verse_reference="João 3:16",
        verse_text="Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
        meditation="O amor de Deus é incondicional e eterno. Ele nos amou primeiro, quando ainda éramos pecadores. Este amor não depende de nossas ações ou méritos, mas da natureza de Deus, que é amor.",
        reflection="Como você tem respondido ao amor de Deus em sua vida?",
        prayer="Senhor, obrigado pelo Teu amor incondicional. Ajuda-me a amar os outros como Tu me amas. Amém.",
    )
    devotional = await devotional_repository.create(tenant["id"], devotional_data)
    print(f"  ✓ Devotional created: {devotional['title']}")

    # 13. Create sample Prayer Request
    from src.modules.prayer.repository import prayer_request_repository
    from src.modules.prayer.schemas import PrayerRequestCreate

    print("  Creating sample prayer request...")
    prayer_data = PrayerRequestCreate(
        content="Oração pela minha família que está passando por dificuldades financeiras.",
        category="family",
        is_anonymous=False,
    )
    await prayer_request_repository.create(tenant["id"], member_profile["id"], TEST_MEMBER["name"], prayer_data)
    print("  ✓ Prayer request created")

    # 14. Create sample Event (future)
    from src.modules.events.repository import event_repository
    from src.modules.events.schemas import EventCreate

    print("  Creating sample events...")
    event_data = EventCreate(
        title="Culto de Celebração",
        description="Culto dominical de celebração e louvor",
        location="Templo Principal",
        start_date=datetime.now() + timedelta(days=3),
        category="culto",
    )
    event = await event_repository.create(tenant["id"], event_data)
    print(f"  ✓ Event created: {event['title']}")

    # Create another future event
    event_data2 = EventCreate(
        title="Conferência Missionária",
        description="Conferência anual de missões",
        location="Auditório Central",
        start_date=datetime.now() + timedelta(days=30),
        category="conferencia",
    )
    event2 = await event_repository.create(tenant["id"], event_data2)
    print(f"  ✓ Event created: {event2['title']}")

    return {
        "tenant": tenant,
        "admin_user": admin_user,
        "member_user": member_user,
        "pedro_member": pedro_member,
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
