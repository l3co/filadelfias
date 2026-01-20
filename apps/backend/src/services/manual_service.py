"""
Service for Manual Presbiteriano 2019.
Loads and processes the manual JSON file.
"""

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


def _clean_title(title: str) -> str:
    """Remove page numbers and extra dots from titles."""
    # Remove patterns like ".... 13" or "............. 139"
    cleaned = re.sub(r"\.{2,}\s*\d+$", "", title)
    # Remove leading dash and spaces
    cleaned = re.sub(r"^–\s*", "", cleaned.strip())
    return cleaned.strip()


def _generate_unique_id(part_idx: int, chapter_idx: int, section_idx: int | None = None, article_idx: int | None = None) -> str:
    """Generate unique IDs based on position in hierarchy."""
    base = f"p{part_idx}/ch{chapter_idx}"
    if section_idx is not None:
        base += f"/sec{section_idx}"
    if article_idx is not None:
        base += f"/art{article_idx}"
    return base


@lru_cache(maxsize=1)
def _load_manual_data() -> dict[str, Any]:
    """Load and cache the manual JSON file."""
    assets_path = Path(__file__).parent.parent / "assets" / "manual_2019.json"
    with open(assets_path, encoding="utf-8") as f:
        return json.load(f)


def _has_content(chapter: dict[str, Any]) -> bool:
    """Check if a chapter has any articles with content."""
    items = chapter.get("items", [])
    if not items:
        return False
    
    for item in items:
        if item.get("type") == "article" and item.get("text"):
            return True
        if item.get("type") == "section":
            for sub_item in item.get("items", []):
                if sub_item.get("type") == "article" and sub_item.get("text"):
                    return True
    return False


def _process_structure(data: dict[str, Any]) -> dict[str, Any]:
    """Process the manual structure, fixing IDs and cleaning titles."""
    metadata = data.get("metadata", {})
    parts = data.get("parts", [])
    
    processed_parts = []
    all_articles = []
    
    for part_idx, part in enumerate(parts):
        processed_chapters = []
        
        for chapter_idx, chapter in enumerate(part.get("items", [])):
            # Skip chapters without content
            if not _has_content(chapter):
                continue
                
            chapter_id = _generate_unique_id(part_idx, chapter_idx)
            
            processed_sections = []
            chapter_articles = []
            
            for section_idx, section in enumerate(chapter.get("items", [])):
                if section.get("type") == "section":
                    section_id = _generate_unique_id(part_idx, chapter_idx, section_idx)
                    
                    section_articles = []
                    for article_idx, article in enumerate(section.get("items", [])):
                        if article.get("type") == "article" and article.get("text"):
                            article_id = _generate_unique_id(part_idx, chapter_idx, section_idx, article_idx)
                            article_data = {
                                "id": article_id,
                                "number": article.get("number", ""),
                                "text": article.get("text", ""),
                                "structure": article.get("structure", []),
                                "notes": article.get("notes", []),
                            }
                            section_articles.append(article_data)
                            all_articles.append(article_data)
                    
                    # Only add section if it has articles
                    if section_articles:
                        processed_sections.append({
                            "id": section_id,
                            "number": section.get("number", ""),
                            "title": _clean_title(section.get("title", "")),
                            "articles": section_articles,
                        })
                elif section.get("type") == "article" and section.get("text"):
                    # Articles directly in chapter (no section)
                    article_id = _generate_unique_id(part_idx, chapter_idx, None, section_idx)
                    article_data = {
                        "id": article_id,
                        "number": section.get("number", ""),
                        "text": section.get("text", ""),
                        "structure": section.get("structure", []),
                        "notes": section.get("notes", []),
                    }
                    chapter_articles.append(article_data)
                    all_articles.append(article_data)
            
            # Only add chapter if it has content
            if processed_sections or chapter_articles:
                processed_chapters.append({
                    "id": chapter_id,
                    "number": chapter.get("number", ""),
                    "title": _clean_title(chapter.get("title", "")),
                    "sections": processed_sections,
                    "articles": chapter_articles,
                })
        
        # Only add part if it has chapters with content
        if processed_chapters:
            processed_parts.append({
                "id": f"p{part_idx}",
                "title": part.get("title", ""),
                "chapters": processed_chapters,
            })
    
    return {
        "metadata": metadata,
        "parts": processed_parts,
        "total_articles": len(all_articles),
    }


@lru_cache(maxsize=1)
def get_manual_structure() -> dict[str, Any]:
    """Get the processed manual structure (without article texts)."""
    data = _load_manual_data()
    processed = _process_structure(data)
    
    # Remove article texts from structure (keep only metadata)
    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section.get("articles", []):
                    article.pop("text", None)
                    article.pop("structure", None)
                    article.pop("notes", None)
            for article in chapter.get("articles", []):
                article.pop("text", None)
                article.pop("structure", None)
                article.pop("notes", None)
    
    return processed


def get_article(article_id: str) -> dict[str, Any] | None:
    """Get a specific article by ID."""
    data = _load_manual_data()
    processed = _process_structure(data)
    
    all_articles = []
    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                all_articles.extend(section.get("articles", []))
            all_articles.extend(chapter.get("articles", []))
    
    # Find the article
    for idx, article in enumerate(all_articles):
        if article["id"] == article_id:
            # Add navigation
            prev_article = all_articles[idx - 1] if idx > 0 else None
            next_article = all_articles[idx + 1] if idx < len(all_articles) - 1 else None
            
            return {
                **article,
                "navigation": {
                    "previous": {"id": prev_article["id"], "number": prev_article["number"]} if prev_article else None,
                    "next": {"id": next_article["id"], "number": next_article["number"]} if next_article else None,
                }
            }
    
    return None


def search_articles(query: str, limit: int = 20) -> list[dict[str, Any]]:
    """Search articles by text content."""
    if not query or len(query) < 2:
        return []
    
    data = _load_manual_data()
    processed = _process_structure(data)
    
    query_lower = query.lower()
    results = []
    
    for part in processed["parts"]:
        for chapter in part["chapters"]:
            chapter_title = chapter.get("title", "")
            
            for section in chapter.get("sections", []):
                for article in section.get("articles", []):
                    text = article.get("text", "")
                    if query_lower in text.lower():
                        # Create excerpt around match
                        idx = text.lower().find(query_lower)
                        start = max(0, idx - 50)
                        end = min(len(text), idx + len(query) + 50)
                        excerpt = "..." + text[start:end] + "..."
                        
                        results.append({
                            "id": article["id"],
                            "number": article["number"],
                            "excerpt": excerpt,
                            "chapter": chapter_title,
                            "section": section.get("title", ""),
                        })
                        
                        if len(results) >= limit:
                            return results
            
            for article in chapter.get("articles", []):
                text = article.get("text", "")
                if query_lower in text.lower():
                    idx = text.lower().find(query_lower)
                    start = max(0, idx - 50)
                    end = min(len(text), idx + len(query) + 50)
                    excerpt = "..." + text[start:end] + "..."
                    
                    results.append({
                        "id": article["id"],
                        "number": article["number"],
                        "excerpt": excerpt,
                        "chapter": chapter_title,
                        "section": None,
                    })
                    
                    if len(results) >= limit:
                        return results
    
    return results
