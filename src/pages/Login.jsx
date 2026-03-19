import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Collapse, IconButton, Typography, TextField, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import LoginLeftPanel from '../components/login/LoginLeftPanel';
import LoginForm from '../components/login/LoginForm';
import ConfirmCodeForm from '../components/login/ConfirmCodeForm';
import { post, getErrorMessage } from '../utils/funciones';
import { setTokens, parseAuthResponse } from '../utils/api';
import { CheckIcon } from '../utils/icons';
import { LoadingButton } from '../components/loading';

/** Estado del panel derecho: login (con paso 1 o 2) o flujo de recuperación */
const PANEL_LOGIN = 'login';
const PANEL_FORGOT_REQUEST = 'forgot-request';
const PANEL_FORGOT_CODE = 'forgot-code';
const PANEL_FORGOT_NEW_PASSWORD = 'forgot-new-password';

const formAnimationSx = {
  width: '100%',
  maxWidth: 460,
  mx: 'auto',
  animation: 'fadeIn 0.6s ease-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    minHeight: 60,
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3', borderWidth: 2 },
      boxShadow: '0 0 0 3px rgba(33,150,243,0.15)',
    },
  },
};

const primaryButtonSx = {
  mt: 2.5,
  height: 60,
  borderRadius: 2,
  bgcolor: '#2196f3',
  color: '#ffffff',
  fontWeight: 700,
  boxShadow: 'none',
  transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover:not(.Mui-disabled)': {
    bgcolor: '#4dabf5',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
  },
};

