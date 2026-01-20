"""
Service for deleting tenant and user data (LGPD compliance).
"""

from src.infra.firebase import get_db


async def delete_tenant_data(tenant_id: str) -> dict:
    """
    Delete all data associated with a tenant (church).
    This includes:
    - Members
    - EBD classes, students, lessons
    - Financial accounts, categories, transactions
    - Councils, meetings
    - User memberships linked to this tenant
    - The tenant document itself

    Returns summary of deleted items.
    """
    db = get_db()
    deleted = {
        "members": 0,
        "ebd_classes": 0,
        "financial_accounts": 0,
        "transaction_categories": 0,
        "transactions": 0,
        "councils": 0,
        "user_memberships": 0,
        "tenant": 0,
    }

    tenant_ref = db.collection("tenants").document(tenant_id)

    # Delete subcollections under tenant
    subcollections = [
        "members",
        "ebd_classes",
        "financial_accounts",
        "transaction_categories",
        "transactions",
        "councils",
    ]

    for subcoll_name in subcollections:
        subcoll_ref = tenant_ref.collection(subcoll_name)
        docs = subcoll_ref.stream()
        for doc in docs:
            doc.reference.delete()
            deleted[subcoll_name] = deleted.get(subcoll_name, 0) + 1

    # Delete user memberships linked to this tenant
    memberships = db.collection("user_memberships").where("tenant_id", "==", tenant_id).stream()
    for membership in memberships:
        membership.reference.delete()
        deleted["user_memberships"] += 1

    # Delete EBD students and lessons (global collections with class_id reference)
    # First get all class IDs from this tenant
    ebd_classes = tenant_ref.collection("ebd_classes").stream()
    class_ids = [doc.id for doc in ebd_classes]

    for class_id in class_ids:
        # Delete students
        students = db.collection("ebd_students").where("class_id", "==", class_id).stream()
        for student in students:
            student.reference.delete()

        # Delete lessons
        lessons = db.collection("ebd_lessons").where("class_id", "==", class_id).stream()
        for lesson in lessons:
            lesson.reference.delete()

    # Delete meetings (global collection with council_id reference)
    councils = tenant_ref.collection("councils").stream()
    council_ids = [doc.id for doc in councils]

    for council_id in council_ids:
        meetings = db.collection("meetings").where("council_id", "==", council_id).stream()
        for meeting in meetings:
            meeting.reference.delete()

    # Finally delete the tenant document
    if tenant_ref.get().exists:
        tenant_ref.delete()
        deleted["tenant"] = 1

    return deleted


async def delete_user_data(user_id: str) -> dict:
    """
    Delete all data associated with a user.
    This includes:
    - User memberships
    - Unlink from members (set user_id to null)
    - The user document itself

    Returns summary of deleted items.
    """
    db = get_db()
    deleted = {
        "user_memberships": 0,
        "members_unlinked": 0,
        "user": 0,
    }

    # Delete user memberships
    memberships = db.collection("user_memberships").where("user_id", "==", user_id).stream()
    for membership in memberships:
        membership.reference.delete()
        deleted["user_memberships"] += 1

    # Unlink user from members (across all tenants)
    # We need to search all tenant subcollections
    tenants = db.collection("tenants").stream()
    for tenant in tenants:
        members = tenant.reference.collection("members").where("user_id", "==", user_id).stream()
        for member in members:
            member.reference.update({"user_id": None})
            deleted["members_unlinked"] += 1

    # Delete the user document
    user_ref = db.collection("users").document(user_id)
    if user_ref.get().exists:
        user_ref.delete()
        deleted["user"] = 1

    return deleted
