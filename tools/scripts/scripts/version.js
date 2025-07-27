const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor() {
    this.versionFile = 'config/versioning/VERSION';
    this.changelogFile = 'CHANGELOG.md';
    this.packageFile = 'package.json';
    this.asciiArt = `
/ \\__           _____   ____  __     __  ____   _______   ______     _____   ____    ____    ______ 
(    @\\___     / ____| / __ \\ \\ \\   / / / __ \\ |__   __| |  ____|   / ____| / __ \\  |  _ \\  |  ____|
/         O   | |     | |  | | \\ \\_/ / | |  | |   | |    | |__     | |     | |  | | | | | | | |__   
/   (_____/   | |     | |  | |  \\   /  | |  | |   | |    |  __|    | |     | |  | | | | | | |  __| 
/_____/   U   | |____ | |__| |   | |   | |__| |   | |    | |____   | |____ | |__| | | |_| | | |____ 
               \\_____| \\____/    |_|    \\____/    |_|    |______|   \\_____| \\____/  |____/  |______|
`;
  }

  getCurrentVersion() {
    try {
      return fs.readFileSync(this.versionFile, 'utf8').trim();
    } catch (error) {
      console.error('Erro ao ler versão atual:', error.message);
      return '0.0.0';
    }
  }

  updateVersion(newVersion) {
    try {
      fs.writeFileSync(this.versionFile, newVersion);
      console.log(this.asciiArt);
      console.log(`✅ Versão atualizada para: ${newVersion}`);

      this.updateChangelog(newVersion);
      this.updatePackageJson(newVersion);

      console.log('🎉 Versionamento concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar versão:', error.message);
    }
  }

  updateChangelog(newVersion) {
    try {
      const changelog = fs.readFileSync(this.changelogFile, 'utf8');
      const today = new Date().toISOString().split('T')[0];

      const newEntry = `## [${newVersion}] - ${today}\n\n### Adicionado\n- Novas funcionalidades\n\n### Alterado\n- Melhorias em funcionalidades existentes\n\n### Corrigido\n- Correções de bugs\n\n---\n\n`;

      const updatedChangelog = changelog.replace(
        '# Changelog',
        `# Changelog\n\n${newEntry}`
      );
      fs.writeFileSync(this.changelogFile, updatedChangelog);

      console.log(`📝 Changelog atualizado para versão ${newVersion}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar changelog:', error.message);
    }
  }

  updatePackageJson(newVersion) {
    try {
      if (fs.existsSync(this.packageFile)) {
        const packageJson = JSON.parse(
          fs.readFileSync(this.packageFile, 'utf8')
        );
        packageJson.version = newVersion;
        fs.writeFileSync(
          this.packageFile,
          JSON.stringify(packageJson, null, 2)
        );
        console.log(`📦 package.json atualizado para versão ${newVersion}`);
      }
    } catch (error) {
      console.log('ℹ️ package.json não encontrado, pulando...');
    }
  }

  bumpVersion(type = 'patch') {
    const currentVersion = this.getCurrentVersion();
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    this.updateVersion(newVersion);
  }

  showHelp() {
    console.log(this.asciiArt);
    console.log(`
🔄 Sistema de Versionamento - Ethereal Arena dos Heróis

Uso: node scripts/version.js [comando] [tipo]

Comandos:
  current     - Mostra a versão atual
  bump        - Incrementa a versão (padrão: patch)
  set         - Define uma versão específica

Tipos de bump:
  major       - Incrementa versão principal (1.0.0 -> 2.0.0)
  minor       - Incrementa versão secundária (1.0.0 -> 1.1.0)
  patch       - Incrementa versão de correção (1.0.0 -> 1.0.1)

Exemplos:
  node scripts/version.js current
  node scripts/version.js bump patch
  node scripts/version.js bump minor
  node scripts/version.js bump major
  node scripts/version.js set 1.2.3
        `);
  }
}

const manager = new VersionManager();
const args = process.argv.slice(2);

if (args.length === 0) {
  manager.showHelp();
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'current':
    console.log(manager.asciiArt);
    console.log(`📋 Versão atual: ${manager.getCurrentVersion()}`);
    break;

  case 'bump':
    const type = args[1] || 'patch';
    console.log(`🔄 Incrementando versão (${type})...`);
    manager.bumpVersion(type);
    break;

  case 'set':
    const version = args[1];
    if (!version) {
      console.error('❌ Versão não especificada');
      process.exit(1);
    }
    console.log(`🎯 Definindo versão para: ${version}`);
    manager.updateVersion(version);
    break;

  default:
    console.error('❌ Comando inválido');
    manager.showHelp();
    process.exit(1);
}
