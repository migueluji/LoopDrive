import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube'; // Importa el ícono de YouTube

const TutorialSection = () => {
  return (
    <Box
      sx={{
        py: 8,
        bgcolor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Tutorials
      </Typography>
      <Typography variant="body1" gutterBottom>
        Learn how to use our game editor with our comprehensive tutorials.
      </Typography>
      <Button
        variant="contained"
        sx={{
          mt: 2, // Añade un margen superior para asegurar espacio con elementos arriba
          backgroundColor: '#FF0000', // Rojo YouTube
          '&:hover': {
            backgroundColor: '#E60000', // Un poco más oscuro al pasar el mouse
          },
          color: '#FFFFFF', // Texto blanco para contraste
          padding: '10px 20px', // Ajusta el padding para un botón más grande y llamativo
        }}
        startIcon={<YouTubeIcon />}
        href="https://www.youtube.com/@gamesonomy8970" // Asegúrate de cambiar esto a tu URL real
        target="_blank"
        rel="noopener noreferrer"
      >
        Explore Tutorials
      </Button>
    </Box>
  );
};

export default TutorialSection;

