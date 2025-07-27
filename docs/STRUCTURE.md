# 📁 Estrutura do Projeto

Este documento descreve a organização de pastas do projeto **Ethereal - Arena dos Heróis** seguindo as boas práticas universais.

## 🏗️ Estrutura Geral

```
desafioClasses/
├── index.html              # Interface principal
├── src/                    # Código fonte
│   ├── css/               # Estilos
│   ├── js/                # JavaScript
│   ├── assets/            # Recursos
│   └── data/              # Dados
├── scripts/               # Scripts utilitários
├── docs/                  # Documentação
├── VERSION                # Controle de versão
├── CHANGELOG.md           # Histórico de mudanças
├── package.json           # Configuração do projeto
├── vercel.json            # Configuração do deploy
├── LICENSE                # Licença
└── README.md              # Documentação principal
```

## 📂 Detalhamento das Pastas

### `/src` - Código Fonte

Contém todo o código fonte do projeto organizado por tipo.

#### `/src/css` - Estilos

- **styles.css**: Estilos gerais da aplicação
- **cards.css**: Estilos específicos dos cards dos heróis

#### `/src/js` - JavaScript

- **app.js**: Lógica principal do jogo com classes e funcionalidades

#### `/src/assets` - Recursos

- **/images**: Imagens do projeto
  - **kael.png**: Imagem do herói Kael
  - **ragnar.png**: Imagem do herói Ragnar
  - **tenzin.png**: Imagem do herói Tenzin
  - **akari.png**: Imagem do herói Akari
  - **preview.png**: Imagem de preview do projeto
  - **favicon.png**: Ícone do site

#### `/src/data` - Dados

- **heroes.json**: Dados dos heróis (stats, habilidades, etc.)

### `/scripts` - Scripts Utilitários

- **version.js**: Script para automatizar o versionamento

### `/docs` - Documentação

- **VERSIONING.md**: Documentação do sistema de versionamento
- **STRUCTURE.md**: Este arquivo

## 🎨 Formatação de Código

### Prettier

- **.prettierrc**: Configuração do Prettier
- **.prettierignore**: Arquivos ignorados pelo Prettier
- **Scripts npm**: `format` e `format:check`

## 🎯 Benefícios da Organização

### Separação de Responsabilidades

- **Código**: Separado por tipo (CSS, JS, dados)
- **Recursos**: Imagens organizadas em pasta específica
- **Scripts**: Utilitários separados do código principal
- **Documentação**: Centralizada em pasta própria

### Manutenibilidade

- Fácil localização de arquivos
- Estrutura escalável
- Padrão universal seguido

### Deploy

- Estrutura compatível com plataformas de deploy
- Configurações separadas do código
- Assets organizados para CDN

## 🔧 Configurações

### Arquivos de Configuração

- **package.json**: Dependências e scripts npm
- **vercel.json**: Configuração do deploy no Vercel
- **.prettierrc**: Configuração do Prettier
- **.prettierignore**: Arquivos ignorados pelo Prettier
- **.gitignore**: Arquivos ignorados pelo Git
- **.gitattributes**: Configurações do Git

### Controle de Versão

- **VERSION**: Versão atual do projeto
- **CHANGELOG.md**: Histórico de mudanças
- **LICENSE**: Licença MIT

## 🚀 Fluxo de Desenvolvimento

### Adicionando Novos Arquivos

1. **CSS**: Adicionar em `/src/css/`
2. **JavaScript**: Adicionar em `/src/js/`
3. **Imagens**: Adicionar em `/src/assets/images/`
4. **Dados**: Adicionar em `/src/data/`
5. **Scripts**: Adicionar em `/scripts/`
6. **Documentação**: Adicionar em `/docs/`

### Atualizando Referências

- Sempre usar caminhos relativos
- Atualizar `index.html` para novos arquivos
- Atualizar documentação quando necessário

## 📋 Convenções

### Nomenclatura

- **Arquivos**: kebab-case (ex: `heroes.json`)
- **Pastas**: lowercase (ex: `src/`, `css/`)
- **Classes CSS**: kebab-case (ex: `hero-card`)
- **Funções JS**: camelCase (ex: `loadHeroesData`)

### Organização

- Um arquivo por funcionalidade
- Agrupamento lógico em pastas
- Documentação sempre atualizada

---

**Nota**: Esta estrutura segue as melhores práticas para projetos web modernos e facilita a manutenção e escalabilidade do projeto.
