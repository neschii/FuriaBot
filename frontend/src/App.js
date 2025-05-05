import React from 'react';
import ChatWindow from './components/ChatBot/ChatWindow';
import Landing from './components/landing/Landing';
import './index.css';

function App() {
  return (
    <React.Fragment>
      <Landing />
      <main className="app-main"> 
        <ChatWindow />
      </main>
    </React.Fragment>
  );
}

export default App;