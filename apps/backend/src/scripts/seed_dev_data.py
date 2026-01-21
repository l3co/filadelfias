"""
Seed script for development environment with rich, realistic data.

This script populates the Firestore database with comprehensive test data
for the Igreja Presbiteriana Filadélfia, including:
- 50-60 users with varied profiles
- Members with different functions
- EBD classes with students
- Financial accounts and transactions
- Governance meetings
- Missionaries and mission fields
- Events

Usage:
    python -m src.scripts.seed_dev_data

Or via Poetry:
    poetry run python -m src.scripts.seed_dev_data
"""

import asyncio
import os
import random
from datetime import datetime, timedelta
from uuid import uuid4

# Configure environment
os.environ.setdefault("ENVIRONMENT", "development")

print("🚀 Starting seed script for Igreja Presbiteriana Filadélfia")
print(f"FIRESTORE_EMULATOR_HOST={os.getenv('FIRESTORE_EMULATOR_HOST')}")
print(f"PROJECT_ID={os.getenv('PROJECT_ID')}")

# Defer imports
from src.infra.repositories.member_repository import member_repository  # noqa: E402
from src.infra.repositories.membership_repository import membership_repository  # noqa: E402
from src.infra.repositories.tenant_repository import tenant_repository  # noqa: E402
from src.infra.repositories.user_repository import user_repository  # noqa: E402
from src.modules.ebd.repository import ebd_class_repository, ebd_student_repository, ebd_lesson_repository  # noqa: E402
from src.modules.financial.repository import financial_account_repository, transaction_repository, transaction_category_repository  # noqa: E402
from src.modules.governance.repository import council_repository, meeting_repository  # noqa: E402

# Church data
CHURCH_DATA = {
    "name": "Igreja Presbiteriana Filadélfia",
    "slug": "ip-filadelfia",
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "01310-100",
    "phone": "(11) 3456-7890",
    "email": "contato@ipfiladelfia.org.br",
}

# Admin user
ADMIN_USER = {
    "email": "l3co@outlook.com",
    "password": "mudar@123",
    "name": "Leandro",
}

# Common password for all users
COMMON_PASSWORD = "mudar@123"

# Brazilian first names
FIRST_NAMES = [
    "João", "Maria", "José", "Ana", "Pedro", "Paula", "Carlos", "Juliana",
    "Fernando", "Beatriz", "Ricardo", "Camila", "Roberto", "Fernanda", "Marcos",
    "Patrícia", "Paulo", "Aline", "Rafael", "Carla", "Lucas", "Mariana",
    "Gabriel", "Letícia", "Daniel", "Renata", "Felipe", "Adriana", "Bruno",
    "Tatiana", "Rodrigo", "Vanessa", "Thiago", "Priscila", "Diego", "Simone",
    "Gustavo", "Daniela", "Leonardo", "Cristina", "Marcelo", "Sandra", "André",
    "Luciana", "Fábio", "Mônica", "Vinícius", "Elaine", "Mateus", "Silvia",
    "Henrique", "Raquel", "César", "Débora", "Alexandre", "Andréia", "Leandro",
    "Cláudia", "Antônio", "Rosana"
]

# Brazilian last names
LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Rocha", "Almeida", "Nascimento", "Araújo", "Melo", "Barbosa", "Cardoso",
    "Correia", "Dias", "Pinto", "Teixeira", "Moreira", "Monteiro", "Mendes",
    "Barros", "Freitas", "Cavalcanti", "Campos", "Duarte", "Reis", "Xavier"
]

# Member functions
MEMBER_FUNCTIONS = [
    "Presbítero", "Diácono", "Líder de Louvor", "Professor EBD", 
    "Tesoureiro", "Secretário", "Líder de Jovens", "Líder de Crianças",
    "Coordenador de Missões", "Líder de Célula", "Membro"
]

