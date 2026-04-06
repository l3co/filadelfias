import { useMemo } from "react";
import { BookMarked, BookOpen, ChevronRight, Church, Download, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/authStore";
import { devotionalsService } from "@/services/devotionals";

interface DailyVerse {
  text: string;
  reference: string;
}

const DAILY_VERSES: DailyVerse[] = [
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  { text: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.", reference: "1 Tessalonicenses 5:18" },
  { text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", reference: "Provérbios 3:5" },
  { text: "Não andeis ansiosos de coisa alguma; antes em tudo as vossas petições sejam conhecidas diante de Deus pela oração e súplica, com ação de graças.", reference: "Filipenses 4:6" },
  { text: "Sede fortes e corajosos. Não tenhais medo, nem vos assusteis com eles; pois o Senhor teu Deus é o que vai contigo; não te deixará, nem te abandonará.", reference: "Deuteronômio 31:6" },
  { text: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti.", reference: "Números 6:24-25" },
  { text: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.", reference: "Isaías 40:31" },
  { text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar um futuro e uma esperança.", reference: "Jeremias 29:11" },
  { text: "Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.", reference: "Mateus 11:28" },
  { text: "Porque sou eu que te fortaleço, e te ajudo, e te sustento com a minha destra fiel.", reference: "Isaías 41:10" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; a quem me recearei?", reference: "Salmos 27:1" },
  { text: "Alegrai-vos sempre no Senhor; outra vez digo: Alegrai-vos.", reference: "Filipenses 4:4" },
  { text: "Antes de todas as coisas, amai-vos ardentemente uns aos outros; porque o amor cobre uma multidão de pecados.", reference: "1 Pedro 4:8" },
  { text: "Porque pela graça sois salvos, por meio da fé; e isso não vem de vós; é dom de Deus.", reference: "Efésios 2:8" },
  { text: "Não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente.", reference: "Romanos 12:2" },
  { text: "Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens.", reference: "Colossenses 3:23" },
  { text: "O Senhor é bom, um forte refúgio no dia da angústia, e conhece os que nele confiam.", reference: "Naum 1:7" },
  { text: "A paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.", reference: "Filipenses 4:7" },
  { text: "Porque onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles.", reference: "Mateus 18:20" },
  { text: "Busca a justiça, a piedade, a fé, o amor, a perseverança, a mansidão.", reference: "1 Timóteo 6:11" },
  { text: "Porque o Senhor dá a sabedoria; da sua boca é que vêm o conhecimento e o entendimento.", reference: "Provérbios 2:6" },
  { text: "Encomendes ao Senhor as tuas obras, e os teus pensamentos serão estabelecidos.", reference: "Provérbios 16:3" },
  { text: "Porque não nos deu Deus o espírito de temor, mas de fortaleza, e de amor, e de moderação.", reference: "2 Timóteo 1:7" },
  { text: "Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos; porque eles aumentarão os teus dias e te darão longura de vida e paz.", reference: "Provérbios 3:1-2" },
  { text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.", reference: "Hebreus 11:1" },
  { text: "Amai-vos uns aos outros; como eu vos amei a vós, que também vós uns aos outros vos ameis.", reference: "João 13:34" },
  { text: "Mas eu, quanto a mim, clamarei a Deus, e o Senhor me salvará.", reference: "Salmos 55:16" },
  { text: "O Senhor é clemente e misericordioso; longânimo e grande em benignidade.", reference: "Salmos 145:8" },
];

function getDailyVerse(): DailyVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

const PUBLIC_CARDS = [
  { icon: BookOpen, title: "Bíblia", description: "ARC, NVI e outras versões", path: "/biblia" },
  { icon: Music, title: "Hinário", description: "Hinário Presbiteriano completo", path: "/hinario" },
  { icon: BookMarked, title: "Manual IPB", description: "Constituição da Igreja", path: "/manual" },
  { icon: Download, title: "Downloads", description: "Conteúdo offline", path: "/downloads" },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const currentChurchId = useAuthStore((state) => state.currentChurchId);

  const verse = useMemo(() => getDailyVerse(), []);

  const { data: events } = useEvents();

  const { data: devotional } = useQuery({
    queryKey: ["devotional-today", currentChurchId],
    queryFn: () => devotionalsService.getTodayDevotional(currentChurchId ?? undefined),
    enabled: Boolean(currentChurchId),
    staleTime: 1000 * 60 * 5,
  });

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    return (events ?? [])
      .filter((e) => parseISO(e.starts_at) >= today)
      .sort((a, b) => +parseISO(a.starts_at) - +parseISO(b.starts_at))
      .slice(0, 3);
  }, [events]);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const churchName = user?.churches[0]?.name ?? "";

  return (
    <div className="space-y-4 p-4">
      {/* Versículo do dia — sempre visível */}
      <div className="rounded-2xl bg-gradient-to-br from-green-700 to-teal-600 p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Versículo do dia</p>
        <p className="mt-2 text-base font-medium leading-relaxed">"{verse.text}"</p>
        <p className="mt-3 text-right text-sm font-semibold opacity-90">— {verse.reference}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : isAuthenticated ? (
        <AuthenticatedContent
          firstName={firstName}
          churchName={churchName}
          upcomingEvents={upcomingEvents}
          devotional={devotional ?? null}
          onNavigate={navigate}
        />
      ) : (
        <GuestContent onNavigate={navigate} />
      )}
    </div>
  );
}

function GuestContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <>
      <div>
        <p className="text-sm text-muted-foreground">
          Filadélfias é a plataforma digital para igrejas presbiterianas. Acesse a Bíblia, o Hinário e o Manual IPB gratuitamente.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PUBLIC_CARDS.map(({ icon: Icon, title, description, path }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className="flex flex-col gap-2 rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted"
          >
            <Icon size={22} className="text-primary" />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <Button className="w-full" onClick={() => onNavigate("/auth/login")}>
        <Church size={16} className="mr-2" />
        Entrar na Minha Igreja
      </Button>
    </>
  );
}

interface AuthenticatedContentProps {
  firstName: string;
  churchName: string;
  upcomingEvents: { id: string; title: string; starts_at: string; location: string }[];
  devotional: { id: string; title: string; content: string } | null;
  onNavigate: (path: string) => void;
}

function AuthenticatedContent({ firstName, churchName, upcomingEvents, devotional, onNavigate }: AuthenticatedContentProps) {
  return (
    <>
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {firstName} 👋</h1>
        {churchName ? <p className="text-sm text-muted-foreground">{churchName}</p> : null}
      </div>

      {/* Próximos eventos */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Próximos eventos</h2>
          <button
            onClick={() => onNavigate("/member/events")}
            className="flex items-center gap-1 text-xs text-primary"
          >
            Ver agenda <ChevronRight size={12} />
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onNavigate("/member/events")}
                className="flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(event.starts_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                  </p>
                  {event.location ? (
                    <p className="truncate text-xs text-muted-foreground">{event.location}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum evento próximo.</p>
        )}
      </section>

      {/* Devocional de hoje */}
      {devotional ? (
        <section className="space-y-2">
          <h2 className="font-semibold">Devocional de hoje</h2>
          <button
            onClick={() => onNavigate("/member/devotionals")}
            className="w-full rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted"
          >
            <p className="font-medium">{devotional.title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {devotional.content.slice(0, 120)}{devotional.content.length > 120 ? "…" : ""}
            </p>
          </button>
        </section>
      ) : null}
    </>
  );
}
