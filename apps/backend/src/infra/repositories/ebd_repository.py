"""
Compatibility exports for EBD repositories.
"""

from src.modules.ebd.repository import (
    EBDClassRepository,
    EBDCommentRepository,
    EBDLessonRepository,
    EBDStudentRepository,
    ebd_class_repository,
    ebd_comment_repository,
    ebd_lesson_repository,
    ebd_student_repository,
)

__all__ = [
    "EBDClassRepository",
    "EBDStudentRepository",
    "EBDLessonRepository",
    "EBDCommentRepository",
    "ebd_class_repository",
    "ebd_student_repository",
    "ebd_lesson_repository",
    "ebd_comment_repository",
]
