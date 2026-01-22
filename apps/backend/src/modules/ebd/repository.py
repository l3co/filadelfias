import logging
import uuid
from datetime import date, datetime
from typing import List

from src.infra.firebase import get_db

logger = logging.getLogger(__name__)


class EBDClassRepository:
    @property
    def db(self):
        return get_db()

    def _get_collection(self, tenant_id: str):
        return self.db.collection("tenants").document(str(tenant_id)).collection("ebd_classes")

    async def create_class(self, tenant_id: str, **kwargs) -> dict:
        collection = self._get_collection(tenant_id)
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()
        data.update({"id": doc_id, "tenant_id": str(tenant_id), "created_at": datetime.utcnow()})

        collection.document(doc_id).set(data)
        return data

    async def get_all(self, tenant_id: str) -> List[dict]:
        return [doc.to_dict() for doc in self._get_collection(str(tenant_id)).stream()]


class EBDStudentRepository:
    @property
    def db(self):
        return get_db()

    async def create_student(self, class_id: str, **kwargs) -> dict:
        # Find the class document to add student as subcollection
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            raise ValueError("Class not found")

        class_doc = classes[0]
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()
        data.update({"id": doc_id, "class_id": str(class_id), "created_at": datetime.utcnow()})

        class_doc.reference.collection("students").document(doc_id).set(data)
        return data

    async def get_by_class(self, class_id: str) -> List[dict]:
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            return []
        return [doc.to_dict() for doc in classes[0].reference.collection("students").stream()]

    async def enroll_student(self, class_id: str, member_id: str, role: str = "STUDENT") -> dict:
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            raise ValueError("Class not found")

        class_doc = classes[0]
        doc_id = str(uuid.uuid4())

        data = {
            "id": doc_id,
            "ebd_class_id": str(class_id),
            "member_id": str(member_id),
            "role": role,
            "enrolled_at": datetime.utcnow(),
        }

        class_doc.reference.collection("students").document(doc_id).set(data)
        return data

    async def remove_student(self, class_id: str, student_id: str) -> bool:
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            return False

        class_doc = classes[0]
        student_ref = class_doc.reference.collection("students").document(student_id)
        if student_ref.get().exists:
            student_ref.delete()
            return True
        return False


class EBDLessonRepository:
    @property
    def db(self):
        return get_db()

    async def create_lesson(self, class_id: str, **kwargs) -> dict:
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            raise ValueError("EBD Class not found")

        class_doc = classes[0]
        doc_id = str(uuid.uuid4())

        data = kwargs.copy()

        # Ensure date serialization
        if "date" in data and isinstance(data["date"], date) and not isinstance(data["date"], datetime):
            data["date"] = datetime.combine(data["date"], datetime.min.time())

        # Map specific fields if needed or handle generic
        if "lesson_date" in data:
            ld = data.pop("lesson_date")
            if isinstance(ld, date) and not isinstance(ld, datetime):
                data["date"] = datetime.combine(ld, datetime.min.time())
            else:
                data["date"] = ld

        if "title" in data:
            data["topic"] = data.pop("title")

        data.update({"id": doc_id, "ebd_class_id": str(class_id), "created_at": datetime.utcnow()})

        class_doc.reference.collection("lessons").document(doc_id).set(data)
        return data

    async def get_by_class(self, class_id: str) -> List[dict]:
        classes = self.db.collection_group("ebd_classes").where("id", "==", str(class_id)).limit(1).get()
        if not classes:
            return []
        return [doc.to_dict() for doc in classes[0].reference.collection("lessons").stream()]


class EBDCommentRepository:
    @property
    def db(self):
        return get_db()

    async def create_comment(self, lesson_id: str, member_id: str, content: str, parent_id: str = None) -> dict:
        # Find the lesson to add comment as subcollection
        lessons = self.db.collection_group("lessons").where("id", "==", str(lesson_id)).limit(1).get()
        if not lessons:
            raise ValueError("Lesson not found")

        lesson_doc = lessons[0]
        doc_id = str(uuid.uuid4())

        data = {
            "id": doc_id,
            "lesson_id": str(lesson_id),
            "member_id": str(member_id),
            "content": content,
            "parent_id": str(parent_id) if parent_id else None,
            "created_at": datetime.utcnow(),
        }

        lesson_doc.reference.collection("comments").document(doc_id).set(data)
        return data

    async def get_by_lesson(self, lesson_id: str) -> List[dict]:
        lessons = self.db.collection_group("lessons").where("id", "==", str(lesson_id)).limit(1).get()
        if not lessons:
            return []
        comments = [doc.to_dict() for doc in lessons[0].reference.collection("comments").stream()]
        return sorted(comments, key=lambda x: x.get("created_at", datetime.min), reverse=False)

    async def delete_comment(self, lesson_id: str, comment_id: str) -> bool:
        lessons = self.db.collection_group("lessons").where("id", "==", str(lesson_id)).limit(1).get()
        if not lessons:
            return False

        comment_ref = lessons[0].reference.collection("comments").document(comment_id)
        if comment_ref.get().exists:
            comment_ref.delete()
            return True
        return False


ebd_class_repository = EBDClassRepository()
ebd_student_repository = EBDStudentRepository()
ebd_lesson_repository = EBDLessonRepository()
ebd_comment_repository = EBDCommentRepository()
