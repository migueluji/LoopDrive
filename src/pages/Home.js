// Home.js
import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import HeroSection from '../components/HeroSection'; // Asegúrate de que la ruta sea correcta
//import FeaturesSection from '../components/FeaturesSection'; // Asegúrate de que la ruta sea correcta
// import TutorialSection from './components/TutorialSection'; // Asegúrate de que la ruta sea correcta
// import CommunitySection from './components/CommunitySection'; // Asegúrate de que la ruta sea correcta

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Container maxWidth="lg">
{/*         <FeaturesSection />
        <TutorialSection />
        <CommunitySection /> */}
        <Box mt={5} textAlign="center">
          <Typography variant="h5" gutterBottom>
            ¡Empieza a crear tus propios juegos hoy mismo!
          </Typography>
          <Button variant="contained" color="primary" href="#register">
            Regístrate Gratis
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
