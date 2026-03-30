import { ChevronRight, Clock, GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEbdClasses, useMyEbdClass } from "@/hooks/useEbd";

export function EBDScreen() {
  const navigate = useNavigate();
  const { data: myClass, isLoading: isLoadingMyClass } = useMyEbdClass();
  const { data: classes, isLoading: isLoadingClasses } = useEbdClasses();

  if (isLoadingMyClass || isLoadingClasses) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando EBD...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Escola Biblica</h1>
        <p className="text-sm text-muted-foreground">Turmas, licoes e acompanhamento da EBD.</p>
      </div>

      {myClass ? (
        <button
          onClick={() => navigate(`/member/ebd/${myClass.id}`)}
          className="flex w-full items-center justify-between rounded-2xl border bg-amber-50 p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <GraduationCap size={22} className="text-amber-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Minha turma</p>
              <p className="font-semibold text-amber-900">{myClass.name}</p>
              <p className="text-sm text-amber-700">{myClass.teacher_name}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-amber-700" />
        </button>
      ) : null}

      <div className="space-y-3">
        {classes?.map((cls) => (
          <button
            key={cls.id}
            onClick={() => navigate(`/member/ebd/${cls.id}`)}
            className="flex w-full items-start justify-between rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted"
          >
            <div className="flex gap-3">
              <GraduationCap size={20} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{cls.name}</p>
                <p className="text-sm text-muted-foreground">{cls.teacher_name}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {typeof cls.students_count === "number" ? (
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} />
                      {cls.students_count} alunos
                    </span>
                  ) : null}
                  {cls.schedule ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {cls.schedule}
                    </span>
                  ) : null}
                  {cls.age_range ? <span>{cls.age_range}</span> : null}
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}

        {!classes?.length ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhuma turma disponivel no momento.
          </div>
        ) : null}
      </div>
    </div>
  );
}
