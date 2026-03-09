import { Box } from '@mui/material';
import AppNavbar from '../components/layout/AppNavbar';
import Sidebar from '../components/layout/Sidebar';

const APP_BAR_HEIGHT = 64;

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppNavbar />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          pt: `${APP_BAR_HEIGHT}px`,
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            p: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
