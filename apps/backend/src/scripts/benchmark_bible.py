"""
Benchmark script for bible repository queries.

Run with:
    poetry run python -m src.scripts.benchmark_bible
"""

from __future__ import annotations

import asyncio
import time
from statistics import mean, median

from src.infra.repositories.bible_repository import BibleRepository


async def benchmark_search() -> None:
    repo = BibleRepository()
    queries = ["amor", "salvação", "Jesus", "fé", "paz"]
    times: list[float] = []

    for query in queries:
        start = time.perf_counter()
        _results, total = await repo.search_verses(query=query, version_code="nvi", limit=50)
        elapsed_ms = (time.perf_counter() - start) * 1000
        times.append(elapsed_ms)
        print(f"search:{query} -> {elapsed_ms:.2f}ms ({total} resultados)")

    print(f"search avg={mean(times):.2f}ms median={median(times):.2f}ms")


async def benchmark_chapter() -> None:
    repo = BibleRepository()
    chapters = [("gn", 1), ("sl", 23), ("jo", 3), ("rm", 8), ("ap", 22)]
    times: list[float] = []

    for book, chapter in chapters:
        start = time.perf_counter()
        _chapter = await repo.get_chapter("nvi", book, chapter)
        elapsed_ms = (time.perf_counter() - start) * 1000
        times.append(elapsed_ms)
        print(f"chapter:{book} {chapter} -> {elapsed_ms:.2f}ms")

    print(f"chapter avg={mean(times):.2f}ms median={median(times):.2f}ms")


async def main() -> None:
    print("=== Bible Search Benchmark ===")
    await benchmark_search()
    print("\n=== Bible Chapter Benchmark ===")
    await benchmark_chapter()


if __name__ == "__main__":
    asyncio.run(main())
