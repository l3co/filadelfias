"""
Validators for domain entities and schemas.
"""
import re
from typing import Optional

from pydantic import ValidationError


def validate_password_strength(v: str) -> str:
    """
    Validate that the password meets strength requirements:
    - At least 8 characters long
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(v) < 8:
        raise ValueError("A senha deve ter pelo menos 8 caracteres")
    
    if not re.search(r"[A-Z]", v):
        raise ValueError("A senha deve conter pelo menos uma letra maiúscula")
    
    if not re.search(r"[a-z]", v):
        raise ValueError("A senha deve conter pelo menos uma letra minúscula")
    
    if not re.search(r"\d", v):
        raise ValueError("A senha deve conter pelo menos um número")
        
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\",.<>/?]", v):
        raise ValueError("A senha deve conter pelo menos um caractere especial (ex: !@#$%)")

    return v
