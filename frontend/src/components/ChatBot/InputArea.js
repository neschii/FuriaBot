import React, { useState } from 'react';
import './InputArea.css';

function InputArea({ onSendMessage }) {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form className="input-area-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Digite sua mensagem..."
        className="text-input"
      />
      <button type="submit" className="send-button">Enviar</button>
    </form>
  );
}

export default InputArea;