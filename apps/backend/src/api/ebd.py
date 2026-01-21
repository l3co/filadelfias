from typing import List

from fastapi import APIRouter, Depends, Query

from src.api.auth import get_current_user
from src.modules.ebd.repository import (
    ebd_class_repository,
    ebd_lesson_repository,
    ebd_student_repository,
)
from src.modules.ebd.schemas import (
    EBDClassCreate,
    EBDClassResponse,
    EBDLessonCreate,
    EBDLessonResponse,
    EBDStudentCreate,
    EBDStudentResponse,
)

router = APIRouter(prefix="/ebd", tags=["Education (EBD)"])


# Classes
@router.post("/classes", response_model=EBDClassResponse)
async def create_class(
    data: EBDClassCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await ebd_class_repository.create_class(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        min_age=data.min_age,
        max_age=data.max_age,
        location=data.location,
    )


@router.get("/classes", response_model=List[EBDClassResponse])
async def list_classes(
    tenant_id: str = Query(..., description="ID of the tenant"),
    current_user: dict = Depends(get_current_user),
):
    return await ebd_class_repository.get_all(tenant_id)


# Students
@router.post("/classes/{class_id}/students", response_model=EBDStudentResponse)
async def enroll_student(
    class_id: str,
    data: EBDStudentCreate,
    current_user: dict = Depends(get_current_user),
):
    # Note: data.member_id from schema
    return await ebd_student_repository.enroll_student(
        class_id=class_id,
        member_id=str(data.member_id),
        # schema has no enrollment_date, defaulting in repo
    )


@router.get("/classes/{class_id}/students", response_model=List[EBDStudentResponse])
async def list_students(
    class_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await ebd_student_repository.get_by_class(class_id)


# Lessons
@router.post("/classes/{class_id}/lessons", response_model=EBDLessonResponse)
async def create_lesson(
    class_id: str,
    data: EBDLessonCreate,
    current_user: dict = Depends(get_current_user),
):
    return await ebd_lesson_repository.create_lesson(
        class_id=class_id,
        title=data.topic,  # Schema uses 'topic'
        lesson_date=data.date,  # Schema uses 'date'
        description=data.description,
        homework_url=data.homework_url,
    )


@router.get("/classes/{class_id}/lessons", response_model=List[EBDLessonResponse])
async def list_lessons(
    class_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await ebd_lesson_repository.get_by_class(class_id)
