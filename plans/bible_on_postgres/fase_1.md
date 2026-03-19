# Fase 1 — Schema PostgreSQL e Models

Criação do schema de banco de dados e models SQLAlchemy para armazenar conteúdo bíblico e recursos de usuário.

---

## 🎯 Objetivo

Definir estrutura de dados completa no PostgreSQL com 8 tabelas para:
- Versões, livros, capítulos e versículos
- Anotações e destaques de usuários
- Planos de leitura e progresso

---

## 🗄️ Backend — Schema PostgreSQL

### Tabela 1: `bible_versions`

Versões da Bíblia disponíveis (NVI, ACF, AA, ARA remota).

```sql
CREATE TABLE bible_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,  -- 'nvi', 'acf', 'aa', 'ara'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dados iniciais:**
- `nvi` — Nova Versão Internacional
- `acf` — Almeida Corrigida Fiel
- `aa` — Almeida Atualizada
- `ara` — Almeida Revista e Atualizada (remota)

---

### Tabela 2: `bible_books`

Livros da Bíblia (66 livros × versões).

```sql
CREATE TABLE bible_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES bible_versions(id) ON DELETE CASCADE,
    abbrev VARCHAR(10) NOT NULL,  -- 'gn', 'ex', 'mt', 'jo'
    name VARCHAR(255) NOT NULL,   -- 'Gênesis', 'Êxodo'
    testament VARCHAR(10) NOT NULL,  -- 'OT', 'NT'
    book_order INTEGER NOT NULL,  -- 1-66
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(version_id, abbrev)
);

CREATE INDEX idx_bible_books_version ON bible_books(version_id);
CREATE INDEX idx_bible_books_order ON bible_books(book_order);
```

---

### Tabela 3: `bible_chapters`

Capítulos dos livros (1.189 capítulos totais).

```sql
CREATE TABLE bible_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES bible_books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),  -- Nullable - adicionar manualmente
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, chapter_number)
);

CREATE INDEX idx_bible_chapters_book ON bible_chapters(book_id);
CREATE INDEX idx_bible_chapters_book_number ON bible_chapters(book_id, chapter_number);
```

---

### Tabela 4: `bible_verses`

Versículos (~31k por versão × 3 = 93k registros).

```sql
CREATE TABLE bible_verses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES bible_chapters(id) ON DELETE CASCADE,
    verse_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_id, verse_number)
);

CREATE INDEX idx_bible_verses_chapter ON bible_verses(chapter_id);
CREATE INDEX idx_bible_verses_chapter_verse ON bible_verses(chapter_id, verse_number);

-- Full-text search (criado na Fase 8)
-- CREATE INDEX idx_bible_verses_text_search 
-- ON bible_verses USING gin(to_tsvector('portuguese', text));
```

---

### Tabela 5: `bible_notes`

Anotações de usuários nos versículos (tenant-aware).

```sql
CREATE TABLE bible_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    version_code VARCHAR(10) NOT NULL,
    book_abbrev VARCHAR(10) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bible_notes_user_tenant ON bible_notes(user_id, tenant_id);
CREATE INDEX idx_bible_notes_reference ON bible_notes(version_code, book_abbrev, chapter, verse);
CREATE INDEX idx_bible_notes_public ON bible_notes(is_public, tenant_id) WHERE is_public = TRUE;
```

---

### Tabela 6: `bible_highlights`

Destaques/marcações de versículos.

```sql
CREATE TABLE bible_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    version_code VARCHAR(10) NOT NULL,
    book_abbrev VARCHAR(10) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    color VARCHAR(50),  -- 'yellow', 'green', 'blue', 'pink', 'orange'
    category VARCHAR(100),  -- 'promise', 'prayer', 'commandment', 'prophecy'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id, version_code, book_abbrev, chapter, verse)
);

CREATE INDEX idx_bible_highlights_user_tenant ON bible_highlights(user_id, tenant_id);
CREATE INDEX idx_bible_highlights_reference ON bible_highlights(version_code, book_abbrev, chapter);
```

---

### Tabela 7: `reading_plans`

Planos de leitura bíblica (criados por líderes/pastores).

```sql
CREATE TABLE reading_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,  -- 30, 90, 365
    is_public BOOLEAN DEFAULT TRUE,
    readings JSONB NOT NULL,  -- [{ day: 1, references: ['gn 1', 'sl 1'] }]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reading_plans_tenant ON reading_plans(tenant_id);
