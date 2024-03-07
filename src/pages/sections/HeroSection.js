// HeroSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import BackgroundImage from '../../images/hero.gif';
import GameEngineLogo from '../../images/loop.png';

const HeroSection = () => {
  return (
    <Box sx={{
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
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(53, 53, 53, 0.5)', // Color con transparencia
        zIndex: 1,
      },
    }}>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <img src={GameEngineLogo} alt="Game Engine Logo" style={{ width: '400px', marginBottom: '40px' }} />
        <Typography variant="h2" component="h1" gutterBottom style={{ color: '#fff' }}>
          Build Your Own 2D Games Easily
        </Typography>
        <Typography variant="h5" component="p" gutterBottom style={{ color: '#fff', marginBottom: '20px' }}>
          The simplest game engine in the world, completely free and open source.
        </Typography>
        <Button variant="contained" color="secondary" href="#register" style={{ marginTop: '24px' }}>
          Start Now
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;




