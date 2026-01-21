import { useState } from 'react';
import { MessageCircle, Plus, Heart, Clock, User, Send } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useCurrentUser } from '../../hooks/useAuth';

interface PrayerRequest {
  id: string;
  author: string;
  content: string;
  category: 'health' | 'family' | 'work' | 'spiritual' | 'other';
  createdAt: string;
  prayerCount: number;
  isAnonymous: boolean;
}

const mockPrayerRequests: PrayerRequest[] = [
  {
    id: '1',
    author: 'Maria Silva',
    content: 'Peço orações pela recuperação do meu pai que está hospitalizado.',
    category: 'health',
    createdAt: new Date().toISOString(),
    prayerCount: 15,
    isAnonymous: false,
  },
  {
    id: '2',
    author: 'Anônimo',
    content: 'Preciso de sabedoria para tomar uma decisão importante no trabalho.',
    category: 'work',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    prayerCount: 8,
    isAnonymous: true,
  },
  {
    id: '3',
    author: 'João Pedro',
    content: 'Orem pela minha família, estamos passando por um momento difícil de reconciliação.',
    category: 'family',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    prayerCount: 23,
    isAnonymous: false,
  },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  health: { label: 'Saúde', color: 'bg-red-100 text-red-700' },
  family: { label: 'Família', color: 'bg-blue-100 text-blue-700' },
  work: { label: 'Trabalho', color: 'bg-amber-100 text-amber-700' },
  spiritual: { label: 'Espiritual', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'Outros', color: 'bg-gray-100 text-gray-700' },
};

export function MemberPrayerPage() {
  useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  const handlePray = (id: string) => {
    setPrayedFor(prev => new Set(prev).add(id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envio do pedido
    setNewRequest('');
    setShowForm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeaderWithIcon
        icon={MessageCircle}
        title="Pedidos de Oração"
        description="Compartilhe suas necessidades e ore pelos irmãos"
        actions={
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={18} />
            Novo Pedido
          </Button>
        }
      />

      {/* New Request Form */}
      {showForm && (
        <Card className="mb-6 border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg text-green-800">Compartilhar Pedido de Oração</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  value={newRequest}
                  onChange={(e) => setNewRequest(e.target.value)}
                  placeholder="Compartilhe seu pedido de oração..."
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Publicar anonimamente
                </label>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="gap-2">
                  <Send size={16} />
                  Enviar Pedido
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>Lembre-se:</strong> "Confessem os seus pecados uns aos outros e orem uns pelos outros para serem curados. A oração de um justo é poderosa e eficaz." - Tiago 5:16
        </p>
      </div>

      {/* Prayer Requests List */}
      <div className="space-y-4">
        {mockPrayerRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.isAnonymous ? 'Anônimo' : request.author}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${categoryLabels[request.category].color}`}>
                  {categoryLabels[request.category].label}
                </span>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {request.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {request.prayerCount + (prayedFor.has(request.id) ? 1 : 0)} pessoas oraram
                </span>
                <Button
                  variant={prayedFor.has(request.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePray(request.id)}
                  disabled={prayedFor.has(request.id)}
                  className="gap-2"
                >
                  <Heart size={16} className={prayedFor.has(request.id) ? "fill-current" : ""} />
                  {prayedFor.has(request.id) ? 'Orei!' : 'Orar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
