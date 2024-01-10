// Editor.js
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
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      const eventType = event.data.type;

      if (eventType === 'closeEditor') {
        navigate('/games');
      } else if (eventType === 'gameSaved') {
        const savedGameData = event.data.gameData;
        setSavedGameData(savedGameData);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
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

