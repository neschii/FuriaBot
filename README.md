
# 🐺 FURIA Fan Chatbot 🤖  
**Landing page interativa + Chatbot inteligente para fãs da FURIA Esports**

![furiagg_wallpaper_raian-860x507-1](https://github.com/user-attachments/assets/5b063b98-ca58-40be-9097-49473e17a1be)

---

## 📋 Sobre o Projeto  
Este projeto é uma **landing page interativa** com um **chatbot exclusivo** para os fãs da **FURIA Esports**! Desenvolvido para aproximar os torcedores de sua equipe favorita, o bot permite acompanhar **partidas ao vivo**, **resultados**, **próximos campeonatos**, verificar **quais streamers estão online** e muito mais!

---

## ✨ Funcionalidades Principais

- 🏠 **Landing Page Moderna** — Interface elegante e responsiva com a identidade da FURIA  
- 💬 **Chatbot Interativo** — UI amigável com botões e mensagens dinâmicas  
- 🎮 **Status de Livestreams** — Veja quais jogadores da FURIA estão ao vivo na Twitch  
- 🏆 **Acompanhamento de Partidas** — Partidas ao vivo, últimos resultados e próximos jogos  
- 🧠 **Quiz da FURIA** — Teste seus conhecimentos sobre a organização  
- 🆘 **Tira-Dúvidas** — Pergunte qualquer coisa sobre a FURIA e receba respostas inteligentes  
- 🛒 **Loja** — Acesso direto à loja oficial da FURIA  

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React.js** — Framework para construção da interface  
- **CSS** — Estilização moderna e responsiva  
- **Lucide React** — Biblioteca de ícones  

### Backend
- **Node.js** — Ambiente de execução  
- **Express** — Criação da API  
- **Axios** — Requisições HTTP  
- **UUID** — Geração de IDs únicos  
- **dotenv** — Variáveis de ambiente  

### APIs Externas
- **OpenRouter API** — Respostas inteligentes no tira-dúvidas  
- **Twitch API** — Verifica o status das streams da FURIA  
- **PandaScore API** — Informações de partidas e torneios  

---

## 📁 Estrutura do Projeto

### Backend

```
backend/
├── .env.example              # Exemplo de variáveis de ambiente
├── package.json              # Dependências e scripts
└── src/
    ├── data/
    │   ├── duvidas.json      # Dados básicos sobre a FURIA
    │   └── quizz.json        # Perguntas do quiz
    ├── services/
    │   └── chatbotService.js # Lógica do chatbot
    ├── utils/
    │   ├── openrouterApi.js  # Integração com IA
    │   ├── pandaScoreApi.js  # Dados de partidas
    │   └── twitchApi.js      # Status dos streamers
    ├── stateManager.js       # Gerenciamento de sessões
    └── index.js              # Ponto de entrada
```

### Frontend

```
frontend/
├── package.json              # Dependências e scripts
├── public/
│   └── index.html            # Template base
└── src/
    ├── components/
    │   ├── ChatBot/
    │   │   ├── ChatWindow.js # Componente principal
    │   │   ├── Message.js    # Renderiza mensagens
    │   │   └── InputArea.js  # Campo de entrada
    │   └── landing/
    │       └── Landing.js    # Header e seção hero
    ├── App.js                # Componente raiz
    └── index.js              # Entrada do React
```

---

## 🧩 Design Patterns Utilizados

- **State Manager Pattern** — Controle de sessões via `stateManager.js`  
- **Factory Pattern** — Criação de mensagens no `chatbotService.js`  
- **Observer Pattern** — Atualização dinâmica do chat  
- **Adapter Pattern** — Integrações com APIs externas  
- **Chain of Responsibility** — Fluxo das mensagens do chat  
- **Composite Pattern** — Organização de mensagens e opções  

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v14 ou superior)
- NPM ou Yarn
- Chaves das APIs: **Twitch**, **OpenRouter** e **PandaScore**

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/furia-chatbot.git
cd furia-chatbot

# Instale as dependências do backend
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves

# Instale as dependências do frontend
cd ../frontend
npm install
```

### Iniciando o projeto

```bash
# Em um terminal, inicie o backend
cd backend
npm start

# Em outro terminal, inicie o frontend
cd frontend
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔍 Detalhes da Implementação

### Backend
- **Gerenciamento de Sessões** — Cada usuário tem um ID e contexto únicos  
- **Máquina de Estados** — Controle do fluxo da conversa  
- **Integração com APIs** — Comunicação com Twitch, PandaScore e OpenRouter  
- **Tratamento de Erros** — Garantia de estabilidade do bot  

### Frontend
- **Design Responsivo** — Compatível com dispositivos móveis  
- **Atualizações em Tempo Real** — Mensagens dinâmicas e instantâneas  
- **Animações Suaves** — Transições e UX aprimorado  
- **Conteúdo Dinâmico** — Dados alimentados via APIs externas  

---

## 📜 Licença

Este projeto está licenciado sob a **Licença MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## ⭐ Desenvolvido com orgulho para a comunidade FURIA! ⭐  
**#VamosFURIA #OusadiaEAlegria 🖤🤍**
