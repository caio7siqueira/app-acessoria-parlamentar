'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/services/supabaseClient';
import { useToast } from '@/components/ui/toast';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = getSupabaseClient();

  const [nome, setNome] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');

  // Gestão de usuários
  const [emailConvite, setEmailConvite] = useState('');
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    const n = (user?.user_metadata as any)?.nome || '';
    setNome(n);
    carregarUsuarios();
  }, [user]);

  const carregarUsuarios = async () => {
    try {
      // Buscar usuários da tabela usuarios (não auth.users)
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, role, ativo, criado_em')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsuarios([]);
        return;
      }
      
      setUsuarios(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setUsuarios([]);
    }
  };

  const salvarPerfil = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { nome },
    });
    showToast(error ? `Erro: ${error.message}` : 'Perfil atualizado com sucesso', error ? 'error' : 'success');
  };

  const alterarSenha = async () => {
    if (senhaNova !== senhaConfirm) {
      showToast('As senhas não coincidem', 'error');
      return;
    }
    if (senhaNova.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: senhaNova,
    });

    if (error) {
      showToast(`Erro: ${error.message}`, 'error');
    } else {
      showToast('Senha alterada com sucesso', 'success');
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaConfirm('');
    }
  };

  const convidarUsuario = async () => {
    if (!emailConvite || !emailConvite.includes('@')) {
      showToast('Email inválido', 'error');
      return;
    }

    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailConvite }),
      })

      const json = await res.json()
      if (!res.ok) {
        showToast(json.error || 'Erro ao enviar convite', 'error')
        return
      }

      showToast('Convite enviado com sucesso!', 'success')
      setEmailConvite('')
      carregarUsuarios()
    } catch (err: any) {
      console.error('Erro convidar usuario:', err)
      showToast('Erro ao processar convite', 'error')
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Preferências da conta e do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={salvarPerfil}>Salvar</Button>
              </div>
            </div>
          </Card>

          {/* Alterar Senha */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <Input
                  type="password"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <Input
                  type="password"
                  value={senhaConfirm}
                  onChange={(e) => setSenhaConfirm(e.target.value)}
                  placeholder="Digite novamente"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={alterarSenha} disabled={!senhaNova || !senhaConfirm}>
                  Alterar Senha
                </Button>
              </div>
            </div>
          </Card>

          {/* Gestão de Usuários */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Gestão de Usuários</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={emailConvite}
                  onChange={(e) => setEmailConvite(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1"
                />
                <Button onClick={convidarUsuario}>Enviar Convite</Button>
              </div>

              <div className="text-sm text-gray-600">
                <p>ⓘ Um email de convite será enviado para o usuário com instruções para criar a conta.</p>
              </div>

              {usuarios.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Usuários cadastrados</h3>
                  <div className="border rounded-md divide-y">
                    {usuarios.map((u) => (
                      <div key={u.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{u.nome}</p>
                          <p className="text-xs text-gray-500">
                            {u.email} • Role: {u.role} • 
                            Criado em {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-xs">
                          <span className={`px-2 py-1 rounded-full ${u.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Ambiente */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Informações do Ambiente</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Ambiente: {process.env.NODE_ENV}</li>
              <li>URL do Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configurada' : 'não configurada'}</li>
              <li>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configurada' : 'não configurada'}</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}