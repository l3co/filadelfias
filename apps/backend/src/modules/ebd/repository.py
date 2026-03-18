import logging
from datetime import date, datetime, timezone
from typing import List

from sqlalchemy import select

from src.infra.db.models import EBDClassModel, EBDCommentModel, EBDLessonModel, EBDStudentModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository

logger = logging.getLogger(__name__)


class EBDClassRepository(SQLAlchemyRepository):
    fields = ["id", "tenant_id", "name", "description", "min_age", "max_age", "location", "created_at", "updated_at"]

    async def create_class(self, tenant_id: str, **kwargs) -> dict:
        async with self.session() as session:
            ebd_class = EBDClassModel(tenant_id=self._maybe_uuid(tenant_id), **kwargs)
            session.add(ebd_class)
            await session.commit()
            await session.refresh(ebd_class)
            return self._to_dict(ebd_class, self.fields)

    async def get_all(self, tenant_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(EBDClassModel)
                .where(EBDClassModel.tenant_id == self._maybe_uuid(tenant_id))
                .order_by(EBDClassModel.name.asc())
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]


class EBDStudentRepository(SQLAlchemyRepository):
    fields = ["id", "ebd_class_id", "member_id", "role", "enrolled_at", "created_at", "updated_at"]

    async def create_student(self, tenant_id: str, class_id: str, **kwargs) -> dict:
        async with self.session() as session:
            ebd_class = await self._first(
                session,
                select(EBDClassModel).where(
                    EBDClassModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDClassModel.id == self._maybe_uuid(class_id),
                ),
            )
            if not ebd_class:
                raise ValueError("Class not found")

            student = EBDStudentModel(
                tenant_id=ebd_class.tenant_id,
                ebd_class_id=ebd_class.id,
                member_id=str(kwargs["member_id"]),
                role=kwargs.get("role", "STUDENT"),
                enrolled_at=kwargs.get("enrolled_at", datetime.now(timezone.utc)),
            )
            session.add(student)
            await session.commit()
            await session.refresh(student)
            return self._to_dict(student, self.fields)

    async def get_by_class(self, tenant_id: str, class_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(EBDStudentModel).where(
                    EBDStudentModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDStudentModel.ebd_class_id == self._maybe_uuid(class_id),
                )
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]

    async def enroll_student(self, tenant_id: str, class_id: str, member_id: str, role: str = "STUDENT") -> dict:
        return await self.create_student(
            tenant_id,
            class_id,
            member_id=member_id,
            role=role,
            enrolled_at=datetime.now(timezone.utc),
        )

    async def remove_student(self, tenant_id: str, class_id: str, student_id: str) -> bool:
        async with self.session() as session:
            student = await self._first(
                session,
                select(EBDStudentModel).where(
                    EBDStudentModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDStudentModel.ebd_class_id == self._maybe_uuid(class_id),
                    EBDStudentModel.id == self._maybe_uuid(student_id),
                ),
            )
            if not student:
                return False
            await session.delete(student)
            await session.commit()
            return True

    async def get_class_by_member(self, tenant_id: str, member_id: str) -> dict | None:
        async with self.session() as session:
            enrollment = await self._first(
                session,
                select(EBDStudentModel).where(
                    EBDStudentModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDStudentModel.member_id == str(member_id),
                ),
            )
            if not enrollment:
                return None

            ebd_class = await self._first(
                session,
                select(EBDClassModel).where(
                    EBDClassModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDClassModel.id == enrollment.ebd_class_id,
                ),
            )
            if not ebd_class:
                return None

            class_data = EBDClassRepository._to_dict(ebd_class, EBDClassRepository.fields)
            class_data["enrollment"] = self._to_dict(enrollment, self.fields)
            return class_data


