// components/GameList.js

import React, { useEffect } from 'react';
import { listDriveGames } from '../googleAPI';

const GameList = ({ appFolderID }) => {
  useEffect(() => {
    //listDriveGames(appFolderID);
  }, [appFolderID]);

  return (
    <div className="list">
      <ul>
        <div></div>
      </ul>
    </div>
  );
};

export default GameList;
