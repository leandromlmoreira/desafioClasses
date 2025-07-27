# Changelog

## [1.0.1] - 2025-07-27

### Adicionado

- Sistema de formatação de código com Prettier
- ASCII art no log do versionador
- Scripts npm para formatação (`format`, `format:check`, `format:watch`)
- Configuração do Prettier (`.prettierrc` e `.prettierignore`)
- **Auto-formatação completa**:
  - Format on Save no VS Code
  - Pre-commit hooks automáticos
  - EditorConfig para consistência
  - Configurações do VS Code (settings, extensions, tasks, launch)
  - Cursor Rules para IA
  - Script de pre-commit personalizado
- **Reorganização profissional**:
  - Estrutura de pastas seguindo padrões universais
  - Separação clara entre código, configurações e ferramentas
  - Organização hierárquica de recursos

### Alterado

- Reorganização completa da estrutura de pastas seguindo boas práticas
- Atualização de todos os caminhos de arquivos para nova estrutura
- Melhoria na documentação com novas seções sobre formatação
- Atualização do sistema de versionamento com ASCII art
- Configuração completa de desenvolvimento automatizado
- **Nova estrutura organizacional**:
  - `config/` - Todas as configurações organizadas
  - `tools/` - Ferramentas e scripts utilitários
  - `assets/` - Recursos separados por tipo
  - Links simbólicos para compatibilidade

### Corrigido

- Indentação incorreta em todo o código
- Estrutura de pastas desorganizada
- Caminhos de arquivos inconsistentes
- Falta de automação na formatação
- Organização inadequada de arquivos de configuração

---

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-12-19

### Adicionado

- Sistema completo de combate por turnos
- 4 classes de heróis: Mago, Guerreiro, Monge, Ninja
- Sistema de habilidades únicas para cada herói
- Interface visual moderna com cards interativos
- Sistema de progressão com XP e níveis
- Persistência de dados via localStorage
- Animações e efeitos visuais
- Design responsivo para diferentes telas
- Arena de batalha com log de combate
- Sistema de guarda e defesa
- Recuperação de energia durante combate

### Características Técnicas

- Programação orientada a objetos em JavaScript ES6+
- Classes e herança para diferentes tipos de herói
- CSS avançado com Grid Layout e Flexbox
- Animações CSS com keyframes
- Sistema de temas por classe de herói
- Efeitos visuais com gradientes e glassmorphism

### Arquivos Principais

- `app.js` - Lógica principal do jogo
- `index.html` - Interface do usuário
- `styles.css` - Estilos gerais
- `cards.css` - Estilos específicos dos cards
- `heroes.json` - Dados dos heróis
- `stream/` - Imagens dos heróis

### Deploy

- Plataforma: Vercel
- URL: https://desafio-classes.vercel.app
- Status: Online e funcionando

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Depreciado** para funcionalidades que serão removidas em breve
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para correções de vulnerabilidades
