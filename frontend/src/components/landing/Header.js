import './Header.css'
import React from 'react'; 


export function Header() {
    return (
      <header className="header">
        <div className="nav-container">
          <nav>
            <ul className="nav-links">
              <li><a href="https://www.furia.gg/" className="nav-link">LOJA OFICIAL</a></li>
            <li><a href="/" className="nav-link">CHATBOT</a></li>
              <li><a href="/livestream" className="nav-link">LIVESTREAMS</a></li>
            </ul>
          </nav>
          <img
            src="https://furiagg.fbitsstatic.net/sf/img/logo-furia.svg"
            alt="FURIA Logo"
            className="logo"
            onClick={() => window.location.href = "https://www.furia.gg/"}
          />
        </div>
      </header>
    );
}