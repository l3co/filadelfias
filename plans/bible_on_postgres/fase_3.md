# Fase 3 — Repository Layer

Camada de acesso a dados para conteúdo bíblico e recursos de usuário.

---

## 🎯 Objetivo

Criar repository layer seguindo Clean Architecture para abstrair acesso ao PostgreSQL, isolando lógica de persistência da lógica de negócio.

---

## 🐍 Backend — Repository

### Arquivo: `src/infra/repositories/bible_repository.py`

```python
"""
Repository para acesso aos dados bíblicos no PostgreSQL.
"""

from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from src.infra.db.models import (
    BibleBookModel,
    BibleChapterModel,
    BibleHighlightModel,
    BibleNoteModel,
    BibleVerseModel,
    BibleVersionModel,
    ReadingPlanModel,
    UserReadingProgressModel,
)
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class BibleRepository(SQLAlchemyRepository):
    """Repository para conteúdo bíblico."""

    # ========== Versões ==========

    async def get_versions(self, active_only: bool = True) -> List[dict]:
        """Lista versões disponíveis."""
        async with self.session() as session:
            stmt = select(BibleVersionModel)
            if active_only:
                stmt = stmt.where(BibleVersionModel.is_active == True)
            stmt = stmt.order_by(BibleVersionModel.code)

            result = await session.execute(stmt)
            versions = result.scalars().all()

            return [
                {
                    "id": str(v.id),
                    "code": v.code,
                    "name": v.name,
                    "description": v.description,
                    "is_remote": v.is_remote,
                }
                for v in versions
            ]

    async def get_version_by_code(self, code: str) -> Optional[BibleVersionModel]:
        """Busca versão por código."""
        async with self.session() as session:
            stmt = select(BibleVersionModel).where(BibleVersionModel.code == code)
            result = await session.execute(stmt)
            return result.scalars().first()

    # ========== Livros ==========

    async def get_books(self, version_code: str = "nvi") -> List[dict]:
        """Lista livros de uma versão com contagem de capítulos."""
        async with self.session() as session:
            # Buscar versão
            version = await self.get_version_by_code(version_code)
            if not version:
                return []

            # Query com contagem de capítulos
            stmt = (
                select(
                    BibleBookModel,
                    func.count(BibleChapterModel.id).label("chapters_count"),
                )
                .outerjoin(BibleChapterModel, BibleChapterModel.book_id == BibleBookModel.id)
                .where(BibleBookModel.version_id == version.id)
                .group_by(BibleBookModel.id)
                .order_by(BibleBookModel.book_order)
            )

            result = await session.execute(stmt)
            books_with_count = result.all()

            return [
                {
                    "abbrev": book.abbrev,
                    "name": book.name,
                    "testament": book.testament,
                    "chapters_count": chapters_count,
                }
                for book, chapters_count in books_with_count
            ]

    async def get_book_by_abbrev(
        self, version_code: str, abbrev: str
    ) -> Optional[BibleBookModel]:
        """Busca livro por abreviação."""
        async with self.session() as session:
            version = await self.get_version_by_code(version_code)
            if not version:
                return None

            stmt = select(BibleBookModel).where(
                and_(
                    BibleBookModel.version_id == version.id,
                    BibleBookModel.abbrev == abbrev,
                )
            )
            result = await session.execute(stmt)
            return result.scalars().first()

    # ========== Capítulos e Versículos ==========

    async def get_chapter(
        self, version_code: str, book_abbrev: str, chapter_number: int
    ) -> Optional[dict]:
        """Busca capítulo completo com versículos."""
        async with self.session() as session:
            # Buscar livro
            book = await self.get_book_by_abbrev(version_code, book_abbrev)
            if not book:
                return None

            # Buscar capítulo com versículos
            stmt = (
                select(BibleChapterModel)
                .options(selectinload(BibleChapterModel.verses))
                .where(
                    and_(
                        BibleChapterModel.book_id == book.id,
                        BibleChapterModel.chapter_number == chapter_number,
                    )
                )
            )
            result = await session.execute(stmt)
            chapter = result.scalars().first()

            if not chapter:
                return None

            # Ordenar versículos
            verses = sorted(chapter.verses, key=lambda v: v.verse_number)

            return {
                "book_abbrev": book.abbrev,
                "book_name": book.name,
                "chapter": chapter_number,
                "title": chapter.title,
                "verses": [
                    {
                        "number": v.verse_number,
                        "text": v.text,
                    }
                    for v in verses
                ],
            }

    async def get_verse(
        self, version_code: str, book_abbrev: str, chapter_number: int, verse_number: int
    ) -> Optional[dict]:
        """Busca versículo específico."""
        async with self.session() as session:
            book = await self.get_book_by_abbrev(version_code, book_abbrev)
            if not book:
                return None

            stmt = (
                select(BibleVerseModel)
                .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
                .where(
                    and_(
                        BibleChapterModel.book_id == book.id,
                        BibleChapterModel.chapter_number == chapter_number,
                        BibleVerseModel.verse_number == verse_number,
                    )
                )
            )
            result = await session.execute(stmt)
            verse = result.scalars().first()

            if not verse:
                return None

            return {
                "version": version_code,
                "book": book.name,
                "book_abbrev": book_abbrev,
                "chapter": chapter_number,
                "verse": verse_number,
                "text": verse.text,
            }

    # ========== Busca Full-Text ==========

    async def search_verses(
        self,
        query: str,
        version_code: str = "nvi",
        testament: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[dict], int]:
        """
        Busca full-text nos versículos.
        
        Returns:
            Tuple[resultados, total_count]
        """
        async with self.session() as session:
            version = await self.get_version_by_code(version_code)
            if not version:
                return [], 0

            # Query base
            base_stmt = (
                select(
                    BibleVerseModel,
                    BibleChapterModel.chapter_number,
                    BibleBookModel.abbrev,
                    BibleBookModel.name.label("book_name"),
                )
                .join(BibleChapterModel, BibleChapterModel.id == BibleVerseModel.chapter_id)
                .join(BibleBookModel, BibleBookModel.id == BibleChapterModel.book_id)
                .where(BibleBookModel.version_id == version.id)
            )

            # Filtro de testamento
            if testament:
                base_stmt = base_stmt.where(BibleBookModel.testament == testament.upper())

            # Full-text search (será otimizado na Fase 8)
            # Por enquanto, usar ILIKE (menos eficiente)
            search_filter = BibleVerseModel.text.ilike(f"%{query}%")
            base_stmt = base_stmt.where(search_filter)

            # Contar total
            count_stmt = select(func.count()).select_from(base_stmt.subquery())
            total = await session.scalar(count_stmt)

            # Buscar resultados paginados
            stmt = base_stmt.limit(limit).offset(offset)
            result = await session.execute(stmt)
            rows = result.all()

            results = [
                {
                    "book": book_name,
                    "book_abbrev": abbrev,
                    "chapter": chapter_number,
                    "verse": verse.verse_number,
                    "text": verse.text,
                    "reference": f"{book_name} {chapter_number}:{verse.verse_number}",
                }
                for verse, chapter_number, abbrev, book_name in rows
            ]

            return results, total

    # ========== Anotações ==========

    async def create_note(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        content: str,
        is_public: bool = False,
    ) -> dict:
        """Cria anotação em versículo."""
        async with self.session() as session:
            note = BibleNoteModel(
                tenant_id=tenant_id,
                user_id=user_id,
                version_code=version_code,
                book_abbrev=book_abbrev,
                chapter=chapter,
                verse=verse,
                content=content,
                is_public=is_public,
            )
            session.add(note)
            await session.commit()
            await session.refresh(note)

            return self._note_to_dict(note)

    async def get_user_notes(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: Optional[str] = None,
        book_abbrev: Optional[str] = None,
        chapter: Optional[int] = None,
    ) -> List[dict]:
        """Lista anotações do usuário."""
        async with self.session() as session:
            stmt = select(BibleNoteModel).where(
                and_(
                    BibleNoteModel.user_id == user_id,
                    BibleNoteModel.tenant_id == tenant_id,
                )
            )

            if version_code:
                stmt = stmt.where(BibleNoteModel.version_code == version_code)
            if book_abbrev:
                stmt = stmt.where(BibleNoteModel.book_abbrev == book_abbrev)
            if chapter:
                stmt = stmt.where(BibleNoteModel.chapter == chapter)

            stmt = stmt.order_by(BibleNoteModel.created_at.desc())

            result = await session.execute(stmt)
            notes = result.scalars().all()

            return [self._note_to_dict(n) for n in notes]

    async def update_note(self, note_id: UUID, content: str) -> Optional[dict]:
        """Atualiza conteúdo de anotação."""
        async with self.session() as session:
            note = await session.get(BibleNoteModel, note_id)
            if not note:
                return None

            note.content = content
            await session.commit()
            await session.refresh(note)

            return self._note_to_dict(note)

    async def delete_note(self, note_id: UUID, user_id: UUID) -> bool:
        """Deleta anotação (apenas do próprio usuário)."""
        async with self.session() as session:
            note = await session.get(BibleNoteModel, note_id)
            if not note or note.user_id != user_id:
                return False

            await session.delete(note)
            await session.commit()
            return True

    # ========== Destaques ==========

    async def create_highlight(
        self,
        tenant_id: UUID,
        user_id: UUID,
        version_code: str,
        book_abbrev: str,
        chapter: int,
        verse: int,
        color: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict:
        """Cria ou atualiza destaque em versículo."""
        async with self.session() as session:
            # Buscar existente
            stmt = select(BibleHighlightModel).where(
                and_(
                    BibleHighlightModel.user_id == user_id,
                    BibleHighlightModel.tenant_id == tenant_id,
                    BibleHighlightModel.version_code == version_code,
                    BibleHighlightModel.book_abbrev == book_abbrev,
                    BibleHighlightModel.chapter == chapter,
                    BibleHighlightModel.verse == verse,
                )
            )
            result = await session.execute(stmt)
            highlight = result.scalars().first()

            if highlight:
                # Atualizar existente
                highlight.color = color
                highlight.category = category
            else:
                # Criar novo
                highlight = BibleHighlightModel(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    version_code=version_code,
                    book_abbrev=book_abbrev,
                    chapter=chapter,
                    verse=verse,
                    color=color,
                    category=category,
                )
                session.add(highlight)

            await session.commit()
            await session.refresh(highlight)

            return self._highlight_to_dict(highlight)

    async def get_user_highlights(
        self,
        user_id: UUID,
        tenant_id: UUID,
        version_code: Optional[str] = None,
        book_abbrev: Optional[str] = None,
        chapter: Optional[int] = None,
    ) -> List[dict]:
        """Lista destaques do usuário."""
        async with self.session() as session:
            stmt = select(BibleHighlightModel).where(
                and_(
                    BibleHighlightModel.user_id == user_id,
                    BibleHighlightModel.tenant_id == tenant_id,
                )
            )

            if version_code:
                stmt = stmt.where(BibleHighlightModel.version_code == version_code)
            if book_abbrev:
                stmt = stmt.where(BibleHighlightModel.book_abbrev == book_abbrev)
            if chapter:
                stmt = stmt.where(BibleHighlightModel.chapter == chapter)

            result = await session.execute(stmt)
            highlights = result.scalars().all()

            return [self._highlight_to_dict(h) for h in highlights]

    async def delete_highlight(self, highlight_id: UUID, user_id: UUID) -> bool:
        """Remove destaque."""
        async with self.session() as session:
            highlight = await session.get(BibleHighlightModel, highlight_id)
            if not highlight or highlight.user_id != user_id:
                return False

            await session.delete(highlight)
            await session.commit()
            return True

    # ========== Helpers ==========

    @staticmethod
    def _note_to_dict(note: BibleNoteModel) -> dict:
        return {
            "id": str(note.id),
            "version_code": note.version_code,
            "book_abbrev": note.book_abbrev,
            "chapter": note.chapter,
            "verse": note.verse,
            "content": note.content,
            "is_public": note.is_public,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }

    @staticmethod
    def _highlight_to_dict(highlight: BibleHighlightModel) -> dict:
        return {
            "id": str(highlight.id),
            "version_code": highlight.version_code,
            "book_abbrev": highlight.book_abbrev,
            "chapter": highlight.chapter,
            "verse": highlight.verse,
            "color": highlight.color,
            "category": highlight.category,
            "created_at": highlight.created_at.isoformat(),
        }
```

