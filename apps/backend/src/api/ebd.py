from typing import List

from fastapi import APIRouter, Depends, Query

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
from src.middleware.permissions import (
    require_view_ebd,
    require_manage_ebd,
    PermissionChecker,
)

router = APIRouter(prefix="/ebd", tags=["Education (EBD)"])

require_create_ebd = PermissionChecker("ebd", "create")


# Classes
@router.post("/classes", response_model=EBDClassResponse)
async def create_class(
    data: EBDClassCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_ebd),
):
    """
    Create a new EBD class.
    Requires: Pastor, Presbítero (ebd:manage permission).
    """
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
    auth_context: dict = Depends(require_view_ebd),
):
    """
    List all EBD classes.
    Requires: ebd:view permission (all members have this).
    """
    return await ebd_class_repository.get_all(tenant_id)


# Students
@router.post("/classes/{class_id}/students", response_model=EBDStudentResponse)
async def enroll_student(
    class_id: str,
    data: EBDStudentCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_ebd),
):
    """
    Enroll a student in a class.
    Requires: Pastor, Presbítero, Diácono (ebd:create permission).
    """
    return await ebd_student_repository.enroll_student(
        class_id=class_id,
        member_id=str(data.member_id),
    )


@router.get("/classes/{class_id}/students", response_model=List[EBDStudentResponse])
async def list_students(
    class_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_ebd),
):
    """
    List students in a class.
    Requires: ebd:view permission.
    """
    return await ebd_student_repository.get_by_class(class_id)


# Lessons
@router.post("/classes/{class_id}/lessons", response_model=EBDLessonResponse)
async def create_lesson(
    class_id: str,
    data: EBDLessonCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_create_ebd),
):
    """
    Create a new lesson.
    Requires: Pastor, Presbítero, Diácono (ebd:create permission).
    """
    return await ebd_lesson_repository.create_lesson(
        class_id=class_id,
        title=data.topic,
        lesson_date=data.date,
        description=data.description,
        homework_url=data.homework_url,
    )


@router.get("/classes/{class_id}/lessons", response_model=List[EBDLessonResponse])
async def list_lessons(
    class_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_ebd),
):
    """
    List lessons for a class.
    Requires: ebd:view permission.
    """
    return await ebd_lesson_repository.get_by_class(class_id)
