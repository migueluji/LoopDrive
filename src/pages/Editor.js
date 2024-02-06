// Editor.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

function Editor() {
  const { gameID, token, API_KEY, DISCOVERY_DOCS } = useAppContext();
  const navigate = useNavigate();
  var iframe;

  useEffect(() => {
    iframe = document.getElementById('editorIframe');
    if (iframe) iframe.onload = handleOpenEditor;
    window.addEventListener('message', handleCloseEditor);
    return () => { window.removeEventListener('message', handleCloseEditor) };
  }, []);

  const handleOpenEditor = () => {
    const messageData = {
      type: 'initializeEditor',
      data: { gameID, token, API_KEY, DISCOVERY_DOCS }
    };
    iframe.contentWindow.postMessage(messageData, '*');
  };

  const handleCloseEditor = (event) => {
    if (event.data && event.data.type === 'closeEditor') navigate('/games');
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        title="Editor"
        id="editorIframe"
        src="/editor"
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

export default Editor;


