// backend/src/services/chatbotService.js
const { getSession, updateSession, resetSession } = require('../stateManager');
const { checkStreamStatus } = require('../utils/twitchApi');
const { getAIResponse } = require('../utils/openrouterApi');
// Only import getFuriaMatches and getLiveMatches
const { getFuriaMatches, getLiveMatches} = require('../utils/pandaScoreApi');

const duvidas = require('../data/duvidas.json');
const quizzData = require('../data/quizz.json');

const ABOUT_TEXT = "Somos FURIA. Uma organização de esports que nasceu do desejo de representar o Brasil no CS e conquistou muito mais que isso: expandimos nossas ligas, disputamos os principais títulos, adotamos novos objetivos e ganhamos um propósito maior. Somos muito mais que o sucesso competitivo.";
const ABOUT_IMAGE_URL = "https://cdn.dribbble.com/userupload/11627402/file/original-519eba43b5e06c4036ad54fe2b6e496f.png";
const LOJA_URL = "https://www.furiastore.com.br/";

const MAIN_MENU_OPTIONS = [
  { text: "Sobre a Fúria 🐺", value: "sobre_furia" },
  { text: "Jogos e Campeonatos 🏆", value: "games" },
  { text: "Livestreams 🎮", value: "livestreams" },
  { text: "Tira Dúvidas 🆘", value: "tira_duvidas" },
  { text: "Quiz da Fúria 🧠", value: "quiz" },
  { text: "Loja da Fúria 🛒", value: "loja" }
];

const RETURN_BUTTON = { text: "Retornar ao Menu Principal", value: "main_menu" };
const GAMES_MENU_RETURN_BUTTON = { text: "Voltar para Menu de Jogos", value: "games" };

function getQuizQuestionMessage(index) {
  const question = quizzData[index];
  return {
    type: 'bot',
    text: question.pergunta,
    options: question.opcoes.map(option => ({
      text: option.texto,
      value: option.texto
    }))
  };
}

function addReturnButtons(sessionId, messages) {
  messages.push({
    type: 'bot',
    options: [RETURN_BUTTON]
  });
  return messages;
}

function addGamesReturnButtons(sessionId, messages) {
  messages.push({
    type: 'bot',
    options: [GAMES_MENU_RETURN_BUTTON, RETURN_BUTTON]
  });
  return messages;
}

function getMainMenuMessages() {
  return [{ type: 'bot', text: "Olá! Sou o bot da Fúria. Como posso te ajudar a sentir a ousadia e alegria hoje?", options: MAIN_MENU_OPTIONS }];
}

function getSobreFuriaMessages() {
  return [
    { type: 'bot', text: ABOUT_TEXT },
    { type: 'bot', text: "A pantera estampada no peito estampa também nosso futuro de glória.", imageUrl: ABOUT_IMAGE_URL }
  ];
}

function getLojaMessages() {
  return [{ type: 'bot', text: "🛒 Acesse a Loja da Fúria e vista o manto! Clique abaixo:", options: [{ text: "Loja Fúria", value: "loja_url", url: LOJA_URL }] }];
}

function getGamesMenuMessages() {
  const gamesOptions = [
    { text: "Partidas Ao Vivo (CS:GO)", value: "live_matches" }, // Added CS:GO
    { text: "Próximos jogos (CS:GO)", value: "upcoming_matches" }, // Added CS:GO
    { text: "Resultados Recentes (CS:GO)", value: "past_matches" }, // Added CS:GO
  ];

  return [{
    type: 'bot',
    text: "🎮 Acompanhe os jogos e campeonatos de CS:GO da FURIA!", // Added CS:GO
    options: [...gamesOptions, RETURN_BUTTON]
  }];
}

