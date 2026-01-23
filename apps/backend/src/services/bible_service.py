import json
import os
from typing import Any, Dict, List, Optional

import httpx
from pydantic import BaseModel

from src.services.logging_service import log_error, log_info, log_warning

# Mapping of abbreviations to full Portuguese names
BOOK_NAMES = {
    "gn": "Gênesis",
    "ex": "Êxodo",
    "lv": "Levítico",
    "nm": "Números",
    "dt": "Deuteronômio",
    "js": "Josué",
    "jz": "Juízes",
    "rt": "Rute",
    "1sm": "1 Samuel",
    "2sm": "2 Samuel",
    "1rs": "1 Reis",
    "2rs": "2 Reis",
    "1cr": "1 Crônicas",
    "2cr": "2 Crônicas",
    "ed": "Esdras",
    "ne": "Neemias",
    "et": "Ester",
    "job": "Jó",
    "sl": "Salmos",
    "pv": "Provérbios",
    "ec": "Eclesiastes",
    "ct": "Cânticos",
    "is": "Isaías",
    "jr": "Jeremias",
    "lm": "Lamentações",
    "ez": "Ezequiel",
    "dn": "Daniel",
    "os": "Oséias",
    "jl": "Joel",
    "am": "Amós",
    "ob": "Obadias",
    "jn": "Jonas",
    "mq": "Miquéias",
    "na": "Naum",
    "hc": "Habacuque",
    "sf": "Sofonias",
    "ag": "Ageu",
    "zc": "Zacarias",
    "ml": "Malaquias",
    "mt": "Mateus",
    "mc": "Marcos",
    "lc": "Lucas",
    "jo": "João",
    "at": "Atos",
    "rm": "Romanos",
    "1co": "1 Coríntios",
    "2co": "2 Coríntios",
    "gl": "Gálatas",
    "ef": "Efésios",
    "fp": "Filipenses",
    "cl": "Colossenses",
    "1ts": "1 Tessalonicenses",
    "2ts": "2 Tessalonicenses",
    "1tm": "1 Timóteo",
    "2tm": "2 Timóteo",
    "tt": "Tito",
    "fm": "Filemom",
    "hb": "Hebreus",
    "tg": "Tiago",
    "1pe": "1 Pedro",
    "2pe": "2 Pedro",
    "1jo": "1 João",
    "2jo": "2 João",
    "3jo": "3 João",
    "jd": "Judas",
    "ap": "Apocalipse",
}


class BibleBookSummary(BaseModel):
    abbrev: str
    name: str
    chapters_count: int
    testament: str


class BibleChapterContent(BaseModel):
    book_abbrev: str
    book_name: str
    chapter: int
    verses: List[str]
    previous_chapter: Optional[Dict[str, Any]] = None
    next_chapter: Optional[Dict[str, Any]] = None


class BibleVersion(BaseModel):
    id: str
    name: str
    description: str
    is_remote: bool = False


AVAILABLE_VERSIONS = [
    BibleVersion(id="nvi", name="Nova Versão Internacional", description="Linguagem moderna e acessível"),
    BibleVersion(id="acf", name="Almeida Corrigida Fiel", description="Tradução clássica e fiel aos originais"),
    BibleVersion(id="aa", name="Almeida Atualizada", description="Equilíbrio entre tradição e clareza"),
    BibleVersion(
        id="ara", name="Almeida Revista e Atualizada", description="Texto Tradicional e Atual (On-line)", is_remote=True
    ),
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
            log_info("Bible version loaded", version=version, books_count=len(cls._versions_cache[version]))
        except FileNotFoundError:
            log_error(f"Bible version data not found at {path}", version=version)
            cls._versions_cache[version] = []

    @classmethod
    def get_available_versions(cls) -> List[BibleVersion]:
        return AVAILABLE_VERSIONS

    @classmethod
    async def get_books(cls, version: str = DEFAULT_VERSION) -> List[BibleBookSummary]:
        data = cls._get_local_data(cls.DEFAULT_VERSION)

        books = []
        for i, book in enumerate(data):
            abbrev = book["abbrev"]
            testament = "old" if i < 39 else "new"
            books.append(
                BibleBookSummary(
                    abbrev=abbrev,
                    name=BOOK_NAMES.get(abbrev, abbrev.title()),
                    chapters_count=len(book["chapters"]),
                    testament=testament,
                )
            )
        return books

    @classmethod
    async def _fetch_remote_chapter(cls, version: str, abbrev: str, chapter: int) -> List[str]:
        try:
            url = f"https://www.abibliadigital.com.br/api/verses/{version}/{abbrev}/{chapter}"
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return [v["text"] for v in data.get("verses", [])]
        except Exception as e:
            log_error("Error fetching remote chapter", error=str(e), version=version, abbrev=abbrev, chapter=chapter)
            return []

    @classmethod
    async def get_chapter(
        cls, abbrev: str, chapter: int, version: str = DEFAULT_VERSION
    ) -> Optional[BibleChapterContent]:
        version_config = next((v for v in AVAILABLE_VERSIONS if v.id == version), None)
        if not version_config:
            version = cls.DEFAULT_VERSION
            version_config = next(v for v in AVAILABLE_VERSIONS if v.id == version)

        verses = []

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

        if version_config.is_remote:
            verses = await cls._fetch_remote_chapter(version, abbrev, chapter)
            if not verses:
                log_warning(f"Remote fetch failed for {version}, falling back to {cls.DEFAULT_VERSION}")
                fallback_chapters = cls._get_local_data(cls.DEFAULT_VERSION)[book_idx]["chapters"]
                verses = fallback_chapters[chapter - 1]
        else:
            version_data = cls._get_local_data(version)
            if version_data and len(version_data) > book_idx:
                verses = version_data[book_idx]["chapters"][chapter - 1]
            else:
                verses = []

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
            next_chapter=next_chap,
        )