# EBD class names
EBD_CLASSES = [
    {"name": "Berçário", "age_group": "0-2 anos"},
    {"name": "Maternal", "age_group": "3-4 anos"},
    {"name": "Jardim", "age_group": "5-6 anos"},
    {"name": "Primários", "age_group": "7-8 anos"},
    {"name": "Juniores", "age_group": "9-10 anos"},
    {"name": "Adolescentes", "age_group": "11-14 anos"},
    {"name": "Jovens", "age_group": "15-25 anos"},
    {"name": "Adultos I", "age_group": "26-45 anos"},
    {"name": "Adultos II", "age_group": "46-65 anos"},
    {"name": "Terceira Idade", "age_group": "65+ anos"},
]

# Mission fields
MISSION_FIELDS = [
    {"name": "Amazônia", "country": "Brasil", "city": "Manaus"},
    {"name": "Nordeste", "country": "Brasil", "city": "Recife"},
    {"name": "África", "country": "Moçambique", "city": "Maputo"},
    {"name": "Ásia", "country": "Índia", "city": "Mumbai"},
]


def generate_email(name: str) -> str:
    """Generate email from name."""
    clean_name = name.lower().replace(" ", ".").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ã", "a").replace("õ", "o").replace("ç", "c")
    return f"{clean_name}@ipfiladelfia.org.br"


def generate_phone() -> str:
    """Generate random Brazilian phone."""
    return f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"


async def clean_existing_data():
    """Clean existing data for the church."""
    print("\n🧹 Cleaning existing data...")
    
    existing_tenant = await tenant_repository.get_by_slug(CHURCH_DATA["slug"])
    if existing_tenant:
        print(f"  Found existing church: {existing_tenant['name']}")
        # Delete all members
        members = await member_repository.get_all(existing_tenant["id"])
        for m in members:
            await member_repository.delete(existing_tenant["id"], m["id"])
        print(f"  ✓ Deleted {len(members)} members")
        
        # Delete tenant
        await tenant_repository.delete(existing_tenant["id"])
        print(f"  ✓ Deleted church")
    
    # Delete admin user if exists
    existing_admin = await user_repository.get_by_email(ADMIN_USER["email"])
    if existing_admin:
        memberships = await membership_repository.get_user_memberships(existing_admin["id"])
        for m in memberships:
            await membership_repository.delete(m["id"])
        await user_repository.delete(existing_admin["id"])
        print(f"  ✓ Deleted admin user")


async def create_church():
    """Create the church (tenant)."""
    print("\n🏛️  Creating church...")
    tenant = await tenant_repository.create_tenant(**CHURCH_DATA)
    print(f"  ✓ Created: {tenant['name']} (ID: {tenant['id']})")
    return tenant


async def create_admin_user(tenant_id: str):
    """Create admin user and membership."""
    print("\n👤 Creating admin user...")
    
    # Create user
    user = await user_repository.create_user(
        email=ADMIN_USER["email"],
        password=ADMIN_USER["password"],
        name=ADMIN_USER["name"],
    )
    print(f"  ✓ Created user: {user['name']} ({user['email']})")
    
    # Create membership
    membership = await membership_repository.create_membership(
        user_id=user["id"],
        tenant_id=tenant_id,
        role="admin",
    )
    print(f"  ✓ Created admin membership")
    
    # Create member profile
    member = await member_repository.create_member(
        tenant_id=tenant_id,
        full_name=user["name"],
        email=user["email"],
        phone=generate_phone(),
        birth_date=datetime(1990, 5, 15).date(),
        gender="M",
        status="COMUNGANTE",
        office="PRESBITERO",
        user_id=user["id"],
    )
    print(f"  ✓ Created member profile")
    
    return user, member


