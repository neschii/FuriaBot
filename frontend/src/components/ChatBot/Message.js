import React from 'react';
import './Message.css';

function Message({ message, onOptionClick }) {
  const { type, text, options, imageUrl, url } = message;

  const isUser = type === 'user';
  const messageClass = isUser ? 'user-message' : 'bot-message';

  return (
    <div className={`message-row ${messageClass}`}>
      <div className="message-bubble">
        {/* Renderiza texto ou link da mensagem principal */}
        {url && !options ? ( // Se for uma mensagem que é apenas um link (e não tem opções de botão)
             <a href={url} target="_blank" rel="noopener noreferrer" className="message-link">
                 🔗 {text || url.replace(/^https?:\/\//, '').split('/')[0]} {/* Usa o texto se existir, senão mostra a URL */}
             </a>
         ) : (
            <p>{text}</p> // Renderiza texto normal
         )}

        {imageUrl && <img src={imageUrl} alt="Conteúdo relacionado" className="message-image" />}

          {options && options.length > 0 && (
             <div className="message-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => {
                    if (option.url) {
                        window.open(option.url, '_blank');
                    } else {
                        onOptionClick(option.value || option.text);
                    }
                  }}
                >
                {option.text}
                {option.url && <img src="/twitch_icon.png" alt="Twitch" style={{ width: '12px', marginLeft: '5px', verticalAlign: 'middle' }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;