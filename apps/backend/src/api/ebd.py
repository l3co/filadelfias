from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.infra.database import get_db
from src.api.auth import get_current_user
from src.infra.models import User
from src.services.ebd_service import EBDService
from src.modules.ebd.schemas import (
    EBDClassCreate, EBDClassResponse,
    EBDStudentCreate, EBDStudentResponse,
    EBDLessonCreate, EBDLessonResponse
)

router = APIRouter(prefix="/ebd", tags=["Education (EBD)"])

# Classes
@router.post("/classes", response_model=EBDClassResponse)
async def create_class(
    data: EBDClassCreate,
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    return await service.create_class(tenant_id, data)

@router.get("/classes", response_model=List[EBDClassResponse])
async def list_classes(
    tenant_id: UUID = Query(..., description="ID of the tenant"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    return await service.list_classes(tenant_id)

# Students
@router.post("/classes/{class_id}/students", response_model=EBDStudentResponse)
async def enroll_student(
    class_id: UUID,
    data: EBDStudentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    return await service.enroll_student(class_id, data)

@router.get("/classes/{class_id}/students", response_model=List[EBDStudentResponse])
async def list_students(
    class_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    return await service.list_students(class_id)

# Lessons
@router.post("/classes/{class_id}/lessons", response_model=EBDLessonResponse)
async def create_lesson(
    class_id: UUID,
    data: EBDLessonCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    # data already has class_id but we ensure it matches path if we want
    # For now just passing DTO is fine, but maybe redundant. 
    # Service expects class_id as argument anyway.
    return await service.create_lesson(class_id, data)

@router.get("/classes/{class_id}/lessons", response_model=List[EBDLessonResponse])
async def list_lessons(
    class_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = EBDService(db)
    return await service.list_lessons(class_id)
