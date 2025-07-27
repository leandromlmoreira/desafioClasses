#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Executando pre-commit hooks...');

try {
  // Verificar se há mudanças não formatadas
  console.log('📝 Verificando formatação...');
  execSync('npm run format:check', { stdio: 'inherit' });
  console.log('✅ Formatação OK');

  // Formatar automaticamente se necessário
  console.log('🎨 Formatando código...');
  execSync('npm run format', { stdio: 'inherit' });
  console.log('✅ Código formatado');

  // Verificar se há erros de linting (se ESLint estiver configurado)
  const eslintConfig = path.join(process.cwd(), '.eslintrc.js');
  if (fs.existsSync(eslintConfig)) {
    console.log('🔍 Executando ESLint...');
    execSync('npx eslint . --ext .js', { stdio: 'inherit' });
    console.log('✅ ESLint OK');
  }

  console.log('🎉 Pre-commit hooks executados com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro nos pre-commit hooks:', error.message);
  process.exit(1);
}
