// Games.js
import React, { useEffect, useState } from 'react';
import { newGame, duplicateGame, deleteGame, listDriveGames } from '../apis/driveAPI';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import GameCard from '../components/GameCard';
import { useAppContext } from '../context';
import { useNavigate } from 'react-router-dom';

const Games = () => {
  const { gamesLoaded, setGamesLoaded, userInfo, token, setGameID, gameList, setGameList, appFolderID } = useAppContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      // Si el usuario no está autenticado, redirige a la página de inicio
      navigate("/");
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const updatedgameList = await listDriveGames(appFolderID);
        setGameList(updatedgameList);
        setGamesLoaded(true);
      } catch (error) {
        console.error('Error fetching games:', error.message);
      } finally {
        setLoading(false);
      }
    };
    // Solo carga los juegos si gamesLoaded es false
    if (!gamesLoaded) fetchGames();
  }, [token, appFolderID, setGameList, gamesLoaded]);

  useEffect(() => {
    const handleSavedGame = (event) => {
      if (event.origin !== "http://localhost:3000") return;
      if (event.data.type === 'game_saved') {
        const savedGameData = event.data.data;
        setGameList(currentGameList => {
          return currentGameList.map(game => {
            if (game.id === savedGameData.id) {
              return { ...game, ...savedGameData };
            }
            return game;
          });
        });
      }
    };
    window.addEventListener('message', handleSavedGame);
    return () => {
      window.removeEventListener('message', handleSavedGame);
    };
  }, [setGameList]);


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
