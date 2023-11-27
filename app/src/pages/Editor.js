import React from 'react';
import { useParams } from 'react-router-dom';

const Editor = ({ token }) => {
  const navbarHeight = 68; // Ajusta esto según la altura de tu barra de navegación
  const { gameID } = useParams();
  localStorage.setItem("token", JSON.stringify(token));
  console.log(token, gameID);

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


