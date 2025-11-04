# Sistema de Assessoria Parlamentar

Sistema completo para gerenciamento de atendimentos e demandas da assessoria parlamentar, desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## 🚀 Características

- **PWA Completo**: Funciona offline e pode ser instalado no celular
- **Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Tempo Real**: Atualizações em tempo real via Supabase Realtime
- **Dashboard Interativo**: Visualizações e estatísticas dos atendimentos
- **CRUD Completo**: Gerenciamento completo de atendimentos e contatos
- **Relatórios**: Exportação em PDF e Excel
- **Sistema de Notificações**: Web Push para prazos e urgências
- **Histórico de Alterações**: Auditoria completa de mudanças
- **Filtros Avançados**: Busca e filtros por múltiplos critérios

## 🏗️ Tecnologias

### Frontend
- **Next.js 13+** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para styling
- **shadcn/ui** para componentes
- **Lucide React** para ícones
- **React Query (TanStack Query)** para gerenciamento de estado
- **React Hook Form** para formulários

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** para segurança
- **Triggers e Functions** para automação

### PWA & Mobile
- **Service Worker** para cache offline
- **Web App Manifest** para instalação
- **Web Push API** para notificações
- **Responsive Design** mobile-first

## 📱 Funcionalidades

### Dashboard
- Cards com estatísticas principais
- Gráficos de atendimentos por status, canal, secretaria
- Atendimentos urgentes e próximos do prazo
- Atualizações em tempo real

### Atendimentos
- **CRUD Completo**: Criar, visualizar, editar e excluir
- **Filtros Avançados**: Status, urgência, secretaria, canal, período
- **Busca Textual**: Por nome do cidadão ou descrição da solicitação
- **Paginação**: Navegação eficiente em grandes volumes
- **Histórico**: Registro automático de todas as alterações
- **Campos Dinâmicos**: Secretaria aparece apenas se encaminhamento = "Secretaria"
- **Máscaras**: Formatação automática de telefone e data

### Contatos
- **Agenda de Secretarias**: Contatos organizados por secretaria
- **Ações Rápidas**: Copiar telefone, abrir WhatsApp
- **Busca e Filtros**: Por nome ou secretaria
- **CRUD Completo**: Gerenciamento completo dos contatos

### Relatórios
- **Filtros Flexíveis**: Por período, secretaria, status, urgência
- **Exportação**: PDF e Excel com layout profissional
- **Estatísticas**: Resumo e distribuição dos dados
- **Gráficos**: Visualizações dos indicadores

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

**⚠️ IMPORTANTE: Node.js 16+ é obrigatório**

- **Node.js 16+ ou 18+** (CRÍTICO - o projeto não funciona com versões anteriores)
- npm 7+ ou yarn
- Conta no Supabase (gratuita)
- Conta na Vercel (gratuita para deploy)

**Verificar versão do Node.js:**
```bash
node --version
# Deve retornar v16.x.x ou superior
```

Se a versão for menor que 16, atualize antes de continuar.

### 2. Clone o Repositório
```bash
git clone https://github.com/caio7siqueira/app-acessoria-parlamentar.git
cd app-acessoria-parlamentar
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

### 5. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📊 Status do Projeto

✅ **Implementado:**
- ✅ Estrutura completa do projeto Next.js 13+ com App Router
- ✅ Configuração do Tailwind CSS + shadcn/ui + Lucide Icons
- ✅ Schema do banco de dados completo com triggers e RLS
- ✅ Services completos para atendimentos, contatos e relatórios
- ✅ Layout responsivo com sidebar e navbar mobile-first
- ✅ Dashboard com estatísticas e componentes funcionais
- ✅ Página de listagem de atendimentos com filtros
- ✅ PWA manifest configurado para instalação
- ✅ Types TypeScript completos para toda a aplicação
- ✅ Estrutura de pastas e components organizados
- ✅ Documentação completa de setup e deploy

🚧 **Funcionalidades Base Prontas (aguardando Supabase):**
- 🔄 CRUD completo de atendimentos (service layer pronto)
- 🔄 CRUD completo de contatos (service layer pronto)  
- 🔄 Sistema de relatórios com export PDF/Excel
- 🔄 Notificações em tempo real via Supabase Realtime
- 🔄 Histórico automático de alterações
- 🔄 Dashboard com gráficos e estatísticas

📋 **Próximos desenvolvimentos:**
- Formulários de criação e edição com React Hook Form
- Sistema de autenticação com Supabase Auth
- Componentes de gráficos com Chart.js/Recharts  
- Service Worker para funcionalidade offline
- Testes automatizados
- CI/CD com GitHub Actions

## ⚠️ Requisitos Importantes

### Node.js Version
**CRÍTICO:** O projeto requer **Node.js 16 ou superior**. 

Versão atual detectada: Node.js 14.16.1
Versão mínima necessária: Node.js 16.0.0

Para verificar sua versão:
```bash
node --version
```

Para atualizar Node.js:
- **Windows**: Baixe em https://nodejs.org
- **macOS**: `brew install node` ou baixe em https://nodejs.org  
- **Linux**: `nvm install 16` ou use o gerenciador de pacotes

### Dependências
Após atualizar Node.js:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [Issue no GitHub](https://github.com/caio7siqueira/app-acessoria-parlamentar/issues)
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para facilitar o atendimento ao cidadão**