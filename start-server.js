const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor Next.js...');

const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next.cmd');
const child = spawn(nextBin, ['dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
});

child.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
});

child.on('exit', (code) => {
    console.log(`📋 Servidor finalizado com código: ${code}`);
});