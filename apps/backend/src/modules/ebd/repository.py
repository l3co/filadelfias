from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.ebd.models import EBDClass, EBDLesson, EBDStudent


class EBDRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_class(self, ebd_class: EBDClass) -> EBDClass:
        self.session.add(ebd_class)
        await self.session.commit()
        await self.session.refresh(ebd_class)
        return ebd_class

    async def get_classes(self, tenant_id: UUID) -> Sequence[EBDClass]:
        result = await self.session.execute(select(EBDClass).where(EBDClass.tenant_id == tenant_id))
        return result.scalars().all()

    async def enroll_student(self, enrollment: EBDStudent) -> EBDStudent:
        self.session.add(enrollment)
        await self.session.commit()
        await self.session.refresh(enrollment)
        return enrollment

    async def get_students(self, class_id: UUID) -> Sequence[EBDStudent]:
        result = await self.session.execute(select(EBDStudent).where(EBDStudent.ebd_class_id == class_id))
        return result.scalars().all()

    async def create_lesson(self, lesson: EBDLesson) -> EBDLesson:
        self.session.add(lesson)
        await self.session.commit()
        await self.session.refresh(lesson)
        return lesson

    async def get_lessons(self, class_id: UUID) -> Sequence[EBDLesson]:
        result = await self.session.execute(
            select(EBDLesson).where(EBDLesson.ebd_class_id == class_id).order_by(EBDLesson.date.desc())
        )
        return result.scalars().all()
