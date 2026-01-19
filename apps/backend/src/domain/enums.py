"""
Domain enums for the application.
"""

from enum import Enum


class MemberStatus(str, Enum):
    Processo = "PROCESSO"
    Comungante = "COMUNGANTE"
    NaoComungante = "NAO_COMUNGANTE"
    Disciplina = "DISCIPLINA"
    Afastado = "AFASTADO"
    Transferido = "TRANSFERIDO"
    Falecido = "FALECIDO"


class EcclesiasticalOffice(str, Enum):
    """Ofício ordenado - hierarquia eclesiástica (apenas um por membro)"""

    Membro = "MEMBRO"
    Diacono = "DIACONO"
    Presbitero = "PRESBITERO"
    Pastor = "PASTOR"  # Todo pastor é presbítero


class EcclesiasticalFunction(str, Enum):
    """Função exercida - pode ter múltiplas"""

    Tesoureiro = "TESOUREIRO"
    Secretario = "SECRETARIO"
    Evangelista = "EVANGELISTA"
    Missionario = "MISSIONARIO"


# Mantido para compatibilidade, será removido após migração
class EcclesiasticalRole(str, Enum):
    Membro = "MEMBRO"
    Diacono = "DIACONO"
    Presbitero = "PRESBITERO"
    Pastor = "PASTOR"
    Evangelista = "EVANGELISTA"
    Missionario = "MISSIONARIO"


class Gender(str, Enum):
    Masculino = "M"
    Feminino = "F"


class MaritalStatus(str, Enum):
    Solteiro = "SOLTEIRO"
    Casado = "CASADO"
    Divorciado = "DIVORCIADO"
    Viuvo = "VIUVO"
