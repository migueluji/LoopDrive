import React, { useEffect } from 'react';
import { useAppContext } from '../AppContext';

const Editor = () => {
  const { gameID, token } = useAppContext();
  const navbarHeight = 68; // Ajusta esto según la altura de tu barra de navegación

  useEffect(() => {
    // Puedes realizar acciones adicionales cuando el componente se monta o el gameID cambia
    console.log('Editor mounted with gameID:', gameID, token);
    localStorage.setItem("token", JSON.stringify(token));
  }, [gameID, token]);

  return (
    <div style={{ width: '100%', height: `calc(100vh - ${navbarHeight}px)` }}>
      <iframe
        title="loop-editor"
        src={`/editor/?id=${gameID}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default Editor;



