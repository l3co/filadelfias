from typing import List

from fastapi import APIRouter, Depends, Query

from src.middleware.permissions import (
    PermissionChecker,
    require_manage_ebd,
    require_view_ebd,
)
from src.modules.ebd.repository import (
    ebd_class_repository,
    ebd_comment_repository,
    ebd_lesson_repository,
    ebd_student_repository,
)
from src.modules.ebd.schemas import (
    EBDClassCreate,
    EBDClassResponse,
    EBDCommentCreate,
    EBDCommentResponse,
    EBDLessonCreate,
    EBDLessonResponse,
    EBDStudentCreate,
    EBDStudentResponse,
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


@router.get("/my-class")
async def get_my_class(
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_ebd),
):
    """
    Get the EBD class where the current user's member is enrolled.
    Returns class info with lessons.
    """
    member = auth_context.get("member")
    member_id = member.get("id") if member else None

    if not member_id:
        return None

    # Get the class
    ebd_class = await ebd_student_repository.get_class_by_member(tenant_id, member_id)
    if not ebd_class:
        return None

    # Get lessons for this class
    lessons = await ebd_lesson_repository.get_by_class(ebd_class["id"])
    ebd_class["lessons"] = lessons

    return ebd_class


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


@router.delete("/classes/{class_id}/students/{student_id}")
async def remove_student(
    class_id: str,
    student_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_ebd),
):
    """
    Remove a student from a class.
    Requires: ebd:manage permission.
    """
    await ebd_student_repository.remove_student(class_id, student_id)
    return {"message": "Student removed successfully"}


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


# Comments
@router.post("/lessons/{lesson_id}/comments", response_model=EBDCommentResponse)
async def create_comment(
    lesson_id: str,
    data: EBDCommentCreate,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_ebd),
):
    """
    Add a comment to a lesson.
    Requires: ebd:view permission (any enrolled member can comment).
    """
    return await ebd_comment_repository.create_comment(
        lesson_id=lesson_id,
        member_id=str(data.member_id),
        content=data.content,
        parent_id=str(data.parent_id) if data.parent_id else None,
    )


@router.get("/lessons/{lesson_id}/comments", response_model=List[EBDCommentResponse])
async def list_comments(
    lesson_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_view_ebd),
):
    """
    List comments for a lesson.
    Requires: ebd:view permission.
    """
    return await ebd_comment_repository.get_by_lesson(lesson_id)


@router.delete("/lessons/{lesson_id}/comments/{comment_id}")
async def delete_comment(
    lesson_id: str,
    comment_id: str,
    tenant_id: str = Query(..., description="ID of the tenant"),
    auth_context: dict = Depends(require_manage_ebd),
):
    """
    Delete a comment.
    Requires: ebd:manage permission.
    """
    await ebd_comment_repository.delete_comment(lesson_id, comment_id)
    return {"message": "Comment deleted successfully"}
