// frontend/src/components/livestream/Livestream.js
import React, { useState, useEffect } from 'react';
import { Camera, CameraOff } from "lucide-react";
import './livestream.css';
import { Header } from '../landing/Header';

const Livestream = () => {
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreamers = async () => {
      setLoading(true);
      try {
        // Call the backend API endpoint
        const response = await fetch('http://localhost:3001/api/streamers'); // Ensure this URL is correct
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Frontend: Fetched streamer data:", data); // Log the received data
        setStreamers(data);
        setLoading(false);

      } catch (err) {
        console.error('Frontend: Error fetching streamers:', err);
        alert('Failed to load streamers. Please ensure the backend is running and accessible at http://localhost:3001 and check backend logs.');
        setStreamers([]);
        setLoading(false);
      }
    };

    fetchStreamers();

    // Set up interval to refetch data every 60 seconds
    const intervalId = setInterval(fetchStreamers, 60000);

    // Clean up the interval
    return () => clearInterval(intervalId);
  }, []);

  const handleWatchStream = (streamer) => {
    window.open(streamer.url, '_blank');
  };

  return (
      <>
      <div>
        <Header />
      </div>

      <div className="livestream-container">
        <main className="livestream-main">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading streamers...</p>
            </div>
          ) : (
             streamers.length > 0 ? (
                <div className="streamers-grid">
                  {streamers.map((streamer) => (
                    <div key={streamer.login} className={`streamer-card ${streamer.isOnline ? 'online' : ''}`}>
                      <div className="thumbnail-container">
                        <img
                          src={streamer.profile_image_url || 'https://static-cdn.jtvnw.net/user-default-pictures-healthcare-yellow/f452ce25-42a8-479a-b5b7-034ad007b6fe-profile_image-300x300.png'} // Using a default Twitch placeholder
                          alt={`${streamer.login}'s profile`}
                          className="streamer-thumbnail"
                        />
                        <div className={`status-badge ${streamer.isOnline ? 'online' : 'offline'}`}>
                          {streamer.isOnline ? (
                            <>
                              <span className="status-dot"></span>
                              LIVE
                            </>
                          ) : (
                            <>
                              <CameraOff className="status-icon" />
                              OFFLINE
                            </>
                          )}
                        </div>
                      </div>

                      <div className="streamer-content">
                        <h3 className="streamer-name">{streamer.login}</h3>

                        {streamer.isOnline ? (
                          <div className="stream-details">
                            <p className="stream-title">{streamer.title}</p>
                            <p className="stream-game">{streamer.game_name}</p>
                            <div className="viewer-count">
                              <span>👁️</span>
                              {streamer.viewer_count.toLocaleString()} viewers
                            </div>
                          </div>
                        ) : (
                          <p className="offline-message">This streamer is currently offline.</p>
                        )}

                        <button
                          onClick={() => handleWatchStream(streamer)}
                          className={`watch-button ${streamer.isOnline ? 'online' : 'offline'}`}
                        >
                          {streamer.isOnline ? <Camera className="button-icon" /> : <CameraOff className="button-icon" />}
                          {streamer.isOnline ? 'Watch Now' : 'Visit Channel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                 <div className="offline-message" style={{ textAlign: 'center', color: '#ccc', padding: '40px' }}>
                   No streamers configured or found. Please check your backend configuration (TWITCH_STREAMERS).
                 </div>
             )
          )}
        </main>
      </div>
    </>
  );
};

export default Livestream;