from uuid import UUID
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.repositories import EBDRepository
from src.infra.models import EBDClass, EBDStudent, EBDLesson
from src.domain.schemas import EBDClassCreate, EBDStudentCreate, EBDLessonCreate

class EBDService:
    def __init__(self, db: AsyncSession):
        self.repo = EBDRepository(db)

    async def create_class(self, tenant_id: UUID, data: EBDClassCreate) -> EBDClass:
        ebd_class = EBDClass(
            tenant_id=tenant_id,
            name=data.name,
            description=data.description,
            min_age=data.min_age,
            max_age=data.max_age,
            location=data.location
        )
        return await self.repo.create_class(ebd_class)

    async def list_classes(self, tenant_id: UUID) -> List[EBDClass]:
        return await self.repo.get_classes(tenant_id)
        
    async def enroll_student(self, ebd_class_id: UUID, data: EBDStudentCreate) -> EBDStudent:
        enrollment = EBDStudent(
            ebd_class_id=ebd_class_id,
            member_id=data.member_id,
            role=data.role
        )
        return await self.repo.enroll_student(enrollment)
        
    async def list_students(self, ebd_class_id: UUID) -> List[EBDStudent]:
        return await self.repo.get_students(ebd_class_id)
        
    async def create_lesson(self, ebd_class_id: UUID, data: EBDLessonCreate) -> EBDLesson:
        lesson = EBDLesson(
            ebd_class_id=ebd_class_id,
            date=data.date,
            topic=data.topic,
            description=data.description,
            homework_url=data.homework_url
        )
        return await self.repo.create_lesson(lesson)
        
    async def list_lessons(self, ebd_class_id: UUID) -> List[EBDLesson]:
        return await self.repo.get_lessons(ebd_class_id)