CREATE INDEX idx_reading_plans_public ON reading_plans(is_public) WHERE is_public = TRUE;
```

**Estrutura do JSONB `readings`:**
```json
[
  {
    "day": 1,
    "references": ["gn 1", "sl 1"],
    "title": "No princípio"
  },
  {
    "day": 2,
    "references": ["gn 2-3", "sl 2"],
    "title": "A criação e a queda"
  }
]
```

---

### Tabela 8: `user_reading_progress`

Progresso individual nos planos de leitura.

```sql
CREATE TABLE user_reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
    current_day INTEGER DEFAULT 1,
    completed_readings JSONB DEFAULT '[]',  -- [1, 2, 5, 10]
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

CREATE INDEX idx_user_reading_progress_user ON user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_plan ON user_reading_progress(plan_id);
```

---

## 🐍 Backend — SQLAlchemy Models

### Arquivo: `src/infra/db/models.py`

Adicionar os seguintes models ao arquivo existente:

```python
from sqlalchemy import Boolean, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# ========== Conteúdo Bíblico ==========

class BibleVersionModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_versions"

    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    books: Mapped[list["BibleBookModel"]] = relationship(
        back_populates="version",
        cascade="all, delete-orphan",
    )


class BibleBookModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_books"
    __table_args__ = (UniqueConstraint("version_id", "abbrev", name="uq_bible_books_version_abbrev"),)

    version_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    abbrev: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    testament: Mapped[str] = mapped_column(String(10), nullable=False)
    book_order: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    version: Mapped["BibleVersionModel"] = relationship(back_populates="books")
    chapters: Mapped[list["BibleChapterModel"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
    )


class BibleChapterModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_chapters"
    __table_args__ = (UniqueConstraint("book_id", "chapter_number", name="uq_bible_chapters_book_number"),)

    book_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_books.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chapter_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    book: Mapped["BibleBookModel"] = relationship(back_populates="chapters")
    verses: Mapped[list["BibleVerseModel"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
    )


class BibleVerseModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_verses"
    __table_args__ = (UniqueConstraint("chapter_id", "verse_number", name="uq_bible_verses_chapter_verse"),)

    chapter_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bible_chapters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    verse_number: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    chapter: Mapped["BibleChapterModel"] = relationship(back_populates="verses")


# ========== Features de Usuário ==========

class BibleNoteModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_notes"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_code: Mapped[str] = mapped_column(String(10), nullable=False)
    book_abbrev: Mapped[str] = mapped_column(String(10), nullable=False)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False)
    verse: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class BibleHighlightModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "bible_highlights"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "tenant_id", "version_code", "book_abbrev", "chapter", "verse",
            name="uq_bible_highlights_user_verse"
        ),
    )

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_code: Mapped[str] = mapped_column(String(10), nullable=False)
    book_abbrev: Mapped[str] = mapped_column(String(10), nullable=False)
    chapter: Mapped[int] = mapped_column(Integer, nullable=False)
    verse: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class ReadingPlanModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reading_plans"

    tenant_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    creator_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    readings: Mapped[dict] = mapped_column(JSONB, nullable=False)


class UserReadingProgressModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "user_reading_progress"
    __table_args__ = (UniqueConstraint("user_id", "plan_id", name="uq_user_reading_progress_user_plan"),)

    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("reading_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    current_day: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed_readings: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
```

---

## 🔄 Backend — Alembic Migration

### Arquivo: `alembic/versions/20260319_0009_bible_schema.py`

```python
"""bible_schema

Revision ID: 20260319_0009
Revises: 20260318_0008
Create Date: 2026-03-19 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20260319_0009'
down_revision: Union[str, None] = '20260318_0008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Bible versions
    op.create_table(
        'bible_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(10), nullable=False, unique=True, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('is_remote', sa.Boolean, default=False, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Bible books
    op.create_table(
        'bible_books',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('version_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('abbrev', sa.String(10), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('testament', sa.String(10), nullable=False),
        sa.Column('book_order', sa.Integer, nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['version_id'], ['bible_versions.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('version_id', 'abbrev', name='uq_bible_books_version_abbrev'),
    )

    # Bible chapters
    op.create_table(
        'bible_chapters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('book_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('chapter_number', sa.Integer, nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['bible_books.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('book_id', 'chapter_number', name='uq_bible_chapters_book_number'),
    )
    op.create_index('idx_bible_chapters_book_number', 'bible_chapters', ['book_id', 'chapter_number'])

    # Bible verses
    op.create_table(
        'bible_verses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chapter_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('verse_number', sa.Integer, nullable=False),
        sa.Column('text', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['chapter_id'], ['bible_chapters.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('chapter_id', 'verse_number', name='uq_bible_verses_chapter_verse'),
    )
    op.create_index('idx_bible_verses_chapter_verse', 'bible_verses', ['chapter_id', 'verse_number'])

    # Bible notes
    op.create_table(
        'bible_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('version_code', sa.String(10), nullable=False),
        sa.Column('book_abbrev', sa.String(10), nullable=False),
        sa.Column('chapter', sa.Integer, nullable=False),
        sa.Column('verse', sa.Integer, nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('is_public', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_bible_notes_user_tenant', 'bible_notes', ['user_id', 'tenant_id'])
    op.create_index('idx_bible_notes_reference', 'bible_notes', ['version_code', 'book_abbrev', 'chapter', 'verse'])

    # Bible highlights
    op.create_table(
        'bible_highlights',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('version_code', sa.String(10), nullable=False),
        sa.Column('book_abbrev', sa.String(10), nullable=False),
        sa.Column('chapter', sa.Integer, nullable=False),
        sa.Column('verse', sa.Integer, nullable=False),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'tenant_id', 'version_code', 'book_abbrev', 'chapter', 'verse', 
                          name='uq_bible_highlights_user_verse'),
    )
    op.create_index('idx_bible_highlights_user_tenant', 'bible_highlights', ['user_id', 'tenant_id'])

    # Reading plans
    op.create_table(
        'reading_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('creator_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('duration_days', sa.Integer, nullable=False),
        sa.Column('is_public', sa.Boolean, default=True, nullable=False),
        sa.Column('readings', postgresql.JSONB, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='SET NULL'),
    )

    # User reading progress
    op.create_table(
        'user_reading_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('plan_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('current_day', sa.Integer, default=1, nullable=False),
        sa.Column('completed_readings', postgresql.JSONB, default=list, nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plan_id'], ['reading_plans.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'plan_id', name='uq_user_reading_progress_user_plan'),
    )


def downgrade() -> None:
    op.drop_table('user_reading_progress')
    op.drop_table('reading_plans')
    op.drop_table('bible_highlights')
    op.drop_table('bible_notes')
    op.drop_table('bible_verses')
    op.drop_table('bible_chapters')
    op.drop_table('bible_books')
    op.drop_table('bible_versions')
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Adicionar 8 models em `src/infra/db/models.py`
- [ ] Criar migration `alembic/versions/20260319_0009_bible_schema.py`
- [ ] Executar migration: `alembic upgrade head`
- [ ] Verificar tabelas no PostgreSQL
- [ ] Validar constraints e índices

### Frontend
- N/A nesta fase (apenas backend)

---

## 🧪 Validação

```bash
# 1. Executar migration
cd apps/backend
poetry run alembic upgrade head

# 2. Verificar tabelas criadas
psql -d filadelfias -c "\dt bible_*"
psql -d filadelfias -c "\dt reading_*"
psql -d filadelfias -c "\dt user_reading_*"

# 3. Verificar índices
psql -d filadelfias -c "\di bible_*"
```

**Resultado esperado:**
- 8 tabelas criadas
- ~15 índices criados
- Sem erros de constraint

---

## 📊 Estimativa

**Tempo:** 4-6 horas

**Breakdown:**
- Escrita do schema SQL: 1-2h
- Models SQLAlchemy: 2-3h
- Migration Alembic: 1h
- Testes e validação: 30min

---

## ➡️ Próximo Passo

**Fase 2:** Script de Importação dos dados JSON → PostgreSQL
