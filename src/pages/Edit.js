// Edit.js
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

function Edit() {
  const { gameID, token, API_KEY, DISCOVERY_DOCS, gameList, setGameList } = useAppContext();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const handleCloseEditor = useCallback((event) => {
    if (event.origin === window.location.origin && event.data && event.data.type === "closeEditor") {
      const updatedList = gameList.map(game => {
        if (game.id === event.data.data.id) {
          return { ...game, name: event.data.data.name };
        }
        return game;
      });
      setGameList(updatedList);
      navigate('/games');
    }
  }, [navigate, gameList, setGameList]); // Asegúrate de incluir gameList y setGameList en las dependencias

  useEffect(() => {
    window.addEventListener('message', handleCloseEditor);
    return () => window.removeEventListener('message', handleCloseEditor);
  }, [handleCloseEditor]);

  const handleOpenEditor = useCallback(() => {
    const messageData = {
      type: 'initEditor',
      data: { gameID, token, API_KEY, DISCOVERY_DOCS }
    };
    iframeRef.current.contentWindow.postMessage(messageData, window.location.origin);
  }, [gameID, token, API_KEY, DISCOVERY_DOCS]);

  useEffect(() => {
    if (iframeRef.current) iframeRef.current.onload = handleOpenEditor;
  }, [handleOpenEditor]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        title="Editor"
        id="editorIframe"
        ref={iframeRef}
        src="/editor"
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

export default Edit;





