// HeroSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import BackgroundImage from '../images/loop.png'; // Asegúrate de reemplazar esto con la ruta de tu imagen

const HeroSection = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Crea tus juegos 2D fácilmente
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        El motor de juegos más sencillo del mundo, totalmente libre y gratuito.
      </Typography>
      <Button variant="contained" color="secondary" href="#register">
        Empieza Ahora
      </Button>
    </Box>
  );
};

export default HeroSection;

