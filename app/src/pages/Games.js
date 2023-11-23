import React, { useState, useEffect } from 'react';
import { setDriveAccessToken, checkDriveFolder, listDriveGames, newGame } from '../driveAPI';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Games = ({ token }) => {
  const [folderID, setFolderID] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const initDrive = async () => {
      try {
        await setDriveAccessToken(token.access_token);
        const id = await checkDriveFolder("Loop Games");
        setFolderID(id);
        const gamesList = await listDriveGames(id);
        setGames(gamesList);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    initDrive();
  }, [token.access_token]);

  const handleNewGameClick = async () => {
    try {
      await newGame();
      const updatedGamesList = await listDriveGames(folderID);
      setGames(updatedGamesList);
    } catch (error) {
      console.error('Error creating new game:', error.message);
    }
  };

  return (
    <div style={{ paddingLeft: '64px', paddingTop: '64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewGameClick}
        >
          New Game
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {games.map((game) => (
          <Card key={game.id} style={{ maxWidth: '240px', minWidth: '240px' }}>
            <CardMedia
              component="img"
              alt={game.name}
              height="140"
              image={game.imageUrl}
              style={{ objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
            />
            <CardContent>
              <Typography >
                {game.name}
              </Typography>
            </CardContent>

            {/* Acciones de la tarjeta */}
            <CardActions>
              <IconButton>
                <EditIcon />
              </IconButton>
              <IconButton>
                <PlayCircleFilledIcon />
              </IconButton>
              <IconButton>
                <FileCopyIcon />
              </IconButton>
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Games;

