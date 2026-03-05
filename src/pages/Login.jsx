import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Collapse, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import LoginLeftPanel from '../components/login/LoginLeftPanel';
import LoginForm from '../components/login/LoginForm';
import ConfirmCodeForm from '../components/login/ConfirmCodeForm';

import { consulta, mostrarError, setTokens } from '../js/funciones';

const CheckIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMsg, setAlertMsg] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const showAlert = (severity, msg) => {
    setAlertSeverity(severity);
    setAlertMsg(msg);
    setAlertOpen(true);
  };

  const handleLoginSubmit = (data) => {
    setIsLoading(true);
    setAlertOpen(false);
    setPendingEmail(data.email);

    const payload = { correo: data.email, password: data.password };

    consulta('auth/login',payload,'POST',(err, status, resp) => {
    setIsLoading(false);

        if (err) {
          if (status === 400 && resp) return showAlert('error', mostrarError(resp));
          if (status === 401) return showAlert('error', resp?.detail );
          return showAlert('error', 'Ocurrió un error al iniciar sesión.');
        }

        showAlert('success', resp?.mensaje);
        setStep(2);
      },
      false 
    );
  };

  const handleConfirmCode = (data) => {
    setIsLoading(true);
    setAlertOpen(false);

    const codigo = data?.code ?? data?.codigo ?? '';
    const payload = { correo: pendingEmail, codigo };

    consulta('auth/verificar-codigo',payload,'POST', (err, status, resp) => {
        setIsLoading(false);

        if (err) {
          if (status === 400 && resp) return showAlert('error', resp?.detail ?? mostrarError(resp));
          return showAlert('error', 'No se pudo verificar el código.');
        }

        const access = resp?.access ?? resp?.access_token;
        const refresh = resp?.refresh ?? resp?.refresh_token;

        if (!access) return showAlert('error', 'Ocurrió un error, contacta al administrador.');

        setTokens({ access, refresh });
        // user se llenará luego desde endpoint /me; por ahora solo correo/email
        login(access, { correo: pendingEmail, email: pendingEmail });

        showSnackbar('Sesión iniciada');
        navigate('/dashboard', { replace: true });
      },
      false 
    );
  };

  const handleResendCode = () => {
    setIsLoading(true);
    setAlertOpen(false);

    consulta('auth/resend-code',{ correo: pendingEmail },'POST',(err, status, resp) => {
        setIsLoading(false);

        if (err) {
          if (status === 400 && resp) return showAlert('error', mostrarError(resp));
          return showAlert('error', 'No se pudo reenviar el código.');
        }

        showAlert('success', resp?.mensaje);
        showSnackbar('Solicitud de reenvío enviada');
      },
      false 
    );
  };

  return (
    <Box     
    sx={{position: 'relative',display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <LoginLeftPanel />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          <Collapse in={alertOpen} sx={{ mb: 2 }}>
            <Alert
              severity={alertSeverity}
              icon={alertSeverity === 'success' ? <CheckIcon /> : undefined}
              action={
                <IconButton aria-label="cerrar" size="small" onClick={() => setAlertOpen(false)}>
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
