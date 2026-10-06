# Backlog — Persona: Roguelike

> Documento de organização de tarefas e features do projeto.
> Siga a arquitetura em `arquitetura.md` para entender as etapas de desenvolvimento.

---

## Legenda

| Símbolo | Significado |
|---------|------------|
| 🔲 | Não iniciado |
| 🔄 | Em progresso |
| ✅ | Concluído |
| 🚧 | Bloqueado / aguardando dependência |
| ⭐ | Prioridade alta |

---

## Etapa 1 — Front-end e Design

> Apenas HTML e CSS com auxílio do React. Sem lógica, sem API, sem banco de dados.

### 🖥️ Tela de Início (`/`)

- ✅ Estrutura base da página criada (`Inicio.jsx` + `Inicio.css`)
- ✅ Redesign completo da tela de início
  - Identidade visual da franquia Persona (azul escuro, vermelho, preto)
  - Logo/título estilizado do jogo
  - Cards de seleção de caminho (Mortality, Truth, Rebellion)
  - Animações de hover nos cards de caminho
  - Estado de card selecionado com checkmark e glow
  - Botão "Iniciar Jornada" com estado desativado até seleção
  - Navegação para `/hub` passando o caminho escolhido

### 🗺️ Cards de Caminhos

- 🔲 Card: **Mortality** (baseado no Tartarus — P3)
  - Visual: torre sombria, tons azul-escuro e roxo
- 🔲 Card: **Truth** (baseado no Midnight Channel — P4)
  - Visual: névoa amarela, distorção de TV
- 🔲 Card: **Rebellion** (baseado no Mementos — P5)
  - Visual: metrô vermelho e preto, celas

### 🃏 Tela de Seleção Inicial

> Exibida logo antes de começar a primeira exploração.

- ✅ Sistema de sorteio de 3 Personas iniciais equilibradas para escolha do jogador.
- ✅ Sistema de sorteio de 3 companheiros de equipe para formar a party inicial.
- ✅ Botão para confirmar escolha e prosseguir.

### 🏠 Tela Hub (Menu Principal In-Game)

> Tela exibida ao início de cada caminho e após cada boss derrotado.

- ✅ Botão: **Iniciar Exploração** (navega para `/dungeon`)
- ✅ Botão: **Gerenciar Equipe** (navega para `/equipe`)
- ✅ Botão: **Gerenciar Inventário** (navega para `/inventario`)
- ✅ Botão: **Velvet Room** (navega para `/velvet-room`)
- ✅ Botão: **Salvar Progresso**
- ✅ Painel lateral com equipe (mock) e barras de HP/SP
- ✅ Painel direito com moedas (Yen, C. Stamps, Meta Jewels)
- ✅ Indicador de segmento atual e progresso (pontos)
- ✅ Badge do caminho escolhido com cor temática
- ✅ Dica aleatória no painel direito

### 🏚️ Tela de Exploração de Dungeon

- ✅ Layout de mapa com **três caminhos** (esquerda, centro, direita) convergindo em um boss
- ✅ Representação visual dos nós/eventos do caminho (interativos)
- ✅ Indicador de evento atual (ícone de baú, espada, civil, etc.) com tooltip
- ✅ Aviso de "sem retorno" visual e constante
- ✅ Sistema de progressão básico impedindo cliques em andares futuros

### ⚔️ Tela de Combate

- ✅ Layout de batalha (personagens à esquerda, inimigos à direita)
- ✅ Indicador de HP/SP dos aliados
- ✅ Indicador de HP dos inimigos (Shadows)
- ✅ Menu de ações: Ataque, Skill, Item, Trocar Persona, Fugir
- ✅ Display de resultados: log animado na tela
- ✅ Sistema de turnos visual (indicador de quem age)
- ✅ Animações de ataque (simples flash visual) e tela de ALL OUT ATTACK de vitória

### 👥 Tela de Gerenciamento de Equipe

- ✅ Lista dos membros da equipe
- ✅ Cards com: nome, nível, HP/SP, Persona equipada
- ✅ Painel de detalhes de cada membro
- ✅ Slot de Sub-Persona
- ✅ Visualização de equipamentos (arma, armadura)

### 🎒 Tela de Inventário

- ✅ Grade de itens obtidos na dungeon
- ✅ Categorias: Armas, Armaduras, Consumíveis, Skill Cards
- ✅ Botão de vender/usar item (com valor em Yen)
- ✅ Indicador de quantidade de cada item

### 🔮 Velvet Room

- ✅ Tela com visual azul/Velvet Room da franquia
- ✅ Opção: **Fundir Personas**
  - Seleção de dois ou mais Personas para fusão
  - Preview do resultado da fusão
- ✅ Opção: **Registrar Persona** (salvar na lista)
- ✅ Opção: **Comprar Persona** registrada
- ✅ Indicador de Personas disponíveis nos slots (máximo 8)
- ✅ Regra visual: bloqueio de Personas acima do nível do jogador

### 🛒 Lojas

- ✅ Tela da loja do **Tanaka** (itens com Yen)
- ✅ Tela da loja do **Jose** (Cognition Stamps)
- ✅ Tela da loja da **Marthym** (Meta Jewels → Personas)
- ✅ Layout visual fiel à personalidade de cada lojista (Cores e elementos próprios via componente unificado)

### 💰 Sistema de Moedas (Visual)

- 🔲 Indicador de **Yen** no HUD
- 🔲 Indicador de **Cognition Stamps** no HUD
- 🔲 Indicador de **Meta Jewels** no HUD

