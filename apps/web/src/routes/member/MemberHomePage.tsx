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
import { usePermissions } from '../../hooks/usePermissions';
import { WelcomeBanner } from '../../components/WelcomeBanner';
import { HomeCard, HomeCardGrid } from '../../components/HomeCard';
import { SocialMediaCard } from '../../components/SocialMediaCard';
import { AdminAccessCard } from '../../components/AdminAccessCard';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/routes';

export function MemberHomePage() {
  const { user, tenant, membership } = useAuth();
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
          href={ROUTES.MEMBER.BIBLE}
          color="blue"
        />
        
        <HomeCard
          icon={Music}
          title="Hinário"
          description="Hinos da nossa tradição reformada"
          href={ROUTES.MEMBER.HYMNAL}
          color="yellow"
        />
        
        <HomeCard
          icon={BookMarked}
          title="Manual Presbiteriano"
          description="Consulte os princípios da nossa fé"
          href={ROUTES.MEMBER.MANUAL}
          color="purple"
        />
        
        <HomeCard
          icon={Heart}
          title="Devocionais"
          description="Reflexões diárias para sua vida espiritual"
          href={ROUTES.MEMBER.DEVOTIONALS}
          color="red"
        />
        
        <HomeCard
          icon={Users}
          title="Membros"
          description="Conheça os irmãos da nossa igreja"
          href={ROUTES.MEMBER.DIRECTORY}
          color="emerald"
        />
        
        <HomeCard
          icon={Gavel}
          title="Governança"
          description="Conheça os órgãos de liderança"
          href={ROUTES.MEMBER.GOVERNANCE}
          color="purple"
        />
        
        <HomeCard
          icon={Calendar}
          title="Eventos"
          description="Próximos eventos e atividades"
          href={ROUTES.MEMBER.EVENTS}
          color="orange"
        />
        
        <HomeCard
          icon={Globe}
          title="Missões"
          description="Conheça nossos missionários"
          href={ROUTES.MEMBER.MISSIONS}
          color="indigo"
        />
        
        <HomeCard
          icon={GraduationCap}
          title="EBD"
          description="Sua turma e materiais de estudo"
          href={ROUTES.MEMBER.EDUCATION}
          color="green"
        />
        
        <HomeCard
          icon={MessageCircle}
          title="Pedidos de Oração"
          description="Compartilhe e ore pelos irmãos"
          href={ROUTES.MEMBER.PRAYER}
          color="pink"
        />
        
        <HomeCard
          icon={Wallet}
          title="Meus Dízimos"
          description="Registre seus dízimos e ofertas"
          href={ROUTES.MEMBER.TITHES}
          color="green"
        />
        
        {canSubmitExpenses && (
          <HomeCard
            icon={Receipt}
            title="Minhas Despesas"
            description="Solicite reembolso de despesas"
            href={ROUTES.MEMBER.EXPENSES}
            color="orange"
          />
        )}
      </HomeCardGrid>

      {/* Social Media Links */}
      <div className="mt-8">
        <SocialMediaCard tenant={tenant ?? undefined} />
      </div>
    </div>
  );
}
