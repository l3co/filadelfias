import { useState } from 'react';
import { Heart, Calendar, ChevronLeft, ChevronRight, BookOpen, Share2 } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useDevotionalByDate, useDevotionals } from '../../features/devotionals/hooks/useDevotionals';

export function MemberDevotionalsPage() {
  const tenant = useCurrentTenant();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const dateString = selectedDate.toISOString().split('T')[0];
  const { data: currentDevotional, isLoading } = useDevotionalByDate(tenant?.id, dateString);
  const { data: allDevotionals } = useDevotionals(tenant?.id, 10);
  
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

  const previousDevotionals = allDevotionals?.filter(d => d.date !== dateString) || [];

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
      {isLoading ? (
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      ) : currentDevotional ? (
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="text-2xl">{currentDevotional.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Verse */}
            <div className="bg-rose-50 rounded-xl p-5 border-l-4 border-rose-500">
              <p className="text-lg italic text-gray-700 mb-2">
                "{currentDevotional.verse_text}"
              </p>
              <p className="text-rose-600 font-semibold flex items-center gap-2">
                <BookOpen size={16} />
                {currentDevotional.verse_reference}
              </p>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Meditação</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {currentDevotional.meditation}
              </p>
            </div>

            {/* Reflection */}
            {currentDevotional.reflection && (
              <div className="bg-amber-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Para Refletir</h3>
                <p className="text-amber-700">
                  {currentDevotional.reflection}
                </p>
              </div>
            )}

            {/* Prayer */}
            {currentDevotional.prayer && (
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Oração</h3>
                <p className="text-blue-700 italic">
                  {currentDevotional.prayer}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" className="flex-1">
                <Share2 size={16} className="mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-12 text-center">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum devocional para esta data</h3>
            <p className="text-gray-500">Selecione outra data ou aguarde novos devocionais.</p>
          </CardContent>
        </Card>
      )}

      {/* Previous Devotionals */}
      {previousDevotionals.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Devocionais Anteriores</h3>
          <div className="space-y-3">
            {previousDevotionals.map((devotional) => (
              <Card 
                key={devotional.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDate(new Date(devotional.date + 'T00:00:00'))}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{devotional.title}</p>
                    <p className="text-sm text-gray-500">{devotional.verse_reference}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(devotional.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
