// TutorialSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

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
      <Button variant="contained" color="primary" href="#tutorials">
        Explore Tutorials
      </Button>
    </Box>
  );
};

export default TutorialSection;
