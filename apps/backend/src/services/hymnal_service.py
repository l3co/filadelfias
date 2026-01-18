import json
import os
from typing import List, Optional, Dict
from pydantic import BaseModel

class Hymn(BaseModel):
    number: int
    title: str
    author: str
    lyrics: List[str]

class HymnalService:
    _data: List[Dict] = []
    _loaded: bool = False

    @classmethod
    def load_data(cls):
        if cls._loaded:
            return
        
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "hymnal_nc.json")
        try:
            with open(path, "r", encoding="utf-8") as f:
                cls._data = json.load(f)
            cls._loaded = True
            print(f"Hymnal data loaded: {len(cls._data)} hymns")
        except FileNotFoundError:
            print(f"Hymnal data not found at {path}")
            cls._data = []

    @classmethod
    def get_hymns(cls) -> List[Hymn]:
        if not cls._loaded:
            cls.load_data()
        
        # Return summaries (maybe could optimize to exclude lyrics for list, but for now it's fine)
        return [Hymn(**h) for h in cls._data]

    @classmethod
    def get_hymn(cls, number: int) -> Optional[Hymn]:
        if not cls._loaded:
            cls.load_data()
            
        for h in cls._data:
            if h["number"] == number:
                return Hymn(**h)
        return None
