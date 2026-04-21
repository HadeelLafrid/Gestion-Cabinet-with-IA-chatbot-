"""anonymize names in imported data

Revision ID: 9d2f7f1a2c3b
Revises: 23724b51242f
Create Date: 2026-04-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9d2f7f1a2c3b"
down_revision: Union[str, Sequence[str], None] = "23724b51242f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Anonymize person names by setting them to NULL."""

    # Main app tables.
    op.execute("UPDATE patients SET first_name = NULL, last_name = NULL")

    # users.first_name / users.last_name were created as NOT NULL in the initial migration.
    # Make them nullable first, then anonymize.
    op.alter_column("users", "first_name", existing_type=sa.String(), nullable=True)
    op.alter_column("users", "last_name", existing_type=sa.String(), nullable=True)
    op.execute("UPDATE users SET first_name = NULL, last_name = NULL")

    # Optional legacy imported table from old dump (`patient` with NOM/PRENOM columns).
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'patient'
            ) THEN
                EXECUTE 'UPDATE patient SET "NOM" = NULL, "PRENOM" = NULL';
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Data anonymization is irreversible.
    pass
