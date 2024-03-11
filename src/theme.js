// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E64EC',
    },
    secondary: {
      main: '#FFC107',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Estilos para botones si es necesario
        },
      },
    },
  },
  heroSection: {
    heroContainer: {
      position: 'relative',
      minHeight: '50vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '36px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(35, 35, 35, 0.5)',
      zIndex: 0,
    },
    content: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
    },
    logo: {
      width: '400px',
      marginBottom: '40px',
    },
    title: {
      color: '#fff',
      marginBottom: '20px',
    },
    subtitle: {
      color: '#fff',
      marginBottom: '20px',
    },
    startButton: {
      marginTop: '24px',
    },
  },
});

export default theme;