---

### Arquivo: `src/infra/repositories/reading_plan_repository.py`

```python
"""
Repository para planos de leitura bíblica.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infra.db.models import ReadingPlanModel, UserReadingProgressModel
from src.infra.repositories.sqlalchemy_repository import SQLAlchemyRepository


class ReadingPlanRepository(SQLAlchemyRepository):
    """Repository para planos de leitura."""

    async def create_plan(
        self,
        tenant_id: UUID,
        creator_id: UUID,
        name: str,
        description: Optional[str],
        duration_days: int,
        readings: list,
        is_public: bool = True,
    ) -> dict:
        """Cria plano de leitura."""
        async with self.session() as session:
            plan = ReadingPlanModel(
                tenant_id=tenant_id,
                creator_id=creator_id,
                name=name,
                description=description,
                duration_days=duration_days,
                readings=readings,
                is_public=is_public,
            )
            session.add(plan)
            await session.commit()
            await session.refresh(plan)

            return self._plan_to_dict(plan)

    async def get_public_plans(self, tenant_id: UUID) -> List[dict]:
        """Lista planos públicos do tenant."""
        async with self.session() as session:
            stmt = (
                select(ReadingPlanModel)
                .where(
                    and_(
                        ReadingPlanModel.tenant_id == tenant_id,
                        ReadingPlanModel.is_public == True,
                    )
                )
                .order_by(ReadingPlanModel.created_at.desc())
            )

            result = await session.execute(stmt)
            plans = result.scalars().all()

            return [self._plan_to_dict(p) for p in plans]

    async def get_plan_by_id(self, plan_id: UUID) -> Optional[dict]:
        """Busca plano por ID."""
        async with self.session() as session:
            plan = await session.get(ReadingPlanModel, plan_id)
            if not plan:
                return None
            return self._plan_to_dict(plan)

    async def start_plan(self, user_id: UUID, plan_id: UUID) -> dict:
        """Inicia plano para usuário."""
        async with self.session() as session:
            # Verificar se já iniciou
            stmt = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(stmt)
            progress = result.scalars().first()

            if progress:
                # Já existe, retornar
                return self._progress_to_dict(progress)

            # Criar novo
            progress = UserReadingProgressModel(
                user_id=user_id,
                plan_id=plan_id,
                current_day=1,
                completed_readings=[],
            )
            session.add(progress)
            await session.commit()
            await session.refresh(progress)

            return self._progress_to_dict(progress)

    async def update_progress(
        self, user_id: UUID, plan_id: UUID, completed_day: int
    ) -> Optional[dict]:
        """Marca dia como concluído."""
        async with self.session() as session:
            stmt = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(stmt)
            progress = result.scalars().first()

            if not progress:
                return None

            # Adicionar dia aos concluídos
            completed = progress.completed_readings or []
            if completed_day not in completed:
                completed.append(completed_day)
                progress.completed_readings = sorted(completed)
                progress.current_day = max(completed) + 1

            await session.commit()
            await session.refresh(progress)

            return self._progress_to_dict(progress)

    async def get_user_progress(self, user_id: UUID, plan_id: UUID) -> Optional[dict]:
        """Busca progresso do usuário em um plano."""
        async with self.session() as session:
            stmt = select(UserReadingProgressModel).where(
                and_(
                    UserReadingProgressModel.user_id == user_id,
                    UserReadingProgressModel.plan_id == plan_id,
                )
            )
            result = await session.execute(stmt)
            progress = result.scalars().first()

            if not progress:
                return None

            return self._progress_to_dict(progress)

    @staticmethod
    def _plan_to_dict(plan: ReadingPlanModel) -> dict:
        return {
            "id": str(plan.id),
            "name": plan.name,
            "description": plan.description,
            "duration_days": plan.duration_days,
            "readings": plan.readings,
            "is_public": plan.is_public,
            "created_at": plan.created_at.isoformat(),
        }

    @staticmethod
    def _progress_to_dict(progress: UserReadingProgressModel) -> dict:
        return {
            "id": str(progress.id),
            "plan_id": str(progress.plan_id),
            "current_day": progress.current_day,
            "completed_readings": progress.completed_readings or [],
            "started_at": progress.started_at.isoformat(),
            "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
        }
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar `src/infra/repositories/bible_repository.py`
- [ ] Criar `src/infra/repositories/reading_plan_repository.py`
- [ ] Adicionar em `src/infra/repositories/__init__.py`:
  ```python
  from .bible_repository import BibleRepository
  from .reading_plan_repository import ReadingPlanRepository
  ```
- [ ] Criar testes unitários para repositories

### Frontend
- N/A nesta fase (apenas backend)

---

## 🧪 Testes Unitários

### Arquivo: `tests/unit/test_bible_repository.py`

```python
import pytest
from uuid import uuid4

