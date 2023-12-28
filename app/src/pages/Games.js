// src/pages/Games.js
import React, { useEffect } from 'react';
import { newGame, duplicateGame, deleteGame, listDriveGames } from '../driveAPI';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import GameCard from '../components/GameCard';
import { useAppContext } from '../AppContext';

const Games = () => {
  const { token, setGameID, gameList, setGameList, loadGames, appFolderID} = useAppContext();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        await loadGames(); // Esta función cargará los juegos si aún no se han cargado
      } catch (error) {
        console.error('Error fetching games:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [token, loadGames, gameList]); // Dependencias: token y loadGames

  const handleNewGame = async () => {
    try {
      setLoading(true);
      await newGame(appFolderID, token.access_token);
      const updatedgameList = await listDriveGames(appFolderID);
      setGameList(updatedgameList);
    } catch (error) {
      console.error('Error creating new game:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = async (gameID) => {
    setGameID(gameID);
    localStorage.setItem("token", JSON.stringify(token));
    const editorUrl = `${window.location.origin}/editor/?id=${gameID}`;
    window.open(editorUrl, '_blank');
  };

  const handlePlayGame = async (gameID) => {
    setGameID(gameID);
    localStorage.setItem("token", JSON.stringify(token));
    const engineUrl = `${window.location.origin}/engine/?id=${gameID}`;
    window.open(engineUrl, '_blank');
  };

  const handleDuplicateGame = async (gameID) => {
    try {
      setLoading(true);
      await duplicateGame(gameID);
      const updatedgameList = await listDriveGames(appFolderID);
      setGameList(updatedgameList);
    } catch (error) {
      console.error('Error duplicating game:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameID, gameName) => {
    try {
      setLoading(true);
      await deleteGame(gameID, gameName);
      const updatedgameList = await listDriveGames(appFolderID);
      setGameList(updatedgameList);
    } catch (error) {
      console.error('Error deleting game:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && ( // Muestra el indicador de carga solo cuando loading es true
        <>
          <div
            style={{ position: 'fixed', width: '100%', height: 'calc(100% - 64px)', backgroundColor: `rgba(255,255,255, 0.5)`, zIndex: 9998 }}
          ></div>
          <Box
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
          >
            <CircularProgress size={64} />
          </Box>
        </>
      )}
      <div style={{ paddingLeft: '64px', paddingTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewGame}
            disabled={loading}
          >
            New Game
          </Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {gameList.map((game) => (
            <GameCard key={game.id} game={game}
              handleEditGame={handleEditGame}
              handlePlayGame={handlePlayGame}
              handleDuplicateGame={handleDuplicateGame}
              handleDeleteGame={handleDeleteGame}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
