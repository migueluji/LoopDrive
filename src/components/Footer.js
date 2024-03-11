// Footer.js
import React from 'react';
import { Box, Container, Typography, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme(); // Accede al tema para utilizar el mismo color que el NavBar

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.primary.main, // Usa el color primario como fondo
        color: theme.palette.primary.contrastText, // Asegura un contraste adecuado
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body1">
          Mi increíble App de Juegos.
        </Typography>
        <Typography variant="body2" sx={{ color: 'inherit' }}> {/* Asegura que el color de texto se herede */}
          {'© '}
          <Link color="inherit" href="https://yourwebsite.com/">
            Your Website
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

