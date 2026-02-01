"""
Labels em pt-BR para todos os enums do sistema.
Fonte única de verdade para internacionalização.
"""

from .enums import EcclesiasticalFunction, EcclesiasticalOffice, Gender, MaritalStatus, MemberStatus

OFFICE_LABELS: dict[EcclesiasticalOffice, str] = {
    EcclesiasticalOffice.Membro: "Membro",
    EcclesiasticalOffice.Diacono: "Diácono",
    EcclesiasticalOffice.Presbitero: "Presbítero",
    EcclesiasticalOffice.Pastor: "Pastor",
}

FUNCTION_LABELS: dict[EcclesiasticalFunction, str] = {
    EcclesiasticalFunction.Tesoureiro: "Tesoureiro",
    EcclesiasticalFunction.Secretario: "Secretário",
    EcclesiasticalFunction.Evangelista: "Evangelista",
    EcclesiasticalFunction.Missionario: "Missionário",
    EcclesiasticalFunction.ProfessorEbd: "Professor de EBD",
}

STATUS_LABELS: dict[MemberStatus, str] = {
    MemberStatus.Processo: "Em Processo",
    MemberStatus.Comungante: "Comungante",
    MemberStatus.NaoComungante: "Não Comungante",
    MemberStatus.Disciplina: "Sob Disciplina",
    MemberStatus.Afastado: "Afastado",
    MemberStatus.Transferido: "Transferido",
    MemberStatus.Falecido: "Falecido",
}

GENDER_LABELS: dict[Gender, str] = {
    Gender.Masculino: "Masculino",
    Gender.Feminino: "Feminino",
}

MARITAL_STATUS_LABELS: dict[MaritalStatus, str] = {
    MaritalStatus.Solteiro: "Solteiro(a)",
    MaritalStatus.Casado: "Casado(a)",
    MaritalStatus.Divorciado: "Divorciado(a)",
    MaritalStatus.Viuvo: "Viúvo(a)",
}


# Tipos de admissão (não é enum no backend, mas usado em formulários)
ADMISSION_TYPE_LABELS: dict[str, str] = {
    "BATISMO": "Batismo",
    "PROFISSAO_FE": "Profissão de Fé",
    "TRANSFERENCIA": "Transferência",
    "JURISDICAO": "Jurisdição",
    "RESTAURACAO": "Restauração",
}
