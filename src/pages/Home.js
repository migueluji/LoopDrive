// Home.js
import React from 'react';
import { Container } from '@mui/material';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import TutorialSection from './sections/TutorialSection';
import CommunitySection from './sections/CommunitySection';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Container maxWidth="lg">
        <FeaturesSection />
        <TutorialSection />
        <CommunitySection />
      </Container>
    </div>
  );
};

export default Home;