async function handleStreams(sessionId) {
  const messages = [{ type: 'bot', text: "🎮 Verificando o status das livestreams dos nossos jogadores... 👀" }];
  try {
    const streams = await checkStreamStatus();
    if (!streams || streams.length === 0) {
      messages.push({ type: 'bot', text: "🔴 Nenhum streamer da Fúria está online no momento." });
    } else {
        const onlineStreamers = streams.filter(s => s.isOnline);
        const offlineStreamers = streams.filter(s => !s.isOnline);

        if (onlineStreamers.length > 0) {
          messages.push({ type: 'bot', text: "🟢 Streamers ONLINE:" });
          onlineStreamers.forEach(s => messages.push({
            type: 'bot',
            text: `👤 ${s.login} (${s.game_name || 'Jogo Desconhecido'} - ${s.viewer_count} espectadores)\n📺 Título: ${s.title || 'Sem Título'}`,
            options: [{ text: `▶️ Assistir ${s.login}`, value: `watch_${s.login}` }]
          }));
        }

        if (offlineStreamers.length > 0) {
             messages.push({
                 type: 'bot',
                 text: "🔴 Streamers OFFLINE:\n" + offlineStreamers.map(s => `👤 ${s.login}`).join('\n')
             });
        }
    }

    updateSession(sessionId, 'awaiting_return');

  } catch (err) {
    console.error('[Chatbot Service] Error fetching streams:', err);
    messages.push({ type: 'bot', text: "❌ Ocorreu um erro ao buscar informações das streams. Tente novamente mais tarde." });
    updateSession(sessionId, 'awaiting_return');
  }

  addReturnButtons(sessionId, messages);
  return messages;
}

async function handleLiveMatches(sessionId) {
  const messages = [{ type: 'bot', text: "🔴 Buscando partidas de CS:GO da FURIA ao vivo... Aguarde um momento." }]; // Added CS:GO

  try {
    // getLiveMatches now only returns CS:GO
    const liveMatches = await getLiveMatches();
    // Check if the csgo key exists and has matches
    const hasCsgoMatches = liveMatches?.csgo && liveMatches.csgo.length > 0;

    if (hasCsgoMatches) {
      messages.push({ type: 'bot', text: "🔴 CS:GO - PARTIDAS AO VIVO:" });
      liveMatches.csgo.forEach(match => {
        const matchMessage = {
          type: 'bot',
          text: `🏆 ${match.tournament.name}\n⚔️ FURIA vs ${match.teams.opponent.name}\n🔢 Placar: ${match.score.furia} - ${match.score.opponent}`,
          options: []
        };

        if (match.stream_url) {
          matchMessage.options.push({
            text: "▶️ Assistir Partida",
            value: `watch_match_${match.id}`,
            url: match.stream_url
          });
        }

        messages.push(matchMessage);
      });
    } else {
       // Added a message if no live CS:GO matches are found
       messages.push({ type: 'bot', text: "🔴 Nenhuma partida de CS:GO da FURIA está ao vivo no momento." });
    }

    updateSession(sessionId, 'awaiting_games_return');

  } catch (error) {
    console.error('[Chatbot Service] Error fetching live matches:', error.response?.data || error.message);
    messages.push({ type: 'bot', text: "❌ Ocorreu um erro ao buscar partidas ao vivo. Tente novamente mais tarde." });
    updateSession(sessionId, 'awaiting_games_return');
  }

  addGamesReturnButtons(sessionId, messages);
  return messages;
}

async function handleUpcomingMatches(sessionId) {
  const messages = [{ type: 'bot', text: "📅 Buscando próximas partidas de CS:GO da FURIA... Aguarde um momento." }]; // Added CS:GO

  try {
    // getFuriaMatches now only returns CS:GO upcoming and past
    const matches = await getFuriaMatches();
    const hasCsgoMatches = matches.upcoming?.csgo && matches.upcoming.csgo.length > 0; // Added optional chaining

    if (!hasCsgoMatches) { // Removed the valorant check
      messages.push({ type: 'bot', text: "😢 Não há próximas partidas de CS:GO da FURIA agendadas." }); // Added CS:GO
    } else {
      // Simplified the inner if block as we only check for CS:GO now
       messages.push({ type: 'bot', text: "📅 CS:GO - PRÓXIMAS PARTIDAS:" });
       matches.upcoming.csgo.forEach(match => {
         messages.push({
           type: 'bot',
           text: `🏆 ${match.tournament.name}\n⚔️ FURIA vs ${match.teams.opponent.name}\nData: ${match.date}\n` // Added Date
         });
       });
    }

    updateSession(sessionId, 'awaiting_games_return');

  } catch (error) {
    console.error('[Chatbot Service] Error fetching upcoming matches:', error.response?.data || error.message);
    messages.push({ type: 'bot', text: "❌ Ocorreu um erro ao buscar próximas partidas. Tente novamente mais tarde." });
    updateSession(sessionId, 'awaiting_games_return');
  }

  addGamesReturnButtons(sessionId, messages);
  return messages;
}

