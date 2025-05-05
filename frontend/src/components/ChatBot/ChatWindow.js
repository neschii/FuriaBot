import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import InputArea from './InputArea';
import './ChatWindow.css'; 

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); // Para manter a sessão
  const messagesEndRef = useRef(null); // Para scroll automático

  const BACKEND_URL = 'http://localhost:3001'; // URL do backend

  // Hook para scrollar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hook para iniciar a sessão ao carregar
  useEffect(() => {
     startNewSession();
  }, []); // Executa apenas uma vez no mount


  const startNewSession = async () => {
    setLoading(true);
    try {
        console.log("Iniciando nova sessão...");
        const response = await fetch(`${BACKEND_URL}/api/chat/init`);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data.messages);
        setSessionId(data.sessionId);
        console.log(`Sessão ${data.sessionId} iniciada.`);
    } catch (error) {
        console.error("Erro ao iniciar sessão:", error);
        setMessages([{ type: 'bot', text: 'Ocorreu um erro ao iniciar o chat. Por favor, recarregue a página.' }]);
    } finally {
        setLoading(false);
    }
  };


const sendMessage = async (text = '', action = null) => {
    if ((!text && !action) || loading || !sessionId) return;

    setLoading(true);

    // Adiciona a mensagem do usuário ou a ação clicada como "mensagem" no chat
    let userMessageText = '';
    if (text) {
        userMessageText = text;
    } else if (action !== null) { 
         const lastBotMessage = messages.slice().reverse().find(msg => msg.type === 'bot' && msg.options);
         if (lastBotMessage && lastBotMessage.options) {
              const clickedOption = lastBotMessage.options.find(opt => (opt.value || opt.text) === action);
              if (clickedOption) {
                  userMessageText = clickedOption.text; 
              } else {
                  userMessageText = `Ação: ${action}`;
              }
         } else {
              userMessageText = `Ação: ${action}`; 
         }
    }


    if (userMessageText) { 
         setMessages((prevMessages) => [
           ...prevMessages,
           { type: 'user', text: userMessageText, timestamp: new Date().getTime() }
         ]);
    }


   try {
      console.log(`[Frontend] Enviando para backend: sessionId=${sessionId}, message="${text}", action="${action}"`);
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // message é o texto digitado, action é o valor do botão clicado
        body: JSON.stringify({ sessionId, message: text, action: action }),
      });

      if (!response.ok) {
           const errorBody = await response.text();
           console.error("Backend error response body:", errorBody);
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta do backend:", data);

      // Adiciona as mensagens do bot
      setMessages((prevMessages) => [
        ...prevMessages,
        ...data.messages.map(msg => ({ ...msg, type: 'bot', timestamp: new Date().getTime() + Math.random() })) // Add type and timestamp
      ]);

    } catch (error) {
      console.error("Erro ao enviar mensagem para o backend:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Desculpe, não consegui me comunicar com o servidor no momento.', timestamp: new Date().getTime() + Math.random() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Callback para InputArea quando o usuário digita e envia
  const handleTextInput = (text) => {
      sendMessage(text, null);
  };

  // Callback para Message quando um botão de opção é clicado
  const handleOptionClick = (actionValue) => {
      sendMessage(null, actionValue);
  };


  return (
    <div className="chat-window-container">
      <div className="messages-list">
        {messages.map((msg, index) => (
          // Usar um identificador único melhor que index se possível, mas ok para este exemplo
          <Message
            key={msg.timestamp || index}
            message={msg}
            onOptionClick={handleOptionClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!loading && <InputArea onSendMessage={handleTextInput} />}
       {loading && <div className="loading-indicator">Digitando...</div>}
    </div>
  );
}

export default ChatWindow;