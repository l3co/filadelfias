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
