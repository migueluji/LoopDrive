// CommunitySection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

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
        <Button variant="contained" color="primary">
          Join Now
        </Button>
      </Box>
    </Box>
  );
};

export default CommunitySection;
