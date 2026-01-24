"""
API endpoint for system metadata (enums, labels).
Provides a single source of truth for frontend applications.
"""

from enum import Enum
from typing import Any

from fastapi import APIRouter

from src.domain.enums import (
    EcclesiasticalFunction,
    EcclesiasticalOffice,
    Gender,
    MaritalStatus,
    MemberStatus,
)
from src.domain.labels import (
    ADMISSION_TYPE_LABELS,
    FUNCTION_LABELS,
    GENDER_LABELS,
    MARITAL_STATUS_LABELS,
    OFFICE_LABELS,
    STATUS_LABELS,
)

router = APIRouter(tags=["Metadata"])


def enum_to_options(enum_class: type[Enum], labels: dict[Any, str]) -> list[dict[str, str]]:
    """Convert enum to list of options with value and label."""
    return [{"value": item.value, "label": labels.get(item, item.name)} for item in enum_class]


def dict_to_options(labels: dict[str, str]) -> list[dict[str, str]]:
    """Convert dict to list of options with value and label."""
    return [{"value": key, "label": label} for key, label in labels.items()]


@router.get("/metadata")
async def get_metadata():
    """
    Return all system metadata (enums, labels).

    Used by frontend to populate selects and display labels.
    This endpoint is public and cacheable.
    """
    return {
        "enums": {
            "ecclesiastical_offices": enum_to_options(EcclesiasticalOffice, OFFICE_LABELS),
            "ecclesiastical_functions": enum_to_options(EcclesiasticalFunction, FUNCTION_LABELS),
            "member_statuses": enum_to_options(MemberStatus, STATUS_LABELS),
            "genders": enum_to_options(Gender, GENDER_LABELS),
            "marital_statuses": enum_to_options(MaritalStatus, MARITAL_STATUS_LABELS),
            "admission_types": dict_to_options(ADMISSION_TYPE_LABELS),
        }
    }
