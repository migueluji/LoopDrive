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
import { getImageDownloadUrl } from '../apis/driveAPI';

const Games = () => {
  const { savedGame, setSavedGame, token, gameID, setGameID, gameList, setGameList, appFolderID } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [updateGameList, setUpdateGameList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const updatedGameList = await listDriveGames(appFolderID);
        setGameList(updatedGameList);
      } catch (error) {
        console.error('Error fetching games:', error.message);
      } finally {
        setLoading(false);
      }
    };
    if (!gameList || gameList.length === 0 || updateGameList) {
      fetchGames();
      setUpdateGameList(false);
    }
  }, [gameList, setGameList, appFolderID, updateGameList]);


  useEffect(() => {
    const updateGameListWithImageUrl = async () => {
      if (savedGame) {
        try {
          const imageUrl = await getImageDownloadUrl(gameID);
          const updatedSavedGame = { ...savedGame, imageUrl };
          setGameList(currentGameList => {
            return currentGameList.map(game => {
              if (game.id === updatedSavedGame.id) {
                return updatedSavedGame;
              }
              return game;
            });
          });
          setSavedGame(null);
        } catch (error) {
          console.error('Error fetching image URL:', error);
        }
      }
    };
    updateGameListWithImageUrl();
  }, [savedGame, setSavedGame, setGameList, gameID]);



  const handleNewGame = async () => {
    try {
      setLoading(true);
      await newGame(appFolderID, token.access_token);
      setUpdateGameList(true);
    } catch (error) {
      console.error('Error creating new game:', error.message);
    }
  };

  const handleEditGame = async (gameID) => {
    setGameID(gameID);
    navigate(`/editor`);
  };

  const handlePlayGame = async (gameID) => {
    setGameID(gameID);
    navigate(`/play`);
  };

  const handleDuplicateGame = async (gameID) => {
    try {
      setLoading(true);
      await duplicateGame(gameID);
      setUpdateGameList(true);
    } catch (error) {
      console.error('Error duplicating game:', error.message);
    }
  };

  const handleDeleteGame = async (gameID, gameName) => {
    try {
      setLoading(true);
      await deleteGame(gameID, gameName);
      setUpdateGameList(true);
    } catch (error) {
      console.error('Error deleting game:', error.message);
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
