// Editor.js
import React, { useEffect } from 'react';
import { useAppContext } from '../context';

function Editor() {
  const { gameID, token, API_KEY, DISCOVERY_DOCS } = useAppContext();

  useEffect(() => {
    // Función para enviar los datos al iframe
    const sendMessageToIframe = () => {
      const iframe = document.getElementById('editorIframe');
      if (iframe && iframe.contentWindow) {
        // Espera hasta que el iframe haya cargado completamente
        iframe.onload = () => {
          // Objeto con los datos a enviar
          const messageData = {
            gameID,
            token,
            API_KEY,
            DISCOVERY_DOCS
          };

          // Enviar el mensaje al iframe una vez que haya cargado
          iframe.contentWindow.postMessage(messageData, '*');
        };
      }
    };

    // Llamar a la función al cargar la página
    sendMessageToIframe();
  }, [gameID, token]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        title="Editor"
        id="editorIframe" // Añade un ID al iframe
        src="/editor" // URL del iframe (sin query params)
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

export default Editor;


