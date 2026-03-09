import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './utils/theme';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { GlobalFeedbackProvider } from './context/GlobalFeedbackContext';
import AppRouter from './routes/router';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <GlobalFeedbackProvider>
        <SnackbarProvider>
          <AppRouter />
        </SnackbarProvider>
      </GlobalFeedbackProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
