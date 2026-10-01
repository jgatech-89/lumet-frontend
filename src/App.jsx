import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChoicesProvider } from './context/ChoicesContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { GlobalFeedbackProvider } from './context/GlobalFeedbackContext';
import AppRouter from './routes/router';
import AccessSuspended from './pages/AccessSuspended';
import { isAccessSuspended } from './utils/subscription';

const App = () => (
  <ThemeModeProvider>
    <CssBaseline />
    {isAccessSuspended() ? (
      <AccessSuspended />
    ) : (
    <AuthProvider>
      <ChoicesProvider>
        <GlobalFeedbackProvider>
          <SnackbarProvider>
            <AppRouter />
          </SnackbarProvider>
        </GlobalFeedbackProvider>
      </ChoicesProvider>
    </AuthProvider>
    )}
  </ThemeModeProvider>
);

export default App;
