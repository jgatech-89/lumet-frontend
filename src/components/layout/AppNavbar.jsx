import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Box, Avatar, Menu, MenuItem, ButtonBase, Typography, SvgIcon, IconButton } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Logo from '../login/Logo';
import DarkModeToggle from './DarkModeToggle';

const PersonIcon = () => (
  <SvgIcon>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </SvgIcon>
);

const ArrowDropDownIcon = ({ sx, ...rest }) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={20}
    height={20}
    fill="currentColor"
    sx={{ flexShrink: 0, ml: 0.25, color: 'text.secondary', ...sx }}
    {...rest}
  >
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor" />
  </Box>
);

const MenuIcon = () => (
  <SvgIcon>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </SvgIcon>
);

const LogoutIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </SvgIcon>
);

const AppNavbar = ({ onMenuClick }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    // Navegación completa para reemplazar historial y evitar volver atrás a rutas ya cerradas
    window.location.replace('/login');
  };

  const displayName = (user?.primer_nombre || user?.primer_apellido)
    ? [user.primer_nombre, user.primer_apellido].filter(Boolean).join(' ').trim()
    : (user?.correo || 'Usuario');

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 64,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1.5, sm: 2 } }}>
        {onMenuClick && (
          <IconButton
            aria-label="Abrir menú"
            onClick={onMenuClick}
            sx={{
              mr: 1,
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box
          component={Link}
          to="/dashboard"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: { xs: 2, sm: 4 } }}
        >
          <Logo size="small" />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <DarkModeToggle showLabel={false} size="small" />
        </Box>
        {isAuthenticated && (
          <>
            <ButtonBase
              onClick={handleOpen}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              aria-controls={open ? 'user-menu' : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <PersonIcon />
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                {displayName}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'text.secondary', ml: 0.25 }} />
            </ButtonBase>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  elevation: 2,
                  sx: { mt: 1.5, borderRadius: 2, minWidth: 160 },
                },
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.25 }}>
                <LogoutIcon /> Cerrar sesión
              </MenuItem>
            </Menu>
          </>
        )}
        {!isAuthenticated && (
          <ButtonBase
            component={Link}
            to="/login"
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'text.primary',
              px: 1.5,
              py: 1,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            Login
          </ButtonBase>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppNavbar;