from src.infra.repositories.bible_repository import BibleRepository


@pytest.mark.asyncio
async def test_get_versions():
    repo = BibleRepository()
    versions = await repo.get_versions()
    
    assert len(versions) >= 3
    assert any(v["code"] == "nvi" for v in versions)


@pytest.mark.asyncio
async def test_get_books():
    repo = BibleRepository()
    books = await repo.get_books("nvi")
    
    assert len(books) == 66
    assert books[0]["abbrev"] == "gn"
    assert books[0]["name"] == "Gênesis"


@pytest.mark.asyncio
async def test_get_chapter():
    repo = BibleRepository()
    chapter = await repo.get_chapter("nvi", "gn", 1)
    
    assert chapter is not None
    assert chapter["book_abbrev"] == "gn"
    assert chapter["chapter"] == 1
    assert len(chapter["verses"]) == 31


@pytest.mark.asyncio
async def test_search_verses():
    repo = BibleRepository()
    results, total = await repo.search_verses("amor", "nvi")
    
    assert total > 0
    assert len(results) <= 50
```

---

## 📊 Estimativa

**Tempo:** 6-8 horas

**Breakdown:**
- BibleRepository: 3-4h
- ReadingPlanRepository: 2-3h
- Testes unitários: 1-2h

---

## ➡️ Próximo Passo

**Fase 4:** Service Layer com Fallback Strategy
