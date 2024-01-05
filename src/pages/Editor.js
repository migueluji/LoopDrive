// Editor.js
import React, { useEffect } from 'react';
import { useAppContext } from '../context';
import { useNavigate } from 'react-router-dom';

function Editor() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameID = urlParams.get('id');
  const { setSavedGameData } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === 'cerrarApp') {
        navigate('/games');
      }
    };

    const handleSavedGame = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'game_saved') {
        const savedGameData = event.data.data;
        setSavedGameData(savedGameData);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    window.addEventListener('message', handleSavedGame);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      window.removeEventListener('message', handleSavedGame);
    };
  }, [setSavedGameData, navigate]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        title="Editor"
        src={`/editor?id=${gameID}`} 
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

export default Editor;
