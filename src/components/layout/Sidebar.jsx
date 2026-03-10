import { useLocation, Link } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';

const PeopleIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </SvgIcon>
);

const SettingsIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </SvgIcon>
);

const SIDEBAR_ITEMS = [
  { to: '/dashboard', label: 'Clientes', icon: PeopleIcon },
  { to: '/configuracion', label: 'Configuración', icon: SettingsIcon },
];

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();

  const handleClick = (e) => {
    if (onNavigate) onNavigate();
  };

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        height: '100%',
        overflow: 'auto',
      }}
    >
      <List disablePadding sx={{ py: 1.5, px: 1 }}>
        {SIDEBAR_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to === '/dashboard' && location.pathname === '/');
          return (
            <ListItemButton
              key={to}
              component={Link}
              to={to}
              selected={active}
              onClick={handleClick}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                borderLeft: '3px solid transparent',
                ...(active && {
                  bgcolor: '#e8f4fd',
                  borderLeftColor: 'primary.main',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '&:hover': {
                    bgcolor: '#e0f0fc',
                  },
                }),
                '&:hover': {
                  bgcolor: active ? '#e0f0fc' : 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9375rem',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
