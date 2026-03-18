"""
Compatibility exports for financial repositories.
"""

from src.modules.financial.repository import (
    FinancialAccountRepository,
    TransactionCategoryRepository,
    TransactionRepository,
    financial_account_repository,
    transaction_category_repository,
    transaction_repository,
)

__all__ = [
    "FinancialAccountRepository",
    "TransactionCategoryRepository",
    "TransactionRepository",
    "financial_account_repository",
    "transaction_category_repository",
    "transaction_repository",
]
