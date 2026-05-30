import { useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { COMPACT_MEDIA } from '../../utils/theme';
import { APP_BAR_HEIGHT } from '../../utils/layout';
import AppNavbar from './AppNavbar';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleToggleSidebar = () => setSidebarOpen((o) => !o);

  const sidebarContent = <Sidebar onNavigate={isDesktop ? undefined : handleCloseSidebar} />;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        '@supports (height: 100dvh)': { height: '100dvh' },
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <AppNavbar onMenuClick={isDesktop ? undefined : handleToggleSidebar} />
      <Box
        sx={{
          position: 'absolute',
          top: APP_BAR_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {isDesktop ? (
          <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, minHeight: 0, overflow: 'hidden' }}>{sidebarContent}</Box>
        ) : (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={handleCloseSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
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
            height: '100%',
            p: { xs: 2, sm: 2.5, md: 3 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            boxSizing: 'border-box',
            [COMPACT_MEDIA]: { p: 2 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.72rem',
              lineHeight: 1.2,
              pt: 0.5,
              pb: 0.25,
              userSelect: 'none',
            }}
          >
            Powered by JGA Tech 2026
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
