import React from 'react';
import { Container, Grid, Box } from '@mui/material';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import TutorialSection from './sections/TutorialSection';
import CommunitySection from './sections/CommunitySection';

const LandingPage = ({ handleLogin }) => {
  return (
    <div>
      <HeroSection handleLogin={handleLogin} />
      <Container maxWidth="lg">
        <Box mb={4}>
          <FeaturesSection />
        </Box>
        <Box mb={4}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <TutorialSection />
            </Grid>
            <Grid item xs={12} md={6}>
              <CommunitySection />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default LandingPage;

