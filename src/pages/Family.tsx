
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Mail, 
  Crown, 
  Shield, 
  Edit, 
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

const Family = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: user?.name || 'Você',
      email: user?.email || '',
      role: 'admin',
      joinedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);

  const handleInviteMember = () => {
    if (!inviteEmail) {
      toast({
        title: "Erro de validação",
        description: "Digite um email válido para o convite.",
        variant: "destructive",
      });
      return;
    }

    if (familyMembers.some(member => member.email === inviteEmail)) {
      toast({
        title: "Membro já existe",
        description: "Este email já está na sua família financeira.",
        variant: "destructive",
      });
      return;
    }

    if (familyMembers.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "O plano Premium permite até 5 membros na família.",
        variant: "destructive",
      });
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'member',
      joinedAt: new Date().toISOString(),
      status: 'pending'
    };

    setFamilyMembers([...familyMembers, newMember]);
    setInviteEmail('');

    toast({
      title: "Convite enviado!",
      description: `Um convite foi enviado para ${inviteEmail}.`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
    toast({
      title: "Membro removido",
      description: "O membro foi removido da família financeira.",
    });
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
    toast({
      title: "Permissão atualizada",
      description: "As permissões do membro foram atualizadas.",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'member':
        return <Shield className="w-4 h-4 text-primary" />;
      case 'viewer':
        return <Users className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Pode gerenciar membros e todas as finanças';
      case 'member':
        return 'Pode adicionar e editar transações';
      case 'viewer':
        return 'Apenas visualizar relatórios';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">Ativo</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pendente</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">Inativo</span>;
      default:
        return null;
    }
  };

  if (user?.plan === 'free' || user?.plan === 'pro') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Plano Familiar</h1>
          <p className="text-muted-foreground">
            Gerencie as finanças de toda a família
          </p>
        </div>

        <Card className="gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-4">
              Plano Familiar Disponível no Premium
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Compartilhe o controle financeiro com até 5 membros da família. 
              Cada um com seu próprio acesso e permissões personalizadas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <UserPlus className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Até 5 membros</h3>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Controle de permissões</h3>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <Settings className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Gestão centralizada</h3>
              </div>
            </div>
            <Button variant="secondary" size="lg">
              Fazer Upgrade para Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plano Familiar</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da sua família financeira
        </p>
      </div>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Convidar Membro
          </CardTitle>
          <CardDescription>
            Adicione um novo membro à sua família financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="inviteEmail">Email do membro</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleInviteMember}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            O membro receberá um email com instruções para aceitar o convite.
          </p>
        </CardContent>
      </Card>

      {/* Family Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Membros da Família ({familyMembers.length}/5)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{member.name}</h3>
                      {getRoleIcon(member.role)}
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDescription(member.role)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {member.role !== 'admin' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const currentRole = member.role;
                          const newRole = currentRole === 'member' ? 'viewer' : 'member';
                          handleChangeRole(member.id, newRole);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {member.role === 'admin' && member.id !== '1' && (
                    <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Permissão</CardTitle>
          <CardDescription>
            Entenda o que cada tipo de membro pode fazer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium">Administrador</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adicionar/remover membros</li>
                <li>• Gerenciar permissões</li>
                <li>• Acesso total às finanças</li>
                <li>• Configurar notificações</li>
                <li>• Exportar relatórios</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Membro</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adicionar transações</li>
                <li>• Editar próprias transações</li>
                <li>• Criar/editar metas</li>
                <li>• Ver relatórios completos</li>
                <li>• Usar assistente IA</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-medium">Visualizador</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ver dashboard</li>
                <li>• Visualizar relatórios</li>
                <li>• Acompanhar metas</li>
                <li>• Usar assistente IA (limitado)</li>
                <li>• Sem edição de dados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Statistics */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Estatísticas da Família</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {familyMembers.filter(m => m.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Membros ativos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {familyMembers.filter(m => m.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Convites pendentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {5 - familyMembers.length}
              </div>
              <p className="text-sm text-muted-foreground">Vagas disponíveis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Family;
