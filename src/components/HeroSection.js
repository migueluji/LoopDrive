// HeroSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import BackgroundImage from '../images/hero.png'; // Ensure this path is correct for your image

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
        '&::before': { // Aquí añadimos el overlay oscuro
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ajusta la opacidad según necesites
          zIndex: 1,
        },
        '& > *': { position: 'relative', zIndex: 2, color: '#fff' }, // Asegura que el texto se muestre sobre el overlay
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Build Your Own 2D Games Easily
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        The simplest game engine in the world, completely free and open source.
      </Typography>
      <Button variant="contained" color="secondary" href="#register">
        Start Now
      </Button>
    </Box>
  );
};

export default HeroSection;