async function handlePastMatches(sessionId) {
  // Changed message to reflect CS:GO specifically
  const messages = [{ type: 'bot', text: "⚔️ Buscando resultados recentes de CS:GO da FURIA... Aguarde um momento." }];

  try {
    // getFuriaMatches now only returns CS:GO upcoming and past
    const matches = await getFuriaMatches();
    const hasCsgoMatches = matches.past?.csgo && matches.past.csgo.length > 0; // Added optional chaining
    // Removed check for hasValorantMatches

    if (!hasCsgoMatches) { // Condition simplified
      messages.push({ type: 'bot', text: "😢 Não foram encontradas partidas recentes de CS:GO da FURIA." }); // Added CS:GO
    } else {
      // Simplified the inner if block as we only check for CS:GO now
       messages.push({ type: 'bot', text: "⚔️ CS:GO - RESULTADOS RECENTES:" });
       matches.past.csgo.forEach(match => {
         // Check if scores are available before forming the result string
         const result = (match.score.furia !== undefined && match.score.opponent !== undefined) ?
                        (match.score.furia > match.score.opponent ? "✅ VITÓRIA" :
                        match.score.furia < match.score.opponent ? "❌ DERROTA" : "⏸️ EMPATE") :
                        ""; // Keep empty string if scores are not available

         messages.push({
           type: 'bot',
           // Included game name for clarity, although it will always be CS:GO now
           // ADDED match.date HERE as requested
           text: `🎮 ${match.game}\n🏆 ${match.tournament.name}\n⚔️ FURIA ${match.score.furia ?? '0'} x ${match.score.opponent ?? '0'} ${match.teams.opponent.name}${result ? `\n${result}` : ''}\nData: ${match.date}` // Used ?? '0' for score display default if undefined
         });
       });
     }
    // Removed Valorant handling

    updateSession(sessionId, 'awaiting_games_return');

  } catch (error) {
    console.error('[Chatbot Service] Error fetching past matches:', error.response?.data || error.message);
    messages.push({ type: 'bot', text: "❌ Ocorreu um erro ao buscar resultados recentes. Tente novamente mais tarde." });
    updateSession(sessionId, 'awaiting_games_return');
  }

  addGamesReturnButtons(sessionId, messages);
  return messages;
}


async function handleQA(sessionId, question) {
  const messages = [];
  if (question?.trim()) {
    try {
      messages.push({ type: 'bot', text: "🤖 Buscando resposta para sua dúvida..." });
      const aiResponse = await getAIResponse(duvidas, question);
      messages.push({ type: 'bot', text: aiResponse });
      updateSession(sessionId, 'awaiting_return');
    } catch (error) {
      console.error('[Chatbot Service] Error in Q&A:', error);
      messages.push({ type: 'bot', text: "❌ Erro ao processar sua pergunta. Tente novamente." });
      updateSession(sessionId, 'awaiting_return');
    }
  } else {
    // If no question is provided, perhaps return a prompt or main menu?
    // Keeping the original structure, just adding return buttons
  }
  addReturnButtons(sessionId, messages);
  return messages;
}

async function handleQuiz(sessionId, action, message) {
  const session = getSession(sessionId);
  const messages = [];
  let { currentQuestionIndex = 0, correctAnswers = 0 } = session.data;

  if (action && currentQuestionIndex < quizzData.length) {
    const currentQuestion = quizzData[currentQuestionIndex];
    const correctAnswer = currentQuestion.opcoes.find(opt => opt.isCorreta)?.texto;

    if (action === correctAnswer) {
      correctAnswers++;
      messages.push({ type: 'bot', text: "✅ Acertou! Boa!" });
    } else {
      messages.push({
        type: 'bot',
        text: `❌ Errou... A resposta correta era: ${correctAnswer}`
      });
    }

    currentQuestionIndex++;
    updateSession(sessionId, 'in_quiz', { currentQuestionIndex, correctAnswers });

    if (currentQuestionIndex < quizzData.length) {
      messages.push(getQuizQuestionMessage(currentQuestionIndex));
    } else {
      const totalQuestions = quizzData.length;
      let finalMessage;

      if (correctAnswers === totalQuestions) {
        finalMessage = "🏆 Uau! Gabaritou! Você é um verdadeiro Furioso! 🖤🤍";
      } else if (correctAnswers >= Math.ceil(totalQuestions / 2)) {
        finalMessage = "🔥 Muito bem! Você conhece bastante sobre a Fúria!";
      } else {
        finalMessage = "🤔 Continue acompanhando para aprender mais!";
      }

      messages.push(
        { type: 'bot', text: `🎉 Quiz finalizado! Acertos: ${correctAnswers}/${totalQuestions}` },
        { type: 'bot', text: finalMessage }
      );

      resetSession(sessionId);
      messages.push(...getMainMenuMessages());
    }
  }
  else if (!action && message && message.trim() !== "") {
       messages.push({ type: 'bot', text: "Por favor, responda usando os botões da pergunta atual." });
       messages.push(getQuizQuestionMessage(currentQuestionIndex));
   }
   else if (action && currentQuestionIndex >= quizzData.length) {
      messages.push({ type: 'bot', text: "O quiz já foi finalizado. Por favor, escolha uma opção do menu principal." });
      resetSession(sessionId);
      messages.push(...getMainMenuMessages());
   }

  return messages;
}

