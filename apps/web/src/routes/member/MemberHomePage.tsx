import { 
  BookOpen, 
  BookMarked, 
  Music,
  Heart, 
  Users, 
  Calendar, 
  Globe, 
  GraduationCap, 
  MessageCircle,
  Gavel,
  Wallet,
  Receipt
} from 'lucide-react';
import { useCurrentUser, useCurrentTenant, useCurrentMembership } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { WelcomeBanner } from '../../components/WelcomeBanner';
import { HomeCard, HomeCardGrid } from '../../components/HomeCard';
import { SocialMediaCard } from '../../components/SocialMediaCard';
import { AdminAccessCard } from '../../components/AdminAccessCard';

export function MemberHomePage() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const membership = useCurrentMembership();
  const { canSubmitExpenses } = usePermissions();

  return (
    <div className="max-w-5xl mx-auto">
      <WelcomeBanner 
        userName={user?.name || 'Visitante'} 
        churchName={tenant?.name}
        message="O que você gostaria de fazer hoje?"
      />

      <AdminAccessCard userRole={membership?.role} className="mb-6" />

      <HomeCardGrid columns={3}>
        <HomeCard
          icon={BookOpen}
          title="Bíblia Online"
          description="Leia e medite na Palavra de Deus"
          href="/member/bible"
          color="blue"
        />
        
        <HomeCard
          icon={Music}
          title="Hinário"
          description="Hinos da nossa tradição reformada"
          href="/member/hymnal"
          color="yellow"
        />
        
        <HomeCard
          icon={BookMarked}
          title="Manual Presbiteriano"
          description="Consulte os princípios da nossa fé"
          href="/member/manual"
          color="purple"
        />
        
        <HomeCard
          icon={Heart}
          title="Devocionais"
          description="Reflexões diárias para sua vida espiritual"
          href="/member/devotionals"
          color="red"
        />
        
        <HomeCard
          icon={Users}
          title="Membros"
          description="Conheça os irmãos da nossa igreja"
          href="/member/directory"
          color="emerald"
        />
        
        <HomeCard
          icon={Gavel}
          title="Governança"
          description="Conheça os órgãos de liderança"
          href="/member/governance"
          color="purple"
        />
        
        <HomeCard
          icon={Calendar}
          title="Eventos"
          description="Próximos eventos e atividades"
          href="/member/events"
          color="orange"
        />
        
        <HomeCard
          icon={Globe}
          title="Missões"
          description="Conheça nossos missionários"
          href="/member/missions"
          color="indigo"
        />
        
        <HomeCard
          icon={GraduationCap}
          title="EBD"
          description="Sua turma e materiais de estudo"
          href="/member/education"
          color="green"
        />
        
        <HomeCard
          icon={MessageCircle}
          title="Pedidos de Oração"
          description="Compartilhe e ore pelos irmãos"
          href="/member/prayer"
          color="pink"
        />
        
        <HomeCard
          icon={Wallet}
          title="Meus Dízimos"
          description="Registre seus dízimos e ofertas"
          href="/member/tithes"
          color="green"
        />
        
        {canSubmitExpenses && (
          <HomeCard
            icon={Receipt}
            title="Minhas Despesas"
            description="Solicite reembolso de despesas"
            href="/member/expenses"
            color="orange"
          />
        )}
      </HomeCardGrid>

      {/* Social Media Links */}
      <div className="mt-8">
        <SocialMediaCard tenant={tenant} />
      </div>
    </div>
  );
}