class EBDLessonRepository(SQLAlchemyRepository):
    fields = [
        "id",
        "ebd_class_id",
        "date",
        "topic",
        "description",
        "homework_url",
        "bible_reference",
        "created_at",
        "updated_at",
    ]

    async def create_lesson(self, tenant_id: str, class_id: str, **kwargs) -> dict:
        data = kwargs.copy()
        if "date" in data and isinstance(data["date"], date) and not isinstance(data["date"], datetime):
            data["date"] = data["date"]
        if "lesson_date" in data:
            ld = data.pop("lesson_date")
            data["date"] = ld if isinstance(ld, date) else datetime.fromisoformat(str(ld)).date()
        if "title" in data:
            data["topic"] = data.pop("title")

        async with self.session() as session:
            ebd_class = await self._first(
                session,
                select(EBDClassModel).where(
                    EBDClassModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDClassModel.id == self._maybe_uuid(class_id),
                ),
            )
            if not ebd_class:
                raise ValueError("EBD Class not found")

            lesson = EBDLessonModel(
                tenant_id=ebd_class.tenant_id,
                ebd_class_id=ebd_class.id,
                date=data["date"],
                topic=data["topic"],
                description=data.get("description"),
                homework_url=data.get("homework_url"),
                bible_reference=data.get("bible_reference"),
            )
            session.add(lesson)
            await session.commit()
            await session.refresh(lesson)
            return self._to_dict(lesson, self.fields)

    async def get_by_class(self, tenant_id: str, class_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(EBDLessonModel).where(
                    EBDLessonModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDLessonModel.ebd_class_id == self._maybe_uuid(class_id),
                )
            )
            return [self._to_dict(item, self.fields) for item in result.scalars().all()]


class EBDCommentRepository(SQLAlchemyRepository):
    fields = ["id", "lesson_id", "member_id", "content", "parent_id", "created_at", "updated_at"]

    async def create_comment(
        self, tenant_id: str, class_id: str, lesson_id: str, member_id: str, content: str, parent_id: str = None
    ) -> dict:
        async with self.session() as session:
            lesson = await self._first(
                session,
                select(EBDLessonModel).where(
                    EBDLessonModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDLessonModel.ebd_class_id == self._maybe_uuid(class_id),
                    EBDLessonModel.id == self._maybe_uuid(lesson_id),
                ),
            )
            if not lesson:
                raise ValueError("Lesson not found")

            comment = EBDCommentModel(
                tenant_id=self._maybe_uuid(tenant_id),
                ebd_class_id=self._maybe_uuid(class_id),
                lesson_id=lesson.id,
                member_id=str(member_id),
                content=content,
                parent_id=self._maybe_uuid(parent_id) if parent_id else None,
            )
            session.add(comment)
            await session.commit()
            await session.refresh(comment)
            return self._to_dict(comment, self.fields)

    async def get_by_lesson(self, tenant_id: str, class_id: str, lesson_id: str) -> List[dict]:
        async with self.session() as session:
            result = await session.execute(
                select(EBDCommentModel).where(
                    EBDCommentModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDCommentModel.ebd_class_id == self._maybe_uuid(class_id),
                    EBDCommentModel.lesson_id == self._maybe_uuid(lesson_id),
                )
            )
            comments = [self._to_dict(item, self.fields) for item in result.scalars().all()]
            return sorted(comments, key=lambda x: x.get("created_at", ""))

    async def delete_comment(self, tenant_id: str, class_id: str, lesson_id: str, comment_id: str) -> bool:
        async with self.session() as session:
            comment = await self._first(
                session,
                select(EBDCommentModel).where(
                    EBDCommentModel.tenant_id == self._maybe_uuid(tenant_id),
                    EBDCommentModel.ebd_class_id == self._maybe_uuid(class_id),
                    EBDCommentModel.lesson_id == self._maybe_uuid(lesson_id),
                    EBDCommentModel.id == self._maybe_uuid(comment_id),
                ),
            )
            if not comment:
                return False
            await session.delete(comment)
            await session.commit()
            return True
        
        
        return False


ebd_class_repository = EBDClassRepository()
ebd_student_repository = EBDStudentRepository()
ebd_lesson_repository = EBDLessonRepository()
ebd_comment_repository = EBDCommentRepository()
