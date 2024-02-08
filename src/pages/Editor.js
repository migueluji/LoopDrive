// Editor.js
import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

function Editor() {
  const { gameID, token, API_KEY, DISCOVERY_DOCS, setSavedGame } = useAppContext();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Memoriza handleOpenEditor para que no cambie si sus dependencias no cambian
  const handleOpenEditor = useCallback(() => {
    const messageData = {
      type: 'initializeEditor',
      data: { gameID, token, API_KEY, DISCOVERY_DOCS }
    };
    iframeRef.current.contentWindow.postMessage(messageData, '*');
  }, [gameID, token, API_KEY, DISCOVERY_DOCS]); // Dependencias de la función

  // Memoriza handleCloseEditor por la misma razón
  const handleCloseEditor = useCallback((event) => {
    if (event.data)
      switch (event.data.type) {
        case 'closeEditor': navigate('/games'); break;
        case 'savedGame': setSavedGame(event.data.data); break;
        default: break;
      }
  }, [navigate, setSavedGame]); // Dependencias de la función

  useEffect(() => {
    if (iframeRef.current) iframeRef.current.onload = handleOpenEditor;
    window.addEventListener('message', handleCloseEditor);
    return () => { window.removeEventListener('message', handleCloseEditor) };
  }, [handleCloseEditor, handleOpenEditor]); // Ahora incluye las funciones como dependencias

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

export default Editor;