async def create_members(tenant_id: str, count: int = 55):
    """Create random members."""
    print(f"\n👥 Creating {count} members...")
    
    members = []
    users = []
    
    for i in range(count):
        # Generate random name
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        email = generate_email(full_name)
        
        # Random data
        gender = random.choice(["M", "F"])
        marital_status = random.choice(["Solteiro", "Casado", "Viúvo", "Divorciado"])
        birth_year = random.randint(1940, 2010)
        birth_date = datetime(birth_year, random.randint(1, 12), random.randint(1, 28)).date()
        
        # Random functions (1-3 per member)
        num_functions = random.randint(0, 3)
        functions = random.sample(MEMBER_FUNCTIONS, num_functions) if num_functions > 0 else []
        
        # Create user (30% chance)
        user_id = None
        if random.random() < 0.3:
            try:
                user = await user_repository.create_user(
                    email=email,
                    password=COMMON_PASSWORD,
                    name=full_name,
                )
                user_id = user["id"]
                
                # Create membership
                await membership_repository.create_membership(
                    user_id=user["id"],
                    tenant_id=tenant_id,
                    role="member",
                )
                users.append(user)
            except Exception as e:
                print(f"  ⚠️  Could not create user for {full_name}: {e}")
        
        # Create member
        # Map random function to office (without accents to match enum)
        office = "PRESBITERO" if "Presbítero" in functions else "DIACONO" if "Diácono" in functions else "MEMBRO"
        
        member = await member_repository.create_member(
            tenant_id=tenant_id,
            full_name=full_name,
            email=email,
            phone=generate_phone(),
            birth_date=birth_date,
            gender=gender,
            status="COMUNGANTE" if random.random() > 0.1 else "NAO_COMUNGANTE",
            office=office,
            user_id=user_id,
        )
        members.append(member)
        
        if (i + 1) % 10 == 0:
            print(f"  ✓ Created {i + 1}/{count} members...")
    
    print(f"  ✓ Created {len(members)} members ({len(users)} with user accounts)")
    return members


async def create_ebd_classes(tenant_id: str, members: list):
    """Create EBD classes with students and lessons."""
    print("\n📚 Creating EBD classes...")
    
    classes = []
    for class_data in EBD_CLASSES:
        # Create class
        ebd_class = await ebd_class_repository.create_class(
            tenant_id=tenant_id,
            name=class_data["name"],
            description=f"Classe de EBD para {class_data['age_group']}",
            teacher=random.choice(members)["full_name"],
            schedule="Domingo, 9:00",
        )
        classes.append(ebd_class)
        
        # Add 5-15 students per class
        num_students = random.randint(5, 15)
        selected_members = random.sample(members, min(num_students, len(members)))
        
        for member in selected_members:
            await ebd_student_repository.create_student(
                class_id=ebd_class["id"],
                name=member["full_name"],
                birth_date=member.get("birth_date"),
                parent_name=random.choice(members)["full_name"] if random.random() > 0.5 else None,
                phone=member.get("phone"),
            )
        
        # Add 4 lessons (last month)
        for week in range(1, 5):
            lesson_date = datetime.now().date() - timedelta(days=(5-week) * 7)
            await ebd_lesson_repository.create_lesson(
                class_id=ebd_class["id"],
                date=lesson_date,
                topic=f"Lição {week} - {random.choice(['Fé', 'Amor', 'Esperança', 'Graça', 'Salvação'])}",
                teacher=ebd_class["teacher"],
                attendance=random.randint(num_students - 3, num_students),
            )
    
    print(f"  ✓ Created {len(classes)} EBD classes with students and lessons")
    return classes


