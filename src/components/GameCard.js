// src/components/GameCard.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';

const GameCard = ({ game, handleEditGame, handlePlayGame, handleDuplicateGame, handleDeleteGame }) => (
    <Card style={{ maxWidth: '240px', minWidth: '240px' }}>
        <CardMedia
            component="img"
            alt={game.name}
            height="140"
            image={game.imageUrl}
            style={{ objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
        />
        <CardContent>
            <Typography>
                {game.name}
            </Typography>
        </CardContent>
        {/* Acciones de la tarjeta */}
        <CardActions>
            <IconButton onClick={() => handleEditGame(game.id)}>
                <EditIcon />
            </IconButton>
            <IconButton onClick={() => handlePlayGame(game.id)}>
                <PlayCircleFilledIcon />
            </IconButton>
            <IconButton onClick={() => handleDuplicateGame(game.id)}>
                <FileCopyIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteGame(game.id, game.name)}>
                <DeleteIcon />
            </IconButton>
        </CardActions>
    </Card>
);

export default GameCard;
