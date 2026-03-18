"""
Service for deleting tenant and user data (LGPD compliance).
Core entities already use PostgreSQL; legacy modules still rely on Firestore.
"""

from sqlalchemy import delete, select

from src.infra.db.models import MembershipModel, TenantModel, UserModel
from src.infra.db.session import async_session_factory
from src.infra.repositories.member_repository import member_repository


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
    deleted = {
        "members": 0,
        "user_memberships": 0,
        "tenant": 0,
    }

    async with async_session_factory() as session:
        members_result = await session.execute(
            select(MembershipModel.id).where(MembershipModel.tenant_id == member_repository._maybe_uuid(tenant_id))
        )
        members = await member_repository.get_all(tenant_id, limit=10000)
        deleted["members"] = len(members)
        deleted["user_memberships"] = len(members_result.all())

        membership_result = await session.execute(
            delete(MembershipModel).where(MembershipModel.tenant_id == member_repository._maybe_uuid(tenant_id))
        )
        deleted["user_memberships"] = membership_result.rowcount or 0

        tenant_result = await session.execute(
            delete(TenantModel).where(TenantModel.id == member_repository._maybe_uuid(tenant_id))
        )
        deleted["tenant"] = tenant_result.rowcount or 0
        await session.commit()

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
    deleted = {
        "user_memberships": 0,
        "members_unlinked": 0,
        "user": 0,
    }

    deleted["members_unlinked"] = await member_repository.unlink_user_across_tenants(user_id)

    async with async_session_factory() as session:
        membership_result = await session.execute(
            delete(MembershipModel).where(MembershipModel.user_id == member_repository._maybe_uuid(user_id))
        )
        deleted["user_memberships"] = membership_result.rowcount or 0

        user_result = await session.execute(delete(UserModel).where(UserModel.id == member_repository._maybe_uuid(user_id)))
        deleted["user"] = user_result.rowcount or 0
        await session.commit()

    return deleted
