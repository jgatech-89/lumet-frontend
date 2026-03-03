import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LoginLeftPanel from '../components/login/LoginLeftPanel';
import LoginForm from '../components/login/LoginForm';

/**
 * JWT de demo (solo desarrollo). En producción el token lo devuelve el backend.
 */
const createMockToken = (payload, expSeconds = 3600) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expSeconds }));
  return `${header}.${body}.signature`;
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (data) => {
    setIsLoading(true);
    const role = data.email?.toLowerCase().includes('admin') ? 'admin' : 'user';
    const token = createMockToken({ sub: data.email, role });
    login(token, { sub: data.email, email: data.email, role });
    navigate('/dashboard', { replace: true });
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        minWidth: 0,
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#f8fbff',
        backgroundImage: `
          radial-gradient(ellipse 120% 80% at 0% 0%, rgba(211, 234, 253, 0.45) 0%, transparent 55%),
          radial-gradient(ellipse 100% 70% at 100% 100%, rgba(166, 213, 250, 0.22) 0%, transparent 55%),
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(211, 234, 253, 0.15) 0%, transparent 70%),
          linear-gradient(180deg, rgba(211, 234, 253, 0.12) 0%, transparent 50%)
        `,
      }}
    >
      {/* Glows ambientales — fondo único en toda la pantalla */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          backgroundColor: 'rgba(211, 234, 253, 0.35)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          right: -60,
          width: 380,
          height: 380,
          borderRadius: '50%',
          backgroundColor: 'rgba(166, 213, 250, 0.22)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <LoginLeftPanel />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { xs: 1, md: '0 0 50%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: { xs: '100%', md: '50%' },
          px: { xs: 2, sm: 4 },
          py: 3,
        }}
      >
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Box>
    </Box>
  );
};

export default Login;