---

## Etapa 2 — Busca na API

> Conexão com Supabase e com o pacote `megaten` (npm). Exibição de dados reais.

### 🔌 Integração com `megaten` (npm package)

> O pacote `megaten` já está instalado (`package.json`). Ele fornece dados de Personas, Demons e Skills dos jogos P3, P4, P5.
> Uso: `import { Persona, Skill } from 'megaten'`

- ✅ ⭐ Criar serviço/utilitário `src/services/megatenService.js` (dados extraídos via script local para JSON, contornando limitações do Vite/CommonJS)
  - ✅ Função `getAllPersonas()` → retorna a lista completa
  - ✅ Função `getPersonaByName(name)` → busca exata ou aproximada
  - ✅ Função `getPersonasByArcana(arcana)` → filtra por arcana
  - ✅ Função `getPersonasByLevel(maxLevel)` → filtra Personas com level menor ou igual ao do jogador
  - ✅ Função `getAllSkills()` → retorna skills do pacote
- ✅ Velvet Room: buscar lista real de Personas da API
- 🔲 Velvet Room: calcular resultado de fusão baseado nas Arcanas
- ✅ Tela de Equipe/Persona: exibir stats reais (St, Vi, Ma, Ag, Lu)
- ✅ Seleção Inicial: obter 3 Personas reais aleatórias de nível baixo
- 🔲 Tela de Persona: exibir fraquezas e resistências reais
- 🔲 Tela de Persona: exibir learnset real (skills por nível)

### 🗄️ Integração com Supabase

- 🔲 Configurar cliente Supabase (`src/services/supabaseClient.js`)
- 🔲 Autenticação: login/cadastro do jogador
- 🔲 Buscar progresso salvo do jogador
- 🔲 Buscar Personas registradas na Velvet Room do jogador
- 🔲 Buscar inventário do jogador
- 🔲 Buscar membros da equipe do jogador

---

## Etapa 3 — Inserção e Relação de Dados

> Inputs, validações e chaves estrangeiras no Supabase.

### 💾 Salvar Progresso

- 🔲 Salvar estado atual da dungeon (segmento, caminho)
- 🔲 Salvar equipe e seus status
- 🔲 Salvar inventário
- 🔲 Salvar Personas registradas na Velvet Room
- 🔲 Salvar moedas do jogador (Yen, Stamps, Jewels)

### ⚔️ Lógica de Combate (dados)

- 🔲 Cálculo de dano baseado em stats e tipo de skill
- 🔲 Sistema de fraquezas e resistências (via `megaten`)
- 🔲 Sistema de status (envenenado, adormecido, etc.)
- 🔲 Sistema de contrato com Shadow após vitória (chance aleatória)
- 🔲 Regra: Persona adquirida ocupa slot (máximo 8 slots)

### 🔮 Fusão de Personas (lógica)

- 🔲 Algoritmo de fusão baseado nas Arcanas
- 🔲 Validação: não pode fundir Persona acima do nível do jogador
- 🔲 Registrar Persona resultante no Supabase

### 🗺️ Geração de Dungeon

- 🔲 Geração aleatória dos eventos nos caminhos
- 🔲 Tipos de evento: baú, batalha, civil, shadow rara, seleção de Persona, loja
- 🔲 Escalada de dificuldade por segmento

---

## Etapa 4 — Testes e Validação

- 🔲 Testes de fluxo completo (início → boss → hub → exploração)
- 🔲 Testes de fusão de Personas
- 🔲 Testes de combate
- 🔲 Ajustes de balanceamento
- 🔲 Build de produção
- 🔲 Publicação

---

## 📌 Observações e Decisões Técnicas

### Sobre o pacote `megaten`
- Instalado via npm como dependência do projeto (`package.json`)
- Fornece: `Persona`, `Demon`, `Skill` e subclasses de skills
- `Persona.map` → `Map` com 83 Personas de P3/P4/P5
- `Persona.get('nome')` → busca case-insensitive, ignora pontuação
- Dados disponíveis por Persona: `name`, `arcana`, `level`, `stats`, `learnset`, `resistances`, `game`, `lore`, `user`
- **Atenção**: o pacote é CommonJS. Para usar no Vite/React (ESM), pode ser necessário criar um arquivo JSON local pré-processado (`src/data/personas.json`) para evitar problemas de compatibilidade.

### Sobre o Supabase
- RLS desligado em todas as tabelas (por enquanto)
- Tabelas planejadas: `jogadores`, `progresso`, `equipe`, `inventario`, `personas_registradas`

### Estrutura de pastas atual
```
src/
  pages/
    Inicio.jsx + Inicio.css   -- tela inicial (redesign em andamento)
    teste.jsx                  -- página de testes
  components/
    github.jsx                 -- componente existente
  App.jsx                      -- rotas: / e /teste
  index.css                    -- estilos globais (background #070A14, color #E3EAFF)
  main.jsx
```

### Rotas planejadas
| Rota | Página | Status |
|------|--------|--------|
| `/` | Início (seleção de caminho) | ✅ base criada |
| `/hub` | Menu principal in-game | 🔲 |
| `/dungeon` | Exploração | 🔲 |
| `/combate` | Batalha | 🔲 |
| `/equipe` | Gerenciamento de equipe | 🔲 |
| `/inventario` | Inventário | 🔲 |
| `/velvet-room` | Velvet Room | 🔲 |
| `/loja/:lojista` | Loja (tanaka, jose, marthym) | 🔲 |
