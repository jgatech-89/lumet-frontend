import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import AppRouter from './app/router';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <SnackbarProvider>
        <AppRouter />
      </SnackbarProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
