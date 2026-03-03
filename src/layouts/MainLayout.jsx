import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <Typography
            component={Link}
            to="/dashboard"
            variant="h6"
            sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}
          >
            Lumet
          </Typography>
          {isAuthenticated && (
            <>
              <Button
                component={Link}
                to="/dashboard"
                color="inherit"
                sx={{ opacity: location.pathname === '/dashboard' ? 1 : 0.8 }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/admin"
                color="inherit"
                sx={{ opacity: location.pathname === '/admin' ? 1 : 0.8 }}
              >
                Admin
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Salir
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Button component={Link} to="/login" color="inherit">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