const linkButtonSx = {
  color: 'text.secondary',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  p: 0,
  font: 'inherit',
  '&:hover': { textDecoration: 'underline', color: '#4dabf5' },
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [pendingEmail, setPendingEmail] = useState('');
  /** Correo auth: destinatario real del OTP; se muestra en mensajes de envío de código. */
  const [correoAuthDisplay, setCorreoAuthDisplay] = useState('');

  const [panelMode, setPanelMode] = useState(PANEL_LOGIN);
  const [forgotEmail, setForgotEmail] = useState('');
  /** Correo auth en flujo de recuperación de contraseña. */
  const [forgotCorreoAuthDisplay, setForgotCorreoAuthDisplay] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState('');

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

  const backToLogin = () => {
    setPanelMode(PANEL_LOGIN);
    setStep(1);
    setPendingEmail('');
    setCorreoAuthDisplay('');
    setForgotEmail('');
    setForgotCorreoAuthDisplay('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldError('');
  };

  // —— Login ——
  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    setAlertOpen(false);
    setPendingEmail(data.email);
    try {
      const { data: resp } = await post('auth/login', { correo: data.email, password: data.password }, false);
      if (resp?.correo_auth) setCorreoAuthDisplay(resp.correo_auth);
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
      if (resp?.correo_auth) setCorreoAuthDisplay(resp.correo_auth);
      showAlert('success', resp?.mensaje);
      showSnackbar('Solicitud de reenvío enviada');
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo reenviar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  // —— Recuperación de contraseña ——
  const handleForgotRequestCode = async (e) => {
    e.preventDefault();
    setAlertOpen(false);
    setFieldError('');
    const input = e.target.querySelector('input[type="email"]');
    const correo = (input?.value || '').trim().toLowerCase();
    if (!correo) {
      showAlert('error', 'Ingresa tu correo electrónico.');
      return;
    }
    setForgotEmail(correo);
    setIsLoading(true);
    try {
      const { data: resp } = await post('auth/forgot-password/request', { correo }, false);
      if (resp?.correo_auth) setForgotCorreoAuthDisplay(resp.correo_auth);
      showAlert('success', resp?.mensaje);
      setPanelMode(PANEL_FORGOT_CODE);
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo enviar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotResendCode = async () => {
    if (!forgotEmail) return;
    setIsLoading(true);
    setAlertOpen(false);
    try {
      const { data: resp } = await post('auth/forgot-password/request', { correo: forgotEmail }, false);
      if (resp?.correo_auth) setForgotCorreoAuthDisplay(resp.correo_auth);
      showAlert('success', resp?.mensaje);
      showSnackbar('Solicitud de reenvío enviada');
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo reenviar el código.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotVerifyCode = async (data) => {
    setIsLoading(true);
    setAlertOpen(false);
    const codigo = data?.code ?? data?.codigo ?? '';
    try {
      const { data: resp } = await post('auth/forgot-password/verify', { correo: forgotEmail, codigo }, false);
      if (resp?.token) {
        setResetToken(resp.token);
        setPanelMode(PANEL_FORGOT_NEW_PASSWORD);
      } else {
        showAlert('error', 'No se recibió el token. Intenta de nuevo.');
      }
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'Código inválido o expirado.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSetPassword = async (e) => {
    e.preventDefault();
    setAlertOpen(false);
    setFieldError('');
    const pass = (newPassword || '').trim();
    const conf = (confirmPassword || '').trim();
    if (!pass) {
      setFieldError('La contraseña es obligatoria.');
      return;
    }
    if (pass.length < 8) {
      setFieldError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (pass !== conf) {
      setFieldError('Las contraseñas no coinciden.');
      return;
    }
    if (!resetToken) {
      showAlert('error', 'Sesión de recuperación expirada. Solicita nuevamente el código.');
      return;
    }
    setIsLoading(true);
    try {
      const { data: resp } = await post(
        'auth/forgot-password/set',
        { token: resetToken, nueva_password: pass, confirmacion: conf },
        false
      );
      showAlert('success', resp?.mensaje ?? 'Contraseña actualizada.');
      showSnackbar('Contraseña actualizada');
      setTimeout(backToLogin, 1500);
    } catch (e) {
      showAlert('error', getErrorMessage(e, 'No se pudo actualizar la contraseña.'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderRightPanel = () => {
    if (panelMode === PANEL_LOGIN) {
      if (step === 1) {
        return (
          <LoginForm
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onForgotPassword={() => setPanelMode(PANEL_FORGOT_REQUEST)}
          />
        );
      }
      return (
        <ConfirmCodeForm
          email={correoAuthDisplay || pendingEmail}
          onSubmit={handleConfirmCode}
          onResendCode={handleResendCode}
          isLoading={isLoading}
        />
      );
    }

    if (panelMode === PANEL_FORGOT_REQUEST) {
      return (
        <Box component="form" onSubmit={handleForgotRequestCode} noValidate sx={formAnimationSx}>
          <Typography component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
            Recuperar contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Ingresa el correo electrónico de tu cuenta y te enviaremos un código de verificación.
          </Typography>
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            name="email"
            margin="normal"
            size="medium"
            sx={inputSx}
            inputProps={{ 'aria-label': 'Correo electrónico' }}
          />
          <Link component="button" type="button" variant="body2" onClick={backToLogin} sx={{ display: 'block', mt: 2, mb: 2, ...linkButtonSx }}>
            Volver al inicio de sesión
          </Link>
          <LoadingButton type="submit" fullWidth variant="contained" loading={isLoading} loadingText="Enviando..." sx={primaryButtonSx}>
            Enviar código
          </LoadingButton>
        </Box>
      );
    }

    if (panelMode === PANEL_FORGOT_CODE) {
      return (
        <>
          <ConfirmCodeForm
            email={forgotCorreoAuthDisplay || forgotEmail}
            onSubmit={handleForgotVerifyCode}
            onResendCode={handleForgotResendCode}
            isLoading={isLoading}
          />
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Link component="button" type="button" variant="body2" onClick={() => { setPanelMode(PANEL_FORGOT_REQUEST); setForgotEmail(''); setForgotCorreoAuthDisplay(''); }} sx={linkButtonSx}>
              Cambiar correo
            </Link>
            <Link component="button" type="button" variant="body2" onClick={backToLogin} sx={linkButtonSx}>
              Volver al inicio de sesión
            </Link>
          </Box>
        </>
      );
    }

    if (panelMode === PANEL_FORGOT_NEW_PASSWORD) {
      return (
        <Box component="form" onSubmit={handleForgotSetPassword} noValidate sx={formAnimationSx}>
          <Typography component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
            Nueva contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Ingresa tu nueva contraseña y su confirmación.
          </Typography>
          <TextField
            fullWidth
            label="Nueva contraseña"
            type="password"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={Boolean(fieldError)}
            sx={inputSx}
            inputProps={{ 'aria-label': 'Nueva contraseña', minLength: 8 }}
          />
          <TextField
            fullWidth
            label="Confirmar contraseña"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            sx={inputSx}
            inputProps={{ 'aria-label': 'Confirmar contraseña' }}
          />
          <LoadingButton type="submit" fullWidth variant="contained" loading={isLoading} loadingText="Guardando..." sx={primaryButtonSx}>
            Actualizar contraseña
          </LoadingButton>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
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

          {renderRightPanel()}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
