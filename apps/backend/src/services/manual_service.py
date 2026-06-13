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


def _generate_unique_id(
    part_idx: int, chapter_idx: int, section_idx: int | None = None, article_idx: int | None = None
) -> str:
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


def _process_structure(data: dict[str, Any]) -> dict[str, Any]:
    """Process the manual structure - now supports new JSON format."""
    metadata = data.get("metadata", {})
    parts = data.get("parts", [])

    processed_parts = []
    all_articles = []

    for part in parts:
        processed_chapters = []

        # New format: chapters directly in part
        for chapter in part.get("chapters", []):
            chapter_articles = []

            # New format: articles directly in chapter
            for article in chapter.get("articles", []):
                if article.get("text"):
                    article_data = {
                        "id": article.get("id", ""),
                        "number": article.get("number", ""),
                        "text": article.get("text", ""),
                        "structure": article.get("structure", []),
                        "notes": article.get("notes", []),
                    }
                    chapter_articles.append(article_data)
                    all_articles.append(article_data)

            # Only add chapter if it has articles
            if chapter_articles:
                processed_chapters.append(
                    {
                        "id": chapter.get("id", ""),
                        "number": chapter.get("number", ""),
                        "title": _clean_title(chapter.get("title", "")),
                        "sections": chapter.get("sections", []),
                        "articles": chapter_articles,
                    }
                )

        # Only add part if it has chapters
        if processed_chapters:
            processed_parts.append(
                {
                    "id": part.get("id", ""),
                    "title": part.get("title", ""),
                    "chapters": processed_chapters,
                }
            )

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

    # Keep first 100 chars as excerpt, remove full text and other heavy fields
    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section.get("articles", []):
                    article["excerpt"] = (article.pop("text", "") or "")[:100]
                    article.pop("structure", None)
                    article.pop("notes", None)
            for article in chapter.get("articles", []):
                article["excerpt"] = (article.pop("text", "") or "")[:100]
                article.pop("structure", None)
                article.pop("notes", None)

    return processed


def get_article(article_id: str) -> dict[str, Any] | None:
    """Get a specific article by ID, including breadcrumb context."""
    data = _load_manual_data()
    processed = _process_structure(data)

    all_articles: list[tuple[dict[str, Any], dict[str, Any]]] = []

    for part in processed["parts"]:
        for chapter in part["chapters"]:
            for section in chapter.get("sections", []):
                for article in section["articles"]:
                    all_articles.append((article, {
                        "part_title": part["title"],
                        "chapter_title": chapter["title"],
                        "section_title": section["title"],
                    }))
            for article in chapter.get("articles", []):
                all_articles.append((article, {
                    "part_title": part["title"],
                    "chapter_title": chapter["title"],
                    "section_title": None,
                }))

    for idx, (article, context) in enumerate(all_articles):
        if article["id"] == article_id:
            prev_article = all_articles[idx - 1][0] if idx > 0 else None
            next_article = all_articles[idx + 1][0] if idx < len(all_articles) - 1 else None
            return {
                **article,
                "context": context,
                "navigation": {
                    "previous": {"id": prev_article["id"], "number": prev_article["number"]} if prev_article else None,
                    "next": {"id": next_article["id"], "number": next_article["number"]} if next_article else None,
                },
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

                        results.append(
                            {
                                "id": article["id"],
                                "number": article["number"],
                                "excerpt": excerpt,
                                "chapter": chapter_title,
                                "section": section.get("title", ""),
                            }
                        )

                        if len(results) >= limit:
                            return results

            for article in chapter.get("articles", []):
                text = article.get("text", "")
                if query_lower in text.lower():
                    idx = text.lower().find(query_lower)
                    start = max(0, idx - 50)
                    end = min(len(text), idx + len(query) + 50)
                    excerpt = "..." + text[start:end] + "..."

                    results.append(
                        {
                            "id": article["id"],
                            "number": article["number"],
                            "excerpt": excerpt,
                            "chapter": chapter_title,
                            "section": None,
                        }
                    )

                    if len(results) >= limit:
                        return results

    return results
