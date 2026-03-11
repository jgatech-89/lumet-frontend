import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Collapse, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import LoginLeftPanel from '../components/login/LoginLeftPanel';
import LoginForm from '../components/login/LoginForm';
import ConfirmCodeForm from '../components/login/ConfirmCodeForm';
import { post, getErrorMessage } from '../utils/funciones';
import { setTokens, parseAuthResponse } from '../utils/api';
import { CheckIcon } from '../utils/icons';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMsg, setAlertMsg] = useState('');

  const navigate = useNavigate();
  const { login, fetchMe } = useAuth();
  const { showSnackbar } = useSnackbar();

  const showAlert = (severity, msg) => {
    setAlertSeverity(severity);
    setAlertMsg(msg);
    setAlertOpen(true);
  };

  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    setAlertOpen(false);
    setPendingEmail(data.email);
    try {
      const { data: resp } = await post('auth/login', { correo: data.email, password: data.password }, false);
      showAlert('success', resp?.mensaje);
      setStep(2);
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'Ocurrió un error al iniciar sesión.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async (data) => {
    setIsLoading(true);
    setAlertOpen(false);
    try {
      const { data: resp } = await post('auth/verificar-codigo', { correo: pendingEmail, codigo: data?.code ?? data?.codigo ?? '' }, false);
      const { access, refresh } = parseAuthResponse(resp);
      if (!access) {
        showAlert('error', 'Ocurrió un error, contacta al administrador.');
        return;
      }
      setTokens({ access, refresh });
      login(access);
      await fetchMe();
      showSnackbar('Sesión iniciada');
      navigate('/dashboard', { replace: true });
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo completar el inicio de sesión.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setAlertOpen(false);
    try {
      const { data: resp } = await post('auth/resend-code', { correo: pendingEmail }, false);
      showAlert('success', resp?.mensaje);
      showSnackbar('Solicitud de reenvío enviada');
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo reenviar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box     
    sx={{position: 'relative',display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <LoginLeftPanel />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          <Collapse in={alertOpen} sx={{ mb: 2 }}>
            <Alert
              role="alert"
              aria-live="polite"
              severity={alertSeverity}
              icon={alertSeverity === 'success' ? <CheckIcon /> : undefined}
              action={
                <IconButton aria-label="Cerrar mensaje" size="small" onClick={() => setAlertOpen(false)}>
                  ✕
                </IconButton>
              }
            >
              {alertMsg}
            </Alert>
          </Collapse>

          {step === 1 ? (
            <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
          ) : (
            <ConfirmCodeForm
              email={pendingEmail}
              onSubmit={handleConfirmCode}
              onResendCode={handleResendCode}
              isLoading={isLoading}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
