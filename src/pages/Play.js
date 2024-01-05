import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function Play() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameID = urlParams.get('id');
    const navigate = useNavigate();

    const handleClosePlay = () => {
        // Redirigir a la página de juegos al cerrar el modo Play
        navigate('/games');
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <IconButton
                style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1, color: 'white' }}
                onClick={handleClosePlay}
            >
                <CloseIcon />
            </IconButton>
            <iframe
                title="Game Engine"
                src={`/engine/?id=${gameID}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>
        </div>
    );
};

export default Play;
