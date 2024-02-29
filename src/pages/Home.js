// Home.js
import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import TutorialSection from '../components/TutorialSection'; // Ensure the path is correct
import CommunitySection from '../components/CommunitySection'; // Ensure the path is correct

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
