import json
import os
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# Mapping of abbreviations to full Portuguese names
BOOK_NAMES = {
    "gn": "Gênesis", "ex": "Êxodo", "lv": "Levítico", "nm": "Números", "dt": "Deuteronômio",
    "js": "Josué", "jz": "Juízes", "rt": "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
    "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas", "ed": "Esdras",
    "ne": "Neemias", "et": "Ester", "job": "Jó", "sl": "Salmos", "pv": "Provérbios",
    "ec": "Eclesiastes", "ct": "Cânticos", "is": "Isaías", "jr": "Jeremias", "lm": "Lamentações",
    "ez": "Ezequiel", "dn": "Daniel", "os": "Oséias", "jl": "Joel", "am": "Amós",
    "ob": "Obadias", "jn": "Jonas", "mq": "Miquéias", "na": "Naum", "hc": "Habacuque",
    "sf": "Sofonias", "ag": "Ageu", "zc": "Zacarias", "ml": "Malaquias",
    "mt": "Mateus", "mc": "Marcos", "lc": "Lucas", "jo": "João", "at": "Atos",
    "rm": "Romanos", "1co": "1 Coríntios", "2co": "2 Coríntios", "gl": "Gálatas", "ef": "Efésios",
    "fp": "Filipenses", "cl": "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
    "1tm": "1 Timóteo", "2tm": "2 Timóteo", "tt": "Tito", "fm": "Filemom", "hb": "Hebreus",
    "tg": "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro", "1jo": "1 João", "2jo": "2 João",
    "3jo": "3 João", "jd": "Judas", "ap": "Apocalipse"
}

class BibleBookSummary(BaseModel):
    abbrev: str
    name: str
    chapters_count: int
    testament: str  # 'old' or 'new'

class BibleChapterContent(BaseModel):
    book_abbrev: str
    book_name: str
    chapter: int
    verses: List[str]
    previous_chapter: Optional[Dict[str, Any]] = None
    next_chapter: Optional[Dict[str, Any]] = None

class BibleService:
    _data: List[Dict] = []
    _loaded: bool = False

    @classmethod
    def load_data(cls):
        if cls._loaded:
            return
        
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "bible_aa.json")
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                cls._data = json.load(f)
            cls._loaded = True
            print(f"Bible data loaded: {len(cls._data)} books")
        except FileNotFoundError:
            print(f"Bible data not found at {path}")
            cls._data = []

    @classmethod
    def get_books(cls) -> List[BibleBookSummary]:
        if not cls._loaded:
            cls.load_data()
        
        books = []
        for i, book in enumerate(cls._data):
            abbrev = book["abbrev"]
            # Simple heuristic for testament: first 39 books are OT
            testament = "old" if i < 39 else "new"
            
            books.append(BibleBookSummary(
                abbrev=abbrev,
                name=BOOK_NAMES.get(abbrev, abbrev.title()),
                chapters_count=len(book["chapters"]),
                testament=testament
            ))
        return books

    @classmethod
    def get_chapter(cls, abbrev: str, chapter: int) -> Optional[BibleChapterContent]:
        if not cls._loaded:
            cls.load_data()
        
        # Find book
        book_idx = -1
        book_data = None
        for i, b in enumerate(cls._data):
            if b["abbrev"] == abbrev:
                book_data = b
                book_idx = i
                break
        
        if not book_data:
            return None
            
        chapters = book_data["chapters"]
        if chapter < 1 or chapter > len(chapters):
            return None

        # Determine navigation
        prev_chap = None
        if chapter > 1:
            prev_chap = {"book": abbrev, "chapter": chapter - 1}
        elif book_idx > 0:
            # Last chapter of previous book
            prev_book = cls._data[book_idx - 1]
            prev_chap = {"book": prev_book["abbrev"], "chapter": len(prev_book["chapters"])}

        next_chap = None
        if chapter < len(chapters):
            next_chap = {"book": abbrev, "chapter": chapter + 1}
        elif book_idx < len(cls._data) - 1:
            # First chapter of next book
            next_book = cls._data[book_idx + 1]
            next_chap = {"book": next_book["abbrev"], "chapter": 1}

        return BibleChapterContent(
            book_abbrev=abbrev,
            book_name=BOOK_NAMES.get(abbrev, abbrev.title()),
            chapter=chapter,
            verses=chapters[chapter - 1],
            previous_chapter=prev_chap,
            next_chapter=next_chap
        )
