// frontend/src/components/landing/Landing.js
import React, { useState, useEffect } from 'react';
import './Landing.css';
import { ChevronsDown } from 'lucide-react';
import { Header } from './Header';

function Landing() {
  const backgrounds = [
    "https://pbs.twimg.com/media/F98rnl8XwAAnrpY?format=jpg&name=large",
    "https://img-cdn.hltv.org/gallerypicture/fIQtbc1RUc07HxK7MNFDOA.jpg?ixlib=java-2.1.0&w=1200&s=9ca3954c6964269c535f6d5e4acc8370",
    "https://scontent.fsdu8-1.fna.fbcdn.net/v/t39.30808-6/469119405_18338328985196126_5007141997369792745_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=kZ7buT4qyHEQ7kNvwG-mkz-&_nc_oc=AdkMoBbwP5hUuH07VTtf97VNecCuzeA0piKeymlo7tkr-vbSZ1_hxF27Vo8wePDTAClu4c2Zy4OV7yjX67b-aRuB&_nc_zt=23&_nc_ht=scontent.fsdu8-1.fna&_nc_gid=tnbtGmR5GtRvIeEUPlTZ4g&oh=00_AfGmZ1YF44NDEH6Vnw8p3yi6_nGIxdzh-hSlZA-kS2SZRA&oe=6819B9BF",
    "https://livemarketing.com.br/wp-content/uploads/2025/03/adidas-e-FURIA-1024x768.jpg"
  ];

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % backgrounds.length);
    }, 7000); 

    return () => clearInterval(interval);
  }, []);

  const scrollToChat = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
        <Header />
      <section 
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${backgrounds[currentBg]}')`,
          transition: "background-image 1s ease-in-out"
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Somos FÚRIA!</h1>
          <p className="hero-description">Unimos pessoas e alimentamos sonhos dentro e fora dos jogos...</p>
          <a href="#" className="cta-button" onClick={(e) => { e.preventDefault(); scrollToChat(); }}>
            JUNTE-SE A NÓS
          </a>
        </div>
        <div className="scroll-indicator">
          <ChevronsDown size={32} className="scroll-icon" />
        </div>
        
        <div className="bg-indicators">
          {backgrounds.map((_, index) => (
            <span 
              key={index} 
              className={`bg-dot ${index === currentBg ? 'active' : ''}`}
              onClick={() => setCurrentBg(index)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default Landing;
