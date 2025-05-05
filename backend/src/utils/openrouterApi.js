const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek-chimera';

async function getAIResponse(systemPrompts, userQuestion) {
  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY não configurada. A funcionalidade Tira Dúvidas não funcionará.");
    return "Desculpe, a funcionalidade de tirar dúvidas não está disponível no momento.";
  }

  const messages = [
    { role: "system", content: "Você é um chatbot amigável e útil sobre a organização de esports brasileira FURIA. Sua principal função é responder perguntas sobre a FURIA com base nas informações que você possui." },
    ...systemPrompts.map(prompt => ({ role: "system", content: prompt })), // Adiciona as informações de duvidas.json como system prompts
    { role: "user", content: userQuestion }
  ];

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FURIA Chatbot'
        }
      }
    );

    // Adiciona verificação antes de acessar response.data.choices[0]
    if (response && response.data && Array.isArray(response.data.choices) && response.data.choices.length > 0 && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      // Log response data if the expected structure is not found
      console.error('DEBUG: Estrutura de resposta inesperada da OpenRouter API:', response.data);
      return "Desculpe, recebi uma resposta inesperada do serviço de IA. Tente novamente mais tarde.";
    }

  } catch (error) {
    // Melhoria no log de erro para identificar o problema com mais detalhes
    console.error('DEBUG: Erro ao chamar OpenRouter API:', error.message);
    if (error.response) {
        console.error('DEBUG: Status do erro da OpenRouter API:', error.response.status);
        console.error('DEBUG: Dados do erro da OpenRouter API:', error.response.data);
    } else if (error.request) {
        console.error('DEBUG: Nenhuma resposta recebida da OpenRouter API. Request:', error.request);
    } else {
        console.error('DEBUG: Erro na configuração da requisição para OpenRouter API:', error.message);
    }
    return "Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde.";
  }
}


module.exports = {
  getAIResponse
};