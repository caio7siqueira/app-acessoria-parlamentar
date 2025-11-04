// generateVapid.js
const crypto = require('crypto');

// Tentamos carregar web-push, mas caso não funcione, mostramos uma alternativa
try {
  const webpush = require('web-push');
  const vapidKeys = webpush.generateVAPIDKeys();
  console.log('✅ Public Key:\n', vapidKeys.publicKey);
  console.log('🔒 Private Key:\n', vapidKeys.privateKey);
} catch (err) {
  console.log('⚠️ Biblioteca "web-push" não encontrada ou incompatível.');
  console.log('Gerando chaves alternativas (não padronizadas)...');

  const publicKey = crypto.randomBytes(65).toString('base64');
  const privateKey = crypto.randomBytes(32).toString('base64');

  console.log('✅ Public Key (fake, para testes):\n', publicKey);
  console.log('🔒 Private Key (fake, para testes):\n', privateKey);
}