async function handleMessage(sessionId, message, action) {

  const session = getSession(sessionId);
  let messages = [];

  if (action === "main_menu") {
    resetSession(sessionId);
    return { messages: getMainMenuMessages() };
  }

  switch (session.state) {
    case 'main_menu':
      if (action === "sobre_furia") {
        messages = getSobreFuriaMessages();
        updateSession(sessionId, 'awaiting_return');
        addReturnButtons(sessionId, messages);
      }
      else if (action === "loja") {
        messages = getLojaMessages();
        updateSession(sessionId, 'awaiting_return');
        addReturnButtons(sessionId, messages);
      }
      else if (action === "games") {
        messages = getGamesMenuMessages();
        updateSession(sessionId, 'games_menu');
      }
      else if (action === "livestreams") {
        messages = await handleStreams(sessionId);
      }
      else if (action === "tira_duvidas") {
        messages = [{
          type: 'bot',
          text: "Em que posso ajudar? Digite sua dúvida sobre a Fúria 🐺"
        }];
        updateSession(sessionId, 'waiting_for_qa_question');
      }
      else if (action === "quiz") {
        updateSession(sessionId, 'in_quiz', { currentQuestionIndex: 0, correctAnswers: 0 });
        messages = [
          { type: 'bot', text: "🧠 Quiz da Fúria! Vamos testar seus conhecimentos sobre a organização." },
          { type: 'bot', text: "Responda às perguntas selecionando a opção que achar correta." },
          getQuizQuestionMessage(0)
        ];
      }
      else if (message && message.trim()) {
         // If a message is received in the main_menu state, treat it as a QA question
        messages = await handleQA(sessionId, message);
      }
      else {
        messages = getMainMenuMessages();
      }
      break;

    case 'games_menu':
      if (action === "live_matches") {
        messages = await handleLiveMatches(sessionId);
      }
      else if (action === "upcoming_matches") {
        messages = await handleUpcomingMatches(sessionId);
      }
      else if (action === "past_matches") {
        messages = await handlePastMatches(sessionId);
      }
      // Removed 'tournaments' action handling as it was not defined and likely not needed for this scope
      else if (message && message.trim()) {
         // If a message is received in the games_menu state, treat it as a QA question
        messages = await handleQA(sessionId, message);
      }
      else {
        messages = getGamesMenuMessages();
      }
      break;

    case 'waiting_for_qa_question':
      if (message && message.trim()) {
        messages = await handleQA(sessionId, message);
      } else {
        messages = [{
          type: 'bot',
          text: "Por favor, digite sua dúvida ou pergunta sobre a Fúria."
        }];
        addReturnButtons(sessionId, messages);
      }
      break;

    case 'in_quiz':
      messages = await handleQuiz(sessionId, action, message);
      break;

    case 'awaiting_return':
    case 'awaiting_games_return':
      if (action === "games" && session.state === 'awaiting_games_return') {
        messages = getGamesMenuMessages();
        updateSession(sessionId, 'games_menu');
      }
      else if (message && message.trim()) {
         // If a message is received in await states, treat it as a QA question
        messages = await handleQA(sessionId, message);
      }
      else {
        // If no action or message, prompt the user to use buttons
        messages = [{
          type: 'bot',
          text: "Por favor, utilize os botões acima para continuar."
        }];

        if (session.state === 'awaiting_games_return') {
          addGamesReturnButtons(sessionId, messages);
        } else {
          addReturnButtons(sessionId, messages);
        }
      }
      break;

    default:
      // Default case if state is unexpected, return to main menu
      messages = getMainMenuMessages();
  }

  return { messages };
}

module.exports = {
  handleMessage,
  getMainMenuMessages,
  getSobreFuriaMessages,
  getGamesMenuMessages,
  getLojaMessages
};