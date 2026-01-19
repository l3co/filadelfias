import json
import os
import httpx
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ... (BOOK_NAMES keep as is) ...

class BibleVersion(BaseModel):
    id: str
    name: str
    description: str
    is_remote: bool = False

AVAILABLE_VERSIONS = [
    BibleVersion(id="nvi", name="Nova Versão Internacional", description="Linguagem moderna e acessível"),
    BibleVersion(id="acf", name="Almeida Corrigida Fiel", description="Tradução clássica e fiel aos originais"),
    BibleVersion(id="aa", name="Almeida Atualizada", description="Equilíbrio entre tradição e clareza"),
    BibleVersion(id="ara", name="Almeida Revista e Atualizada", description="Texto Tradicional e Atual (On-line)", is_remote=True),
]

class BibleService:
    _versions_cache: Dict[str, List[Dict]] = {}
    DEFAULT_VERSION = "nvi"

    @classmethod
    def _get_local_data(cls, version: str) -> List[Dict]:
        """Lazy loads the requested local version if not already in cache."""
        if version not in cls._versions_cache:
            cls._load_version(version)
        return cls._versions_cache.get(version, [])

    @classmethod
    def _load_version(cls, version: str):
        filename = f"bible_{version}.json"
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", filename)
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                cls._versions_cache[version] = json.load(f)
            print(f"Bible version '{version}' loaded: {len(cls._versions_cache[version])} books")
        except FileNotFoundError:
            print(f"Bible version data not found at {path}")
            cls._versions_cache[version] = []

    @classmethod
    def get_available_versions(cls) -> List[BibleVersion]:
        return AVAILABLE_VERSIONS

    @classmethod
    async def get_books(cls, version: str = DEFAULT_VERSION) -> List[BibleBookSummary]:
        # Always use a local version (e.g. NVI) to generate book structure/list
        # This avoids fetching list from API every time. The Canon is the same.
        data = cls._get_local_data(cls.DEFAULT_VERSION)
        
        books = []
        for i, book in enumerate(data):
            abbrev = book["abbrev"]
            testament = "old" if i < 39 else "new"
            books.append(BibleBookSummary(
                abbrev=abbrev,
                name=BOOK_NAMES.get(abbrev, abbrev.title()),
                chapters_count=len(book["chapters"]),
                testament=testament
            ))
        return books

    @classmethod
    async def _fetch_remote_chapter(cls, version: str, abbrev: str, chapter: int) -> List[str]:
        try:
            # Map abbrev if necessary, assuming filadelfias abbrevs match abibliadigital
            url = f"https://www.abibliadigital.com.br/api/verses/{version}/{abbrev}/{chapter}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                # Extract text from verses
                return [v["text"] for v in data.get("verses", [])]
        except Exception as e:
            print(f"Error fetching remote chapter: {e}")
            return []

    @classmethod
    async def get_chapter(cls, abbrev: str, chapter: int, version: str = DEFAULT_VERSION) -> Optional[BibleChapterContent]:
        # Identify if version is remote
        version_config = next((v for v in AVAILABLE_VERSIONS if v.id == version), None)
        if not version_config:
            version = cls.DEFAULT_VERSION
            version_config = next(v for v in AVAILABLE_VERSIONS if v.id == version)

        verses = []
        
        # Determine navigation using LOCAL structure (canon is stable)
        local_data = cls._get_local_data(cls.DEFAULT_VERSION)
        book_idx = -1
        book_data = None
        for i, b in enumerate(local_data):
            if b["abbrev"] == abbrev:
                book_data = b
                book_idx = i
                break
        
        if not book_data:
            return None
            
        total_chapters = len(book_data["chapters"])
        if chapter < 1 or chapter > total_chapters:
            return None

        # Fetch Content
        if version_config.is_remote:
            verses = await cls._fetch_remote_chapter(version, abbrev, chapter)
            if not verses:
                # Fallback to local default if remote fails or returns empty
                print(f"Remote fetch failed for {version}, falling back to {cls.DEFAULT_VERSION}")
                fallback_chapters = cls._get_local_data(cls.DEFAULT_VERSION)[book_idx]["chapters"]
                verses = fallback_chapters[chapter - 1]
        else:
            # Local fetch
            version_data = cls._get_local_data(version)
            # Ensure book exists in this version data (loaded correctly)
            if version_data and len(version_data) > book_idx:
                 verses = version_data[book_idx]["chapters"][chapter - 1]
            else:
                 verses = []

        # Navigation logic (same as before)
        prev_chap = None
        if chapter > 1:
            prev_chap = {"book": abbrev, "chapter": chapter - 1}
        elif book_idx > 0:
            prev_book = local_data[book_idx - 1]
            prev_chap = {"book": prev_book["abbrev"], "chapter": len(prev_book["chapters"])}

        next_chap = None
        if chapter < total_chapters:
            next_chap = {"book": abbrev, "chapter": chapter + 1}
        elif book_idx < len(local_data) - 1:
            next_book = local_data[book_idx + 1]
            next_chap = {"book": next_book["abbrev"], "chapter": 1}

        return BibleChapterContent(
            book_abbrev=abbrev,
            book_name=BOOK_NAMES.get(abbrev, abbrev.title()),
            chapter=chapter,
            verses=verses,
            previous_chapter=prev_chap,
            next_chapter=next_chap
        )
