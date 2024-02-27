// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E64EC', // Color primario personalizado
    },
    secondary: {
      main: '#FFC107', // Color secundario personalizado
    },
  },
  typography: {
    // Aquí puedes personalizar la tipografía global si es necesario
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      // Estilo personalizado para variantes h1
    },
    body1: {
      // Estilo para el texto del cuerpo
    },
    // Continúa personalizando según tus necesidades
  },
  components: {
    // Personalización específica de componentes, solo si es necesario
    MuiButton: {
      styleOverrides: {
        root: {
          // Si decides hacer ajustes mínimos en botones, por ejemplo
        },
      },
    },
    // Puedes incluir otros componentes aquí si es necesario
  },
  // No es necesario definir una sección 'custom' si prefieres apegarte a los estilos de MUI
});

export default theme;
