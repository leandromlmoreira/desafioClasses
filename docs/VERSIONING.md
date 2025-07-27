# 🔄 Sistema de Versionamento

Este documento descreve o sistema de versionamento implementado no projeto **Ethereal - Arena dos Heróis**.

## 📋 Visão Geral

O projeto utiliza **Versionamento Semântico (SemVer)** seguindo o padrão `MAJOR.MINOR.PATCH`:

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis

## 📁 Arquivos do Sistema

### VERSION

Contém a versão atual do projeto em formato simples:

```
1.0.0
```

### CHANGELOG.md

Documenta todas as mudanças por versão seguindo o padrão [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.0.0] - 2024-12-19

### Adicionado

- Novas funcionalidades

### Alterado

- Melhorias em funcionalidades existentes

### Corrigido

- Correções de bugs
```

### scripts/version.js

Script Node.js para automatizar o processo de versionamento:

- **current**: Mostra a versão atual
- **bump**: Incrementa a versão (patch, minor, major)
- **set**: Define uma versão específica

### package.json

Configuração do projeto com scripts de versionamento e metadados.

## 🚀 Comandos Disponíveis

### Ver Versão Atual

```bash
node scripts/version.js current
npm run version:current
```

### Incrementar Versão

```bash
# Patch (1.0.0 -> 1.0.1)
node scripts/version.js bump patch
npm run version:bump:patch

# Minor (1.0.0 -> 1.1.0)
node scripts/version.js bump minor
npm run version:bump:minor

# Major (1.0.0 -> 2.0.0)
node scripts/version.js bump major
npm run version:bump:major
```

### Definir Versão Específica

```bash
node scripts/version.js set 1.2.3
npm run version:set 1.2.3
```

## 🔧 Como Funciona

### Processo de Versionamento

1. **Leitura**: Lê a versão atual do arquivo `VERSION`
2. **Cálculo**: Calcula a nova versão baseada no tipo (patch/minor/major)
3. **Atualização**: Atualiza os arquivos:
   - `VERSION` com a nova versão
   - `CHANGELOG.md` com nova entrada
   - `package.json` (se existir)
4. **Feedback**: Exibe mensagens de confirmação

### Estrutura de Classes

```javascript
class VersionManager {
    getCurrentVersion()     // Lê versão atual
    updateVersion()         // Atualiza versão
    updateChangelog()       // Atualiza changelog
    updatePackageJson()     // Atualiza package.json
    bumpVersion()           // Incrementa versão
}
```

## 📝 Convenções

### Commits

Use prefixos para commits relacionados a versionamento:

- `feat:` para novas funcionalidades (minor)
- `fix:` para correções (patch)
- `BREAKING CHANGE:` para mudanças incompatíveis (major)

### Changelog

- **Adicionado**: Novas funcionalidades
- **Alterado**: Mudanças em funcionalidades existentes
- **Depreciado**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades

## 🎯 Fluxo de Trabalho

### Para Novas Funcionalidades

1. Desenvolver a funcionalidade
2. Testar localmente
3. Fazer commit com `feat:`
4. Executar `npm run version:bump:minor`
5. Fazer commit das mudanças de versão
6. Fazer push

### Para Correções

1. Corrigir o bug
2. Testar a correção
3. Fazer commit com `fix:`
4. Executar `npm run version:bump:patch`
5. Fazer commit das mudanças de versão
6. Fazer push

### Para Mudanças Incompatíveis

1. Implementar as mudanças
2. Atualizar documentação
3. Fazer commit com `BREAKING CHANGE:`
4. Executar `npm run version:bump:major`
5. Fazer commit das mudanças de versão
6. Fazer push

## 🔍 Verificação

Para verificar se tudo está funcionando:

```bash
# Ver versão atual
node scripts/version.js current

# Testar incremento
node scripts/version.js bump patch

# Verificar arquivos atualizados
cat VERSION
head -20 CHANGELOG.md
```

## 📚 Recursos Adicionais

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Nota**: Este sistema garante consistência e rastreabilidade de todas as mudanças no projeto.
