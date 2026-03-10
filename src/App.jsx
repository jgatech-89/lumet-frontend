import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { GlobalFeedbackProvider } from './context/GlobalFeedbackContext';
import AppRouter from './routes/router';

const App = () => (
  <ThemeModeProvider>
    <CssBaseline />
    <AuthProvider>
      <GlobalFeedbackProvider>
        <SnackbarProvider>
          <AppRouter />
        </SnackbarProvider>
      </GlobalFeedbackProvider>
    </AuthProvider>
  </ThemeModeProvider>
);

export default App;
