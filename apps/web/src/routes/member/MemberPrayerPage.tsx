import { useState } from 'react';
import { MessageCircle, Plus, Heart, Clock, User, Send, Trash2 } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { usePrayerRequests, useCreatePrayerRequest, usePrayFor, useDeletePrayerRequest } from '../../features/prayer/hooks/usePrayer';
import { useAuth } from '../../contexts/AuthContext';

const categoryLabels: Record<string, { label: string; color: string }> = {
  health: { label: 'Saúde', color: 'bg-red-100 text-red-700' },
  family: { label: 'Família', color: 'bg-blue-100 text-blue-700' },
  work: { label: 'Trabalho', color: 'bg-amber-100 text-amber-700' },
  spiritual: { label: 'Espiritual', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'Outros', color: 'bg-gray-100 text-gray-700' },
};

export function MemberPrayerPage() {
  const { tenant, user } = useAuth();
  const { data: prayerRequests, isLoading } = usePrayerRequests(tenant?.id);
  const createRequest = useCreatePrayerRequest(tenant?.id);
  const prayFor = usePrayFor(tenant?.id);
  const deleteRequest = useDeletePrayerRequest(tenant?.id);
  
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState('');
  const [category, setCategory] = useState('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  const handlePray = (id: string) => {
    prayFor.mutate(id, {
      onSuccess: () => {
        setPrayedFor(prev => new Set(prev).add(id));
      }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este pedido de oração?')) {
      deleteRequest.mutate(id);
    }
  };

  const isMyRequest = (memberId: string) => {
    console.log('[Prayer] Checking ownership:', { memberId, userId: user?.id, match: user?.id === memberId });
    return user?.id === memberId;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({
      content: newRequest,
      category,
      is_anonymous: isAnonymous
    }, {
      onSuccess: () => {
        setNewRequest('');
        setCategory('other');
        setIsAnonymous(false);
        setShowForm(false);
      }
    });
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
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm text-gray-600 mb-1 block">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="health">Saúde</option>
                    <option value="family">Família</option>
                    <option value="work">Trabalho</option>
                    <option value="spiritual">Espiritual</option>
                    <option value="other">Outros</option>
                  </select>
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
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando pedidos...</div>
        ) : !prayerRequests?.length ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum pedido de oração ainda. Seja o primeiro a compartilhar!
          </div>
        ) : (
          prayerRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.author_name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${categoryLabels[request.category]?.color || categoryLabels.other.color}`}>
                    {categoryLabels[request.category]?.label || 'Outros'}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {request.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {request.prayer_count} pessoas oraram
                  </span>
                  <div className="flex items-center gap-2">
                    {isMyRequest(request.member_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        disabled={deleteRequest.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                    <Button
                      variant={prayedFor.has(request.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePray(request.id)}
                      disabled={prayedFor.has(request.id) || prayFor.isPending}
                      className="gap-2"
                    >
                      <Heart size={16} className={prayedFor.has(request.id) ? "fill-current" : ""} />
                      {prayedFor.has(request.id) ? 'Orei!' : 'Orar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
