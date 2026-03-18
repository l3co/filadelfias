"""
Add EBD classes, students, lessons, and comments tables.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260318_0008"
down_revision = "20260318_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ebd_classes",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("min_age", sa.Integer(), nullable=True),
        sa.Column("max_age", sa.Integer(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_ebd_classes_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ebd_classes")),
    )
    op.create_index(op.f("ix_ebd_classes_tenant_id"), "ebd_classes", ["tenant_id"], unique=False)

    op.create_table(
        "ebd_students",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ebd_class_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("member_id", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="STUDENT"),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ebd_class_id"], ["ebd_classes.id"], name=op.f("fk_ebd_students_ebd_class_id_ebd_classes"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_ebd_students_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ebd_students")),
    )
    op.create_index(op.f("ix_ebd_students_ebd_class_id"), "ebd_students", ["ebd_class_id"], unique=False)
    op.create_index(op.f("ix_ebd_students_member_id"), "ebd_students", ["member_id"], unique=False)
    op.create_index(op.f("ix_ebd_students_tenant_id"), "ebd_students", ["tenant_id"], unique=False)

    op.create_table(
        "ebd_lessons",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ebd_class_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("homework_url", sa.Text(), nullable=True),
        sa.Column("bible_reference", sa.String(length=255), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ebd_class_id"], ["ebd_classes.id"], name=op.f("fk_ebd_lessons_ebd_class_id_ebd_classes"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_ebd_lessons_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ebd_lessons")),
    )
    op.create_index(op.f("ix_ebd_lessons_date"), "ebd_lessons", ["date"], unique=False)
    op.create_index(op.f("ix_ebd_lessons_ebd_class_id"), "ebd_lessons", ["ebd_class_id"], unique=False)
    op.create_index(op.f("ix_ebd_lessons_tenant_id"), "ebd_lessons", ["tenant_id"], unique=False)

    op.create_table(
        "ebd_comments",
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ebd_class_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("member_id", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ebd_class_id"], ["ebd_classes.id"], name=op.f("fk_ebd_comments_ebd_class_id_ebd_classes"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["ebd_lessons.id"], name=op.f("fk_ebd_comments_lesson_id_ebd_lessons"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["ebd_comments.id"], name=op.f("fk_ebd_comments_parent_id_ebd_comments"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_ebd_comments_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ebd_comments")),
    )
    op.create_index(op.f("ix_ebd_comments_ebd_class_id"), "ebd_comments", ["ebd_class_id"], unique=False)
    op.create_index(op.f("ix_ebd_comments_lesson_id"), "ebd_comments", ["lesson_id"], unique=False)
    op.create_index(op.f("ix_ebd_comments_member_id"), "ebd_comments", ["member_id"], unique=False)
    op.create_index(op.f("ix_ebd_comments_tenant_id"), "ebd_comments", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ebd_comments_tenant_id"), table_name="ebd_comments")
    op.drop_index(op.f("ix_ebd_comments_member_id"), table_name="ebd_comments")
    op.drop_index(op.f("ix_ebd_comments_lesson_id"), table_name="ebd_comments")
    op.drop_index(op.f("ix_ebd_comments_ebd_class_id"), table_name="ebd_comments")
    op.drop_table("ebd_comments")
    op.drop_index(op.f("ix_ebd_lessons_tenant_id"), table_name="ebd_lessons")
    op.drop_index(op.f("ix_ebd_lessons_ebd_class_id"), table_name="ebd_lessons")
    op.drop_index(op.f("ix_ebd_lessons_date"), table_name="ebd_lessons")
    op.drop_table("ebd_lessons")
    op.drop_index(op.f("ix_ebd_students_tenant_id"), table_name="ebd_students")
    op.drop_index(op.f("ix_ebd_students_member_id"), table_name="ebd_students")
    op.drop_index(op.f("ix_ebd_students_ebd_class_id"), table_name="ebd_students")
    op.drop_table("ebd_students")
    op.drop_index(op.f("ix_ebd_classes_tenant_id"), table_name="ebd_classes")
    op.drop_table("ebd_classes")
