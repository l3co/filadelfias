import { 
  BookOpen, 
  BookMarked, 
  Heart, 
  Users, 
  Calendar, 
  Globe, 
  GraduationCap, 
  MessageCircle 
} from 'lucide-react';
import { useCurrentUser, useCurrentTenant } from '../../hooks/useAuth';
import { WelcomeBanner } from '../../components/WelcomeBanner';
import { HomeCard, HomeCardGrid } from '../../components/HomeCard';

export function MemberHomePage() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();

  return (
    <div className="max-w-5xl mx-auto">
      <WelcomeBanner 
        userName={user?.name || 'Visitante'} 
        churchName={tenant?.name}
        message="O que você gostaria de fazer hoje?"
      />

      <HomeCardGrid columns={3}>
        <HomeCard
          icon={BookOpen}
          title="Bíblia Online"
          description="Leia e medite na Palavra de Deus"
          href="/membro/biblia"
          color="blue"
        />
        
        <HomeCard
          icon={BookMarked}
          title="Manual Presbiteriano"
          description="Consulte os princípios da nossa fé"
          href="/membro/manual"
          color="purple"
        />
        
        <HomeCard
          icon={Heart}
          title="Devocionais"
          description="Reflexões diárias para sua vida espiritual"
          href="/membro/devocionais"
          color="red"
        />
        
        <HomeCard
          icon={Users}
          title="Diretório de Membros"
          description="Conheça os irmãos da nossa igreja"
          href="/membro/diretorio"
          color="green"
        />
        
        <HomeCard
          icon={Calendar}
          title="Eventos"
          description="Próximos eventos e atividades"
          href="/membro/eventos"
          color="orange"
        />
        
        <HomeCard
          icon={Globe}
          title="Missões"
          description="Conheça nossos missionários"
          href="/membro/missoes"
          color="indigo"
        />
        
        <HomeCard
          icon={GraduationCap}
          title="EBD"
          description="Sua turma e materiais de estudo"
          href="/membro/ebd"
          color="yellow"
        />
        
        <HomeCard
          icon={MessageCircle}
          title="Pedidos de Oração"
          description="Compartilhe e ore pelos irmãos"
          href="/membro/oracao"
          color="pink"
        />
      </HomeCardGrid>
    </div>
  );
}
