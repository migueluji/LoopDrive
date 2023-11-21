import React from 'react';

const Games = ({ appFolderID }) => {
  return (
    <div>
      <h1> My Games</h1>
      {appFolderID && <p>App Folder ID: {appFolderID}</p>}
      {/* Aquí puedes agregar más contenido relacionado con los juegos */}
    </div>
  );
};

export default Games;
