#!/bin/bash

# Script de verificação do ambiente para Codespaces

echo "🔍 Verificando ambiente do Codespaces..."
echo "======================================="

# 1. Verificar Node.js
echo "📦 Node.js:"
node --version
echo ""

# 2. Verificar npm
echo "📦 npm:"
npm --version
echo ""

# 3. Verificar dependências
echo "📋 Verificando package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
    echo "📦 Instalando dependências..."
    npm install
else
    echo "❌ package.json não encontrado"
fi
echo ""

# 4. Verificar variáveis de ambiente
echo "🔐 Variáveis de ambiente:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local encontrado"
else
    echo "⚠️ .env.local não encontrado - criando template..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here

# Codespaces Configuration  
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=codespaces
EOF
    echo "📝 Template criado em .env.local - configure suas variáveis!"
fi
echo ""

# 5. Verificar estrutura do projeto
echo "📂 Estrutura do projeto:"
if [ -d "src" ]; then
    echo "✅ Pasta src/ encontrada"
    if [ -f "src/middleware.ts" ]; then
        echo "✅ middleware.ts encontrado"
    else
        echo "❌ middleware.ts não encontrado"
    fi
    
    if [ -f "src/app/login/page.tsx" ]; then
        echo "✅ Login page encontrada"
    else
        echo "❌ Login page não encontrada"
    fi
else
    echo "❌ Pasta src/ não encontrada"
fi
echo ""

# 6. Build do projeto
echo "🔨 Testando build..."
npm run build
echo ""

# 7. Informações do Codespace
echo "🌐 Informações do Codespace:"
echo "CODESPACE_NAME: $CODESPACE_NAME"
echo "GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
echo "GITHUB_USER: $GITHUB_USER"
echo ""

# 8. URLs importantes
echo "🔗 URLs importantes:"
if [ ! -z "$CODESPACE_NAME" ]; then
    echo "📱 App: https://$CODESPACE_NAME-3000.app.github.dev"
    echo "🔐 Login: https://$CODESPACE_NAME-3000.app.github.dev/login"
    echo "🧪 Debug: https://$CODESPACE_NAME-3000.app.github.dev/test-auth"
else
    echo "⚠️ Variável CODESPACE_NAME não definida"
fi
echo ""

echo "✅ Verificação completa!"
echo "🚀 Para iniciar: npm run dev"
echo "📖 Leia: CODESPACES-SETUP.md para mais detalhes"