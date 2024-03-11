// CommunitySection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import DiscordIcon from '@mui/icons-material/Chat'; // Ejemplo de sustitución, reemplázalo por tu ícono de Discord

const CommunitySection = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
      <Box sx={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Join Our Community
        </Typography>
        <Typography variant="body1" paragraph>
          Connect with other game developers, and get inspired by the amazing
          creations of our community members.
        </Typography>
        <Button
          variant="contained"
          startIcon={<DiscordIcon />} // Ícono de Discord
          sx={{
            backgroundColor: '#5865F2', // Color de fondo de Discord
            color: '#FFFFFF', // Texto blanco
            '&:hover': {
              backgroundColor: '#4B55E6', // Un poco más oscuro al pasar el ratón
            },
          }}
          onClick={() => window.open('https://discord.gg/yourInviteLink', '_blank')}
        >
          Join Now
        </Button>
      </Box>
    </Box>
  );
};

export default CommunitySection;

