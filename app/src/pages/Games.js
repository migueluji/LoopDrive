// src/pages/Games.js
import React, { useState, useEffect } from 'react';
import { folderExists, createFolder, listDriveGames, newGame, duplicateGame, deleteGame } from '../driveAPI';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import GameCard from '../components/GameCard'; // Ajusta la ruta según tu estructura de carpetas

const Games = ({ token }) => {
  const [appFolderID, setAppFolderID] = useState([]);
  const [gameList, setGameList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initDrive = async () => {
      try {
        setLoading(true); // Inicia la carga

        let folderID = await folderExists("Loop Games");
        if (!folderID) folderID = await createFolder("Loop Games", 'root', token.access_token);
        setAppFolderID(folderID);

        const gameList = await listDriveGames(folderID);
        setGameList(gameList);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false); // Finaliza la carga, ya sea con éxito o error
      }
    };

    initDrive();
  }, [token.access_token]);

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
            <CircularProgress size={64}/>
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
