// Games.js
import React, { useEffect, useState, useCallback } from 'react';
import { newGame, duplicateGame, deleteGame, listDriveGames } from '../apis/driveAPI';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import GameCard from '../components/GameCard';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

const Games = () => {
  const { token, appFolderID, gameList, setGameList, setGameID, updateGameList, setUpdateGameList } = useAppContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const newUpdatedGameList = await listDriveGames(appFolderID);
      setGameList(newUpdatedGameList);
      setLoading(false);
      setUpdateGameList(false);
    } catch (error) {
      console.error('Error fetching games:', error);
    } 
  }, [appFolderID, setGameList, setUpdateGameList]);

  useEffect(() => {
    if (updateGameList) fetchGames();
  }, [updateGameList, fetchGames]);

  const handleAction = async (action, ...args) => {
    try {
      setLoading(true);
      await action(...args);
      setLoading(false);
      setUpdateGameList(true);
    } catch (error) {
      console.error('Error performing game operation:', error.message);
    } 
  };

  const handleNavigation = (path, gameID) => {
    setGameID(gameID);
    navigate(`/${path}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <>
          <div
            style={{ position: 'fixed', width: '100%', height: 'calc(100% - 64px)', backgroundColor: `rgba(255,255,255, 0.5)`, zIndex: 9998 }}
          ></div>
          <Box
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
          >
            <CircularProgress size={80} />
          </Box>
        </>
      )}
      <div style={{ paddingLeft: '64px', paddingTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleAction(newGame, appFolderID, token.access_token)}
            disabled={loading}
          >
            New Game
          </Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {gameList.map((game) => (
            <GameCard key={game.id} game={game}
              handleEditGame={() => handleNavigation('edit', game.id)}
              handlePlayGame={() => handleNavigation('play', game.id)}
              handleDuplicateGame={() => handleAction(duplicateGame, game.id)}
              handleDeleteGame={() => handleAction(deleteGame, game.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;


