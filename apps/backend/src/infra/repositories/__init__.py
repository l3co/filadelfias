"""
Firestore repositories for each entity.
"""

from src.infra.repositories.user_repository import UserRepository, user_repository
from src.infra.repositories.tenant_repository import TenantRepository, tenant_repository
from src.infra.repositories.member_repository import MemberRepository, member_repository
from src.infra.repositories.membership_repository import MembershipRepository, membership_repository
from src.infra.repositories.ebd_repository import (
    EBDClassRepository,
    EBDStudentRepository,
    EBDLessonRepository,
    ebd_class_repository,
    ebd_student_repository,
    ebd_lesson_repository,
)
from src.infra.repositories.financial_repository import (
    FinancialAccountRepository,
    TransactionCategoryRepository,
    TransactionRepository,
    financial_account_repository,
    transaction_category_repository,
    transaction_repository,
)
from src.infra.repositories.governance_repository import (
    CouncilRepository,
    MeetingRepository,
    council_repository,
    meeting_repository,
)

__all__ = [
    "UserRepository",
    "TenantRepository", 
    "MemberRepository",
    "MembershipRepository",
    "EBDClassRepository",
    "EBDStudentRepository",
    "EBDLessonRepository",
    "FinancialAccountRepository",
    "TransactionCategoryRepository",
    "TransactionRepository",
    "CouncilRepository",
    "MeetingRepository",
    "user_repository",
    "tenant_repository",
    "member_repository",
    "membership_repository",
    "ebd_class_repository",
    "ebd_student_repository",
    "ebd_lesson_repository",
    "financial_account_repository",
    "transaction_category_repository",
    "transaction_repository",
    "council_repository",
    "meeting_repository",
]
