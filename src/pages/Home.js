// Home.js
import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import TutorialSection from './sections/TutorialSection'; // Ensure the path is correct
import CommunitySection from './sections/CommunitySection'; // Ensure the path is correct

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Container maxWidth="lg">
        <FeaturesSection />
        <TutorialSection />
        <CommunitySection />
        <Box mt={5} textAlign="center">
          <Typography variant="h5" gutterBottom>
            Start creating your own games today!
          </Typography>
          <Button variant="contained" color="primary" href="#register">
            Register for Free
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
