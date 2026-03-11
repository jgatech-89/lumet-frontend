import { Link } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../../utils/theme';
import { useThemeMode } from '../../../context/ThemeContext';
import { getChipEstadosVenta } from '../../../utils/chipColors';
import { useClientes } from '../logic/useClientes';
import { ClienteRow } from './ClienteRow';
import { SearchIcon } from '../../../utils/icons';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Pagination,
} from '@mui/material';

export function ClientesList() {
  const { isDark } = useThemeMode();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);
  const {
    clientes,
    total,
    pagina,
    inicio,
    fin,
    totalPaginas,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    handleChangePagina,
  } = useClientes();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        [COMPACT_MEDIA]: { borderRadius: 2 },
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          pb: { xs: 4, sm: 5 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          [COMPACT_MEDIA]: { p: 2, pb: 3 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 3, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1.5, gap: 1 } }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{ letterSpacing: '-0.02em', [COMPACT_MEDIA]: { fontSize: '1.25rem' } }}
            >
              Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ [COMPACT_MEDIA]: { fontSize: '0.8125rem' } }}>
              Administra tu base de clientes
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/nuevo-cliente"
            variant="contained"
            startIcon={<Typography component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1.25,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
              '&:hover': { boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)' },
              [COMPACT_MEDIA]: { px: 1.5, py: 0.75, fontSize: '0.8125rem' },
            }}
          >
            Nuevo cliente
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{ mb: 4, flexShrink: 0, [COMPACT_MEDIA]: { mb: 2.5, gap: 1 } }}
        >
          <TextField
            placeholder="Buscar cliente..."
            size="small"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '100%', minWidth: { xs: 0, sm: 280 } }}
          />
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 }, minWidth: { xs: 0, sm: 220 } }}>
            <InputLabel id="filtro-estado-label">Estado</InputLabel>
            <Select
              labelId="filtro-estado-label"
              value={filtroEstado}
              label="Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="">Seleccionar una opción</MenuItem>
              <MenuItem value="todos">Todos los estados</MenuItem>
              {Object.keys(CHIP_ESTADOS).map((est) => (
                <MenuItem key={est} value={est}>{est}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer
          sx={{
            flexShrink: 0,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            [COMPACT_MEDIA]: { borderRadius: 1 },
          }}
        >
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }}>Correo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }}>Vendedor</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8125rem', py: 1.5, [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 } }} align="center">Opciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ClienteRow row={row} chipEstados={CHIP_ESTADOS} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ flex: 1, minHeight: 0 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1.5,
            borderTop: '1px solid rgba(0,0,0,0.06)',
            bgcolor: 'background.paper',
            flexWrap: 'wrap',
            gap: 1.5,
            borderRadius: '0 0 12px 12px',
            [COMPACT_MEDIA]: { py: 1, px: 1.5, gap: 1 },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, [COMPACT_MEDIA]: { fontSize: '0.75rem' } }}>
            Mostrando {inicio}–{fin} de {total} clientes
          </Typography>
          <Pagination
            count={totalPaginas}
            page={pagina}
            onChange={handleChangePagina}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              flexShrink: 0,
              '& .MuiPagination-ul': { flexWrap: 'wrap', justifyContent: 'center' },
              [COMPACT_MEDIA]: { '& .MuiPaginationItem-root': { minWidth: 28, height: 28, fontSize: '0.75rem' } },
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );
}
