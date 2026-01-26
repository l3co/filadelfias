"""
Categorias financeiras padrão baseadas no Manual da Igreja Presbiteriana do Brasil.

Estas categorias são fixas e representam as classificações contábeis
comuns em igrejas presbiterianas.
"""

from enum import Enum
from typing import List, TypedDict


class CategoryType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class CategoryDefinition(TypedDict):
    name: str
    type: str
    description: str


# Categorias de Receita (baseadas no Manual IPB)
INCOME_CATEGORIES: List[CategoryDefinition] = [
    {
        "name": "Dízimos",
        "type": "INCOME",
        "description": "Contribuições regulares dos membros (10% da renda)",
    },
    {
        "name": "Ofertas",
        "type": "INCOME",
        "description": "Ofertas voluntárias em cultos e reuniões",
    },
    {
        "name": "Doações",
        "type": "INCOME",
        "description": "Doações específicas de membros ou terceiros",
    },
    {
        "name": "Contribuições Especiais",
        "type": "INCOME",
        "description": "Contribuições para causas específicas (missões, construção, etc.)",
    },
    {
        "name": "Rendimentos",
        "type": "INCOME",
        "description": "Rendimentos de aplicações financeiras",
    },
    {
        "name": "Outras Receitas",
        "type": "INCOME",
        "description": "Outras receitas não classificadas",
    },
]

# Categorias de Despesa (baseadas no Manual IPB)
EXPENSE_CATEGORIES: List[CategoryDefinition] = [
    # Pessoal
    {
        "name": "Salários e Ordenados",
        "type": "EXPENSE",
        "description": "Remuneração de pastores e funcionários",
    },
    {
        "name": "Encargos Sociais",
        "type": "EXPENSE",
        "description": "INSS, FGTS e outros encargos trabalhistas",
    },
    # Manutenção
    {
        "name": "Energia Elétrica",
        "type": "EXPENSE",
        "description": "Conta de luz",
    },
    {
        "name": "Água e Esgoto",
        "type": "EXPENSE",
        "description": "Conta de água",
    },
    {
        "name": "Telefone e Internet",
        "type": "EXPENSE",
        "description": "Comunicações",
    },
    {
        "name": "Aluguel",
        "type": "EXPENSE",
        "description": "Aluguel do templo ou instalações",
    },
    {
        "name": "Manutenção Predial",
        "type": "EXPENSE",
        "description": "Reparos e manutenção do templo",
    },
    {
        "name": "Material de Limpeza",
        "type": "EXPENSE",
        "description": "Produtos de limpeza e higiene",
    },
    # Administrativas
    {
        "name": "Material de Escritório",
        "type": "EXPENSE",
        "description": "Papelaria e suprimentos de escritório",
    },
    {
        "name": "Taxas Bancárias",
        "type": "EXPENSE",
        "description": "Tarifas e taxas bancárias",
    },
    # Causas e Missões
    {
        "name": "Missões Nacionais",
        "type": "EXPENSE",
        "description": "Contribuições para missões nacionais",
    },
    {
        "name": "Missões Estrangeiras",
        "type": "EXPENSE",
        "description": "Contribuições para missões internacionais",
    },
    {
        "name": "Assistência Social",
        "type": "EXPENSE",
        "description": "Auxílio a membros e comunidade",
    },
    {
        "name": "Educação Cristã",
        "type": "EXPENSE",
        "description": "Material para EBD e cursos",
    },
    # Patrimônio
    {
        "name": "Equipamentos",
        "type": "EXPENSE",
        "description": "Compra de equipamentos e mobiliário",
    },
    {
        "name": "Reformas e Construção",
        "type": "EXPENSE",
        "description": "Obras e melhorias no templo",
    },
    {
        "name": "Outras Despesas",
        "type": "EXPENSE",
        "description": "Outras despesas não classificadas",
    },
]

# Todas as categorias padrão
DEFAULT_CATEGORIES: List[CategoryDefinition] = INCOME_CATEGORIES + EXPENSE_CATEGORIES


def get_default_categories() -> List[CategoryDefinition]:
    """Retorna todas as categorias padrão."""
    return DEFAULT_CATEGORIES


def get_income_categories() -> List[CategoryDefinition]:
    """Retorna apenas as categorias de receita."""
    return INCOME_CATEGORIES


def get_expense_categories() -> List[CategoryDefinition]:
    """Retorna apenas as categorias de despesa."""
    return EXPENSE_CATEGORIES
