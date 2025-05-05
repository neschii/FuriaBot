🐺 FURIA Fan Chatbot 🤖
FURIA Banner

📋 Sobre o Projeto
Este projeto é uma landing page interativa com um chatbot exclusivo para os fãs da FURIA Esports! Desenvolvido para aproximar os torcedores de sua equipe favorita, o bot permite acompanhar partidas ao vivo, resultados, próximos campeonatos, verificar quais streamers estão online e muito mais!

✨ Funcionalidades Principais
🏠 Landing Page Moderna - Interface elegante e responsiva que representa a identidade da FURIA
💬 Chatbot Interativo - UI amigável com botões e texto
🎮 Status de Livestreams - Verifique quais jogadores da FURIA estão transmitindo ao vivo na Twitch
🏆 Acompanhamento de Partidas - Veja partidas ao vivo, resultados recentes e próximos jogos
🧠 Quiz da FURIA - Teste seus conhecimentos sobre a organização
🆘 Tira-Dúvidas - Pergunte qualquer coisa sobre a FURIA e receba respostas inteligentes
🛒 Loja - Acesso rápido à loja oficial da FURIA
🛠️ Tecnologias Utilizadas
Frontend
React.js - Framework para criação da interface
CSS - Estilização moderna e responsiva
Lucide React - Biblioteca de ícones
Backend
Node.js - Ambiente de execução
Express - Framework para criação da API
Axios - Cliente HTTP para requisições
UUID - Geração de IDs de sessão
dotenv - Gerenciamento de variáveis de ambiente
APIs Externas
OpenRouter API - Para o tira-dúvidas inteligente
Twitch API - Para verificar o status das streams
PandaScore API - Para buscar informações sobre partidas e torneios
📁 Estrutura do Projeto
Backend
backend/
├── .env.example         # Exemplo de configuração das variáveis de ambiente
├── package.json         # Dependências e scripts do backend
├── src/
│   ├── data/            # Dados estáticos usados pelo chatbot
│   │   ├── duvidas.json # Informações básicas sobre a FURIA
│   │   └── quizz.json   # Perguntas e respostas para o quiz
│   ├── services/
│   │   └── chatbotService.js # Lógica principal do chatbot
│   ├── utils/
│   │   ├── openrouterApi.js  # Integração com IA para tira-dúvidas
│   │   ├── pandaScoreApi.js  # Busca de partidas e torneios
│   │   └── twitchApi.js      # Verificação de streamers online
│   ├── stateManager.js       # Gerenciamento de estados das sessões
│   └── index.js              # Ponto de entrada do servidor
Frontend
frontend/
├── package.json         # Dependências e scripts do frontend
├── public/
│   └── index.html       # Template HTML base
├── src/
│   ├── components/
│   │   ├── ChatBot/     # Componentes do chat
│   │   │   ├── ChatWindow.js  # Container principal do chat
│   │   │   ├── Message.js     # Renderiza mensagens individuais
│   │   │   └── InputArea.js   # Campo de entrada do usuário
│   │   └── landing/     # Componentes da landing page
│   │       └── Landing.js     # Header e seção hero
│   ├── App.js           # Componente raiz
│   └── index.js         # Ponto de entrada do React
🧩 Design Patterns Utilizados
State Manager Pattern - Implementado no stateManager.js para gerenciar o estado da conversa em cada sessão
Factory Pattern - Utilizado no chatbotService.js para criar diferentes tipos de mensagens
Observer Pattern - Implementado na atualização do chat em tempo real
Adapter Pattern - Usado nas camadas de API (Twitch, PandaScore, OpenRouter)
Chain of Responsibility - Implementado no fluxo de mensagens do chat
Composite Pattern - Utilizado na estrutura de mensagens e opções
📊 Fluxograma do Chatbot

🚀 Como Executar o Projeto
Pré-requisitos
Node.js instalado (v14+ recomendado)
NPM ou Yarn instalado
Contas e chaves de API para Twitch, OpenRouter e PandaScore
Configuração
Clone o repositório

git clone https://github.com/seu-usuario/furia-chatbot.git
cd furia-chatbot
Instale as dependências (Backend)

cd backend
npm install
Configure as variáveis de ambiente

cp .env.example .env
# Edite o arquivo .env com suas chaves de API
Instale as dependências (Frontend)

cd ../frontend
npm install
Execução
Inicie o backend

cd backend
npm start
Inicie o frontend (em outro terminal)

cd frontend
npm start
Acesse http://localhost:3000 no seu navegador

🔍 Detalhes da Implementação
Backend
Session Management: Cada conversa tem um ID único e estado próprio
State Machine: O chatbot funciona com uma máquina de estados que controla o fluxo da conversa
API Integration: Integrações robustas com Twitch, PandaScore e OpenRouter
Error Handling: Tratamento de erros completo para garantir resiliência
Frontend
Responsive Design: Interface adaptável para dispositivos móveis e desktop
Real-time Updates: Atualizações em tempo real das mensagens
Animation Effects: Transições e animações suaves para melhor experiência
Dynamic Content: Conteúdo dinâmico baseado nas APIs integradas

📜 Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

⭐ Desenvolvido com orgulho para a comunidade FURIA! ⭐
#VamosFURIA #OusadiaEAlegria 🖤🤍

