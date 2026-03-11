import { useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { COMPACT_MEDIA } from '../../utils/theme';
import AppNavbar from './AppNavbar';
import Sidebar from './Sidebar';

const APP_BAR_HEIGHT = 64;
const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleToggleSidebar = () => setSidebarOpen((o) => !o);

  const sidebarContent = <Sidebar onNavigate={isDesktop ? undefined : handleCloseSidebar} />;

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppNavbar onMenuClick={isDesktop ? undefined : handleToggleSidebar} />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          pt: `${APP_BAR_HEIGHT}px`,
        }}
      >
        {isDesktop ? (
          <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>{sidebarContent}</Box>
        ) : (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={handleCloseSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
                top: APP_BAR_HEIGHT,
                height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
                borderRight: '1px solid rgba(0,0,0,0.06)',
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            p: { xs: 4, sm: 5 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            [COMPACT_MEDIA]: { p: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
