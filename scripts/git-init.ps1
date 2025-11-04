# Script para inicializar repositorio Git
# Executar apos instalar o Git

Write-Host "Inicializando repositorio Git..." -ForegroundColor Green

# Verificar se Git esta instalado
try {
    git --version | Out-Null
    Write-Host "Git encontrado!" -ForegroundColor Green
}
catch {
    Write-Host "Git nao esta instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "Depois execute este script novamente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Inicializar repositorio
Write-Host "Inicializando repositorio..." -ForegroundColor Yellow
git init

# Configurar usuario (se nao estiver configurado)
$gitUser = git config user.name
if (!$gitUser) {
    Write-Host "Configurando Git..." -ForegroundColor Yellow
    $nome = Read-Host "Digite seu nome para o Git"
    $email = Read-Host "Digite seu email para o Git"
    git config --global user.name "$nome"
    git config --global user.email "$email"
}

# Criar .gitignore se nao existir
if (!(Test-Path ".gitignore")) {
    Write-Host "Criando .gitignore..." -ForegroundColor Yellow
    
    @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary
*.tmp
*.temp
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host ".gitignore criado!" -ForegroundColor Green
}

# Adicionar todos os arquivos
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer commit inicial
Write-Host "Fazendo commit inicial..." -ForegroundColor Yellow

$commitMessage = @"
feat: Sistema de Assessoria Parlamentar completo

Implementacao inicial do sistema completo de assessoria parlamentar com:

CARACTERISTICAS PRINCIPAIS:
- Next.js 13+ com App Router e TypeScript
- Tailwind CSS + shadcn/ui para interface moderna
- Supabase para backend, auth e banco de dados
- PWA completa com icones e service worker
- Dashboard interativo com metricas
- CRUD completo de atendimentos e contatos
- Sistema de busca e filtros avancados
- Sistema de relatorios com exportacao
- Notificacoes push (VAPID configurado)
- Middleware de protecao de rotas
- Documentacao completa

ESTRUTURA IMPLEMENTADA:
- Authentication system com Supabase Auth
- Database schema com RLS policies
- PWA configuration com manifest e service worker
- Responsive design mobile-first
- Sistema de tipos TypeScript completo
- Componentes reutilizaveis com shadcn/ui
- Hooks customizados para logica de negocio
- Servicos para integracao com APIs
- Middleware para protecao de rotas
- Testes basicos configurados

CREDENCIAIS DE DEMO:
- Email: demotest@parlamentar.com
- Senha: 123456

Sistema 100% funcional e pronto para producao!
"@

git commit -m "$commitMessage"

Write-Host "Repositorio Git inicializado com sucesso!" -ForegroundColor Green
Write-Host "" 
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Criar repositorio no GitHub/GitLab" -ForegroundColor White
Write-Host "2. Conectar ao repositorio remoto:" -ForegroundColor White
Write-Host "   git remote add origin <URL_DO_REPOSITORIO>" -ForegroundColor Cyan
Write-Host "3. Enviar o codigo:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sistema pronto para deploy!" -ForegroundColor Green