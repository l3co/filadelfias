"""
Compatibility exports for governance repositories.
"""

from src.modules.governance.repository import (
    CouncilRepository,
    MeetingRepository,
    council_repository,
    meeting_repository,
)

__all__ = [
    "CouncilRepository",
    "MeetingRepository",
    "council_repository",
    "meeting_repository",
]
