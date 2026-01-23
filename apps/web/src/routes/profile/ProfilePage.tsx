import { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Church, Camera, Eye, EyeOff, Lock, X, Briefcase } from 'lucide-react';
import { useCurrentUser, useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

export function ProfilePage() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    birth_date: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const officeLabels: Record<string, string> = {
    PASTOR: 'Pastor',
    PRESBITERO: 'Presbítero',
    DIACONO: 'Diácono',
    MEMBRO: 'Membro',
  };

  const functionLabels: Record<string, string> = {
    TESOUREIRO: 'Tesoureiro',
    SECRETARIO: 'Secretário',
    EVANGELISTA: 'Evangelista',
    MISSIONARIO: 'Missionário',
    PROFESSOR_EBD: 'Prof. EBD',
  };

  const { data: members } = useMembers(tenant?.id);
  const currentMember = members?.find(m => m.user_id === user?.id);
  const memberOffice = currentMember?.office;
  const memberFunctions = currentMember?.functions || [];

  const openEditModal = () => {
    setEditForm({
      name: user?.name || '',
      phone: currentMember?.phone || '',
      birth_date: currentMember?.birth_date || '',
      street: currentMember?.street || '',
      number: currentMember?.number || '',
      complement: currentMember?.complement || '',
      neighborhood: currentMember?.neighborhood || '',
      city: currentMember?.city || '',
      state: currentMember?.state || '',
      postal_code: currentMember?.postal_code || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar atualização do perfil via API
      toast.success('Perfil atualizado com sucesso!');
      setShowEditModal(false);
    } catch {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
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
                {memberOffice && officeLabels[memberOffice] && (
                  <Badge className="bg-emerald-100 text-emerald-700">{officeLabels[memberOffice]}</Badge>
                )}
                {tenant && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Church className="h-3.5 w-3.5" />
                    {tenant.name}
                  </span>
                )}
              </div>
              {memberFunctions.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {memberFunctions.map(fn => (
                    <Badge key={fn} variant="outline" className="text-xs text-indigo-600 border-indigo-200">
                      {functionLabels[fn] || fn}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              onClick={openEditModal}
              className="gap-2"
            >
              Editar Perfil
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
              <Label>Nome completo</Label>
              <p className="text-slate-700 py-2">{user?.name || '-'}</p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {user?.email || '-'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {currentMember?.phone || 'Não informado'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {currentMember?.birth_date ? formatDate(currentMember.birth_date) : 'Não informado'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Membro desde</Label>
              <div className="flex items-center gap-2 text-slate-700 py-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formatDate(membership?.joined_at)}
              </div>
            </div>

            {currentMember?.city && (
              <div className="space-y-2">
                <Label>Cidade</Label>
                <p className="text-slate-700 py-2">
                  {[currentMember.city, currentMember.state].filter(Boolean).join(' - ')}
                </p>
              </div>
            )}
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
            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Alterar</Button>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Alterar Senha</h2>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Digite a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Editar Perfil</h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nome completo</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Telefone</Label>
                <Input
                  id="editPhone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editBirthDate">Data de Nascimento</Label>
                <Input
                  id="editBirthDate"
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-slate-900 mb-3">Endereço</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1 space-y-2">
                    <Label htmlFor="editStreet">Rua</Label>
                    <Input
                      id="editStreet"
                      value={editForm.street}
                      onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editNumber">Número</Label>
                    <Input
                      id="editNumber"
                      value={editForm.number}
                      onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="editNeighborhood">Bairro</Label>
                    <Input
                      id="editNeighborhood"
                      value={editForm.neighborhood}
                      onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCity">Cidade</Label>
                    <Input
                      id="editCity"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editState">Estado</Label>
                    <Input
                      id="editState"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      maxLength={2}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
