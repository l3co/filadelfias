import { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Church, Save, Camera } from 'lucide-react';
import { useCurrentUser, useCurrentTenant } from '../../hooks/useAuth';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';

export function ProfilePage() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  const membership = user?.memberships?.[0];
  const roleLabels: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
    MODERATOR: { label: 'Moderador', color: 'bg-blue-100 text-blue-700' },
    MEMBER: { label: 'Membro', color: 'bg-emerald-100 text-emerald-700' },
    ATTENDEE: { label: 'Participante', color: 'bg-slate-100 text-slate-700' },
  };

  const getRoleInfo = (role?: string) => {
    const normalizedRole = role?.toUpperCase() || 'ATTENDEE';
    return roleLabels[normalizedRole] || roleLabels.ATTENDEE;
  };

  const roleInfo = getRoleInfo(membership?.role);

  const handleSave = () => {
    // TODO: Implementar atualização do perfil
    setIsEditing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeaderWithIcon
        icon={User}
        title="Meu Perfil"
        description="Gerencie suas informações pessoais"
      />

      {/* Profile Header Card */}
      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-emerald-600">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Name & Role */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                {tenant && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Church className="h-3.5 w-3.5" />
                    {tenant.name}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              ) : (
                'Editar Perfil'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-slate-700 py-2">{user?.name || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {user?.email || '-'}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <div className="flex items-center gap-2 text-slate-700 py-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {formData.phone || 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Membro desde</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatDate(membership?.joined_at)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Church Information */}
      {tenant && (
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Church className="h-5 w-5 text-emerald-600" />
              Minha Igreja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {tenant.name?.split(' ').filter(w => w.length > 2 && w[0] === w[0].toUpperCase()).map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900">{tenant.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {[tenant.street, tenant.number, tenant.neighborhood, tenant.city, tenant.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {tenant.phone && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {tenant.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Security */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Segurança da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">Alterar senha</p>
              <p className="text-sm text-slate-500">Atualize sua senha de acesso</p>
            </div>
            <Button variant="outline">Alterar</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
            <div>
              <p className="font-medium text-red-700">Excluir conta</p>
              <p className="text-sm text-red-500">Esta ação é irreversível</p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
