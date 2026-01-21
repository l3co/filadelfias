import { useState } from 'react';
import { Heart, Calendar, ChevronLeft, ChevronRight, BookOpen, Share2 } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface Devotional {
  id: string;
  date: string;
  title: string;
  verse: string;
  verseReference: string;
  content: string;
  reflection: string;
  prayer: string;
}

const mockDevotionals: Devotional[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    title: 'Confiando no Senhor',
    verse: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.',
    verseReference: 'Provérbios 3:5',
    content: 'Em meio às incertezas da vida, somos chamados a depositar nossa confiança inteiramente em Deus. Não é fácil abrir mão do controle, especialmente quando enfrentamos situações difíceis. No entanto, a Palavra nos ensina que a verdadeira sabedoria está em reconhecer que o Senhor conhece o melhor caminho para nós.',
    reflection: 'Quais áreas da sua vida você ainda tenta controlar sozinho? Como seria entregar completamente essas situações nas mãos de Deus?',
    prayer: 'Senhor, ajuda-me a confiar em Ti acima de tudo. Quando meu entendimento for limitado, que eu possa descansar na Tua soberania. Amém.',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    title: 'Força na Fraqueza',
    verse: 'Mas ele me disse: "Minha graça é suficiente para você, pois o meu poder se aperfeiçoa na fraqueza."',
    verseReference: '2 Coríntios 12:9',
    content: 'Paulo aprendeu uma lição valiosa: nossas fraquezas não são obstáculos para Deus, mas oportunidades para que Seu poder se manifeste. Quando reconhecemos nossa limitação, abrimos espaço para a ação divina em nossas vidas.',
    reflection: 'Em que momentos você já experimentou a força de Deus em meio à sua fraqueza?',
    prayer: 'Pai, ensina-me a encontrar força em Ti quando me sentir fraco. Que Tua graça seja sempre suficiente para mim. Amém.',
  },
];

export function MemberDevotionalsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => new Date(prev.getTime() - 86400000));
  };

  const goToNextDay = () => {
    const tomorrow = new Date(selectedDate.getTime() + 86400000);
    if (tomorrow <= new Date()) {
      setSelectedDate(tomorrow);
    }
  };

  const todayDevotional = mockDevotionals[0];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeaderWithIcon
        icon={Heart}
        title="Devocionais"
        description="Reflexões diárias para nutrir sua vida espiritual"
      />

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
          <ChevronLeft size={20} />
        </Button>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={18} />
          <span className="font-medium capitalize">{formatDate(selectedDate)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToNextDay}
          disabled={selectedDate.toDateString() === new Date().toDateString()}
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Devotional Content */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <CardTitle className="text-2xl">{todayDevotional.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Verse */}
          <div className="bg-rose-50 rounded-xl p-5 border-l-4 border-rose-500">
            <p className="text-lg italic text-gray-700 mb-2">
              "{todayDevotional.verse}"
            </p>
            <p className="text-rose-600 font-semibold flex items-center gap-2">
              <BookOpen size={16} />
              {todayDevotional.verseReference}
            </p>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Meditação</h3>
            <p className="text-gray-600 leading-relaxed">
              {todayDevotional.content}
            </p>
          </div>

          {/* Reflection */}
          <div className="bg-amber-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Para Refletir</h3>
            <p className="text-amber-700">
              {todayDevotional.reflection}
            </p>
          </div>

          {/* Prayer */}
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Oração</h3>
            <p className="text-blue-700 italic">
              {todayDevotional.prayer}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" className="flex-1">
              <Share2 size={16} className="mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Devotionals */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Devocionais Anteriores</h3>
        <div className="space-y-3">
          {mockDevotionals.slice(1).map((devotional) => (
            <Card key={devotional.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{devotional.title}</p>
                  <p className="text-sm text-gray-500">{devotional.verseReference}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(devotional.date).toLocaleDateString('pt-BR')}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