async def create_financial_data(tenant_id: str):
    """Create financial accounts and transactions."""
    print("\n💰 Creating financial data...")
    
    # Create accounts
    accounts = []
    account_types = [
        {"name": "Caixa Geral", "type": "checking", "balance": 15000.00},
        {"name": "Dízimos e Ofertas", "type": "savings", "balance": 8500.00},
        {"name": "Missões", "type": "savings", "balance": 3200.00},
        {"name": "Construção", "type": "savings", "balance": 25000.00},
    ]
    
    for acc_data in account_types:
        account = await financial_account_repository.create_account(
            tenant_id=tenant_id,
            name=acc_data["name"],
            account_type=acc_data["type"],
            balance=acc_data["balance"],
        )
        accounts.append(account)
    
    print(f"  ✓ Created {len(accounts)} financial accounts")
    
    # Create categories
    categories = []
    category_types = [
        # Income categories
        {"name": "Dízimos", "type": "INCOME"},
        {"name": "Ofertas", "type": "INCOME"},
        {"name": "Doações", "type": "INCOME"},
        {"name": "Eventos", "type": "INCOME"},
        {"name": "Outras Receitas", "type": "INCOME"},
        # Expense categories
        {"name": "Aluguel", "type": "EXPENSE"},
        {"name": "Energia Elétrica", "type": "EXPENSE"},
        {"name": "Água", "type": "EXPENSE"},
        {"name": "Telefone/Internet", "type": "EXPENSE"},
        {"name": "Material de Limpeza", "type": "EXPENSE"},
        {"name": "Material de Escritório", "type": "EXPENSE"},
        {"name": "Manutenção", "type": "EXPENSE"},
        {"name": "Missões", "type": "EXPENSE"},
        {"name": "Assistência Social", "type": "EXPENSE"},
        {"name": "Salários", "type": "EXPENSE"},
        {"name": "Outras Despesas", "type": "EXPENSE"},
    ]
    
    for cat_data in category_types:
        category = await transaction_category_repository.create_category(
            tenant_id=tenant_id,
            name=cat_data["name"],
            type=cat_data["type"],
        )
        categories.append(category)
    
    print(f"  ✓ Created {len(categories)} transaction categories")
    
    # Create transactions (last 3 months)
    transaction_types = [
        {"type": "income", "category": "Dízimos", "amount_range": (100, 500)},
        {"type": "income", "category": "Ofertas", "amount_range": (50, 300)},
        {"type": "expense", "category": "Aluguel", "amount_range": (2000, 2000)},
        {"type": "expense", "category": "Energia", "amount_range": (300, 500)},
        {"type": "expense", "category": "Água", "amount_range": (100, 200)},
        {"type": "expense", "category": "Material de Limpeza", "amount_range": (50, 150)},
        {"type": "expense", "category": "Missões", "amount_range": (500, 1500)},
    ]
    
    transactions_created = 0
    for days_ago in range(90):
        # Random number of transactions per day (0-3)
        num_transactions = random.randint(0, 3)
        for _ in range(num_transactions):
            trans_type = random.choice(transaction_types)
            amount = random.uniform(*trans_type["amount_range"])
            
            await transaction_repository.create_transaction(
                tenant_id=tenant_id,
                account_id=random.choice(accounts)["id"],
                amount=round(amount, 2),
                transaction_type=trans_type["type"],
                transaction_date=(datetime.now().date() - timedelta(days=days_ago)),
                category=trans_type["category"],
                description=f"{trans_type['category']} - {datetime.now().date() - timedelta(days=days_ago)}",
            )
            transactions_created += 1
    
    print(f"  ✓ Created {transactions_created} financial transactions")


async def create_governance_data(tenant_id: str, members: list):
    """Create councils and meetings."""
    print("\n⚖️  Creating governance data...")
    
    # Create councils
    council_types = [
        {"name": "Conselho", "type": "SESSION", "description": "Conselho da Igreja"},
        {"name": "Junta Diaconal", "type": "DEACONS", "description": "Junta de Diáconos"},
    ]
    
    councils = []
    for council_data in council_types:
        # Select council members (5-10)
        num_members = random.randint(5, 10)
        council_members = random.sample(members, min(num_members, len(members)))
        
        council = await council_repository.create_council(
            tenant_id=tenant_id,
            name=council_data["name"],
            council_type=council_data["type"],
            description=council_data["description"],
            members=[m["full_name"] for m in council_members],
        )
        councils.append(council)
    
    print(f"  ✓ Created {len(councils)} councils")
    
    # Create meetings for each council (last 6 months)
    meetings_created = 0
    for council in councils:
        for month_ago in range(6):
            meeting_date = datetime.now() - timedelta(days=month_ago * 30 + random.randint(0, 15))
            
            # Select attendees (subset of council members)
            council_member_names = council.get("members", [])
            if council_member_names:
                num_attendees = random.randint(3, len(council_member_names))
                attendees = random.sample(council_member_names, min(num_attendees, len(council_member_names)))
            else:
                attendees = []
            
            await meeting_repository.create_meeting(
                council_id=council["id"],
                title=f"Reunião {council['name']} - {meeting_date.strftime('%B/%Y')}",
                scheduled_date=meeting_date.date(),
                location="Salão da Igreja",
                agenda=f"1. Abertura em oração\n2. Leitura da ata anterior\n3. Assuntos gerais\n4. Decisões\n5. Encerramento",
                attendees=attendees,
                decisions=f"Aprovado: {random.choice(['Orçamento para missões', 'Reforma do templo', 'Compra de equipamentos', 'Evento evangelístico', 'Curso de capacitação'])}",
            )
            meetings_created += 1
    
    print(f"  ✓ Created {meetings_created} meetings")


