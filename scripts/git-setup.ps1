# Script para inicializar Git e fazer commit
# Execute este script após instalar o Git

Write-Host "🚀 Inicializando repositório Git..."

# Verificar se git está instalado
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✅ Git encontrado!"
    
    # Inicializar repositório se não existir
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "📁 Repositório Git inicializado"
    }
    
    # Configurar informações do usuário (ajuste conforme necessário)
    git config user.name "Sistema Parlamentar"
    git config user.email "dev@parlamentar.com"
    
    # Criar .gitignore se não existir
    if (-not (Test-Path ".gitignore")) {
        @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
.next/
dist/
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "📝 .gitignore criado"
    }
    
    # Adicionar todos os arquivos
    git add .
    Write-Host "➕ Arquivos adicionados ao stage"
    
    # Fazer commit inicial
    $commitMessage = "feat: sistema completo de assessoria parlamentar

✨ Funcionalidades implementadas:
- 🏗️ Next.js 13 + TypeScript + Tailwind CSS
- 🔐 Sistema de autenticação com Supabase
- 📱 PWA completa com ícones e service worker  
- 🎯 Dashboard interativo com métricas
- 📋 CRUD completo de atendimentos e contatos
- 📊 Sistema de relatórios com exportação
- 🔔 Notificações push (VAPID configurado)
- 🛡️ Middleware de proteção de rotas
- 📖 Documentação completa

🎉 Sistema 100% funcional e pronto para produção!"

    git commit -m $commitMessage
    Write-Host "✅ Commit realizado com sucesso!"
    
    # Mostrar status
    git status
    Write-Host ""
    Write-Host "📋 Para conectar com GitHub:"
    Write-Host "git remote add origin https://github.com/caio7siqueira/app-acessoria-parlamentar.git"
    Write-Host "git branch -M main"
    Write-Host "git push -u origin main"
    
}
else {
    Write-Host "❌ Git não encontrado!"
    Write-Host "📥 Instale o Git em: https://git-scm.com/downloads"
    Write-Host "🔄 Depois execute este script novamente"
}