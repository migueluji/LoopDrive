// CommunitySection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import DiscordIcon from '../../components/DiscordIcon'; // Ejemplo de sustitución, reemplázalo por tu ícono de Discord
import ChatImage from '../../images/chat.png'; // Importa la imagen

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
        <Box
          component="img"
          src={ChatImage}
          alt="Chat with the community"
          sx={{
            width: '100%', 
            maxWidth: 250, 
            height: 'auto', 
            marginBottom: 3, 
            display: 'block', 
            marginLeft: 'auto', 
            marginRight: 'auto', 
          }}
        />
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <Button
            variant="contained"
            startIcon={<DiscordIcon />} 
            sx={{
              padding: '10px 20px', 
              backgroundColor: '#5865F2',
              color: '#FFFFFF', 
              '&:hover': {
                backgroundColor: '#4B55E6', 
              },
            }}
            onClick={() => window.open('https://discord.gg/yourInviteLink', '_blank')}
          >
            Join Now
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CommunitySection;