async def create_governance_meetings(tenant_id: str, members: list):
    """Create governance meetings."""
    print("\n⚖️  Creating governance meetings...")
    
    meeting_types = ["Conselho", "Assembleia", "Diretoria"]
    meetings_created = 0
    
    # Create meetings for the last 6 months
    for month_ago in range(6):
        for meeting_type in meeting_types:
            meeting_date = datetime.now() - timedelta(days=month_ago * 30)
            
            # Select attendees (5-15 members)
            num_attendees = random.randint(5, 15)
            attendees = [m["name"] for m in random.sample(members, min(num_attendees, len(members)))]
            
            await governance_meeting_repository.create_meeting(
                tenant_id=tenant_id,
                title=f"Reunião do {meeting_type} - {meeting_date.strftime('%B/%Y')}",
                meeting_type=meeting_type.lower(),
                date=meeting_date.date(),
                time=f"{random.randint(18, 20)}:00",
                location="Salão da Igreja",
                agenda=f"1. Abertura\n2. Leitura da ata anterior\n3. Assuntos gerais\n4. Encerramento",
                attendees=attendees,
                decisions=f"Aprovado orçamento de R$ {random.randint(1000, 5000)},00 para {random.choice(['missões', 'reformas', 'eventos', 'materiais'])}",
            )
            meetings_created += 1
    
    print(f"  ✓ Created {meetings_created} governance meetings")


async def create_missionaries(tenant_id: str, members: list):
    """Create missionaries and mission fields."""
    print("\n🌍 Creating missionaries...")
    
    missionaries_created = 0
    for field in MISSION_FIELDS:
        # Select 1-2 missionaries per field
        num_missionaries = random.randint(1, 2)
        selected_members = random.sample(members, min(num_missionaries, len(members)))
        
        for member in selected_members:
            await missionary_repository.create_missionary(
                tenant_id=tenant_id,
                name=member["name"],
                email=member.get("email"),
                phone=member.get("phone"),
                field=field["name"],
                country=field["country"],
                city=field["city"],
                start_date=(datetime.now().date() - timedelta(days=random.randint(365, 1825))),
                support_amount=random.randint(500, 2000),
                description=f"Missionário(a) atuando em {field['city']}, {field['country']}",
            )
            missionaries_created += 1
    
    print(f"  ✓ Created {missionaries_created} missionaries")


async def main():
    """Main seed function."""
    print("\n" + "="*60)
    print("🌱 SEED SCRIPT - Igreja Presbiteriana Filadélfia")
    print("="*60)
    
    try:
        # Clean existing data
        await clean_existing_data()
        
        # Create church
        tenant = await create_church()
        tenant_id = tenant["id"]
        
        # Create admin user
        admin_user, admin_member = await create_admin_user(tenant_id)
        
        # Create members
        members = await create_members(tenant_id, count=55)
        all_members = [admin_member] + members
        
        # Create EBD classes
        await create_ebd_classes(tenant_id, all_members)
        
        # Create financial data
        await create_financial_data(tenant_id)
        
        # Create governance data (councils and meetings)
        await create_governance_data(tenant_id, all_members)
        
        # TODO: Uncomment when missionaries module is fully implemented
        # Create missionaries
        # await create_missionaries(tenant_id, all_members)
        
        print("\n" + "="*60)
        print("✅ SEED COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"  • Church: {tenant['name']}")
        print(f"  • Admin: {admin_user['email']} (password: {COMMON_PASSWORD})")
        print(f"  • Members: {len(all_members)} total")
        print(f"  • EBD Classes: {len(EBD_CLASSES)}")
        print(f"  • All user passwords: {COMMON_PASSWORD}")
        print("\n🚀 You can now login and explore the system!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during seed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(main())
