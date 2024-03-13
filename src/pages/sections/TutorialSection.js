// TutorialSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube'; 
import YoutubeImage from '../../images/youtube.png'; 

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
      <Box
        component="img"
        src={YoutubeImage}
        alt="YouTube Tutorials"
        sx={{
          width: '100%', 
          maxWidth: 260, 
          height: 'auto', 
          marginTop: 3, 
          display: 'block', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
        }}
      />
      <Button
        variant="contained"
        sx={{
          mt: 2, // Añade un margen superior para asegurar espacio con elementos arriba
          backgroundColor: '#FF0000', 
          '&:hover': {
            backgroundColor: '#E60000', 
          },
          color: '#FFFFFF', 
          padding: '10px 20px', 
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

