"""
EBD (Education) repositories for Firestore.
"""

from typing import Optional
from datetime import date

from src.infra.firestore_repository import TenantScopedRepository, FirestoreRepository


class EBDClassRepository(TenantScopedRepository):
    """Repository for EBD classes subcollection under tenants."""

    def __init__(self):
        super().__init__("ebd_classes")

    async def create_class(
        self,
        tenant_id: str,
        name: str,
        description: Optional[str] = None,
        teacher_id: Optional[str] = None,
        age_group: Optional[str] = None,
        is_active: bool = True,
    ) -> dict:
        """Create a new EBD class."""
        data = {
            "name": name,
            "description": description,
            "teacher_id": teacher_id,
            "age_group": age_group,
            "is_active": is_active,
        }
        return await self.create(tenant_id, data)


class EBDStudentRepository(FirestoreRepository):
    """Repository for EBD students (linked to classes)."""

    def __init__(self):
        super().__init__("ebd_students")

    async def enroll_student(
        self,
        class_id: str,
        member_id: str,
        enrollment_date: Optional[date] = None,
    ) -> dict:
        """Enroll a student in a class."""
        data = {
            "class_id": class_id,
            "member_id": member_id,
            "enrollment_date": enrollment_date.isoformat() if enrollment_date else None,
            "is_active": True,
        }
        return await self.create(data)

    async def get_by_class(self, class_id: str) -> list[dict]:
        """Get all students in a class."""
        return await self.query("class_id", "==", class_id)


class EBDLessonRepository(FirestoreRepository):
    """Repository for EBD lessons."""

    def __init__(self):
        super().__init__("ebd_lessons")

    async def create_lesson(
        self,
        class_id: str,
        title: str,
        lesson_date: date,
        description: Optional[str] = None,
        bible_text: Optional[str] = None,
    ) -> dict:
        """Create a new lesson."""
        data = {
            "class_id": class_id,
            "title": title,
            "lesson_date": lesson_date.isoformat(),
            "description": description,
            "bible_text": bible_text,
        }
        return await self.create(data)

    async def get_by_class(self, class_id: str) -> list[dict]:
        """Get all lessons for a class."""
        return await self.query("class_id", "==", class_id)


# Singleton instances
ebd_class_repository = EBDClassRepository()
ebd_student_repository = EBDStudentRepository()
ebd_lesson_repository = EBDLessonRepository()
