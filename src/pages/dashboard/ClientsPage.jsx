import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPACT_MEDIA } from '../../utils/theme';
import { useThemeMode } from '../../context/ThemeContext';
import { getChipEstadosVenta } from '../../utils/chipColors';
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
  Chip,
  IconButton,
  Stack,
  Pagination,
  SvgIcon,
} from '@mui/material';

const SearchIcon = () => (
  <SvgIcon fontSize="small" sx={{ color: 'text.secondary' }}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </SvgIcon>
);
const VisibilityIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </SvgIcon>
);
const EditIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </SvgIcon>
);
const DownloadIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </SvgIcon>
);
const DeleteIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </SvgIcon>
);


const clientesMock = [
  { id: 1, nombre: 'Ana López', telefono: '+1 123 456 789', correo: 'ana@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta completada' },
  { id: 2, nombre: 'Carlos Martinez', telefono: '+1 957 321 654', correo: 'carlos@empresa.com', vendedor: 'María López', estado: 'Venta cancelada' },
  { id: 3, nombre: 'Empresa ABC', telefono: '+1 444 555 886', correo: 'contacto@empresaabc.com', vendedor: 'Eduardo Magno', estado: 'Venta pospuesta' },
  { id: 4, nombre: 'Grupo Sigma', telefono: '+1 653 222 111', correo: 'info@gruposigma.com', vendedor: 'Pedro Sánchez', estado: 'Venta pendiente' },
  { id: 5, nombre: 'María García', telefono: '+1 555 111 222', correo: 'maria@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta completada' },
  { id: 6, nombre: 'Luis Fernández', telefono: '+1 555 333 444', correo: 'luis@empresa.com', vendedor: 'María López', estado: 'Venta cancelada' },
  { id: 7, nombre: 'Tech Solutions', telefono: '+1 555 666 777', correo: 'contacto@techsol.com', vendedor: 'Pedro Sánchez', estado: 'Venta pospuesta' },
  { id: 8, nombre: 'Laura Pérez', telefono: '+1 555 888 999', correo: 'laura@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta pendiente' },
  { id: 9, nombre: 'Roberto Díaz', telefono: '+1 555 000 111', correo: 'roberto@empresa.com', vendedor: 'María López', estado: 'Venta completada' },
  { id: 10, nombre: 'Consultores SA', telefono: '+1 555 222 333', correo: 'info@consultores.com', vendedor: 'Pedro Sánchez', estado: 'Venta cancelada' },
  { id: 11, nombre: 'Sofia Ruiz', telefono: '+1 555 444 555', correo: 'sofia@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta pospuesta' },
  { id: 12, nombre: 'Andrés Mora', telefono: '+1 555 666 777', correo: 'andres@empresa.com', vendedor: 'María López', estado: 'Venta pendiente' },
  { id: 13, nombre: 'Inversiones XYZ', telefono: '+1 555 888 000', correo: 'contacto@inversiones.com', vendedor: 'Pedro Sánchez', estado: 'Venta completada' },
  { id: 14, nombre: 'Carmen Soto', telefono: '+1 555 111 222', correo: 'carmen@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta cancelada' },
  { id: 15, nombre: 'Diego Reyes', telefono: '+1 555 333 444', correo: 'diego@empresa.com', vendedor: 'María López', estado: 'Venta pospuesta' },
  { id: 16, nombre: 'Logística Global', telefono: '+1 555 555 666', correo: 'info@logistica.com', vendedor: 'Pedro Sánchez', estado: 'Venta pendiente' },
  { id: 17, nombre: 'Elena Vega', telefono: '+1 555 777 888', correo: 'elena@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta completada' },
  { id: 18, nombre: 'Javier López', telefono: '+1 555 999 000', correo: 'javier@empresa.com', vendedor: 'María López', estado: 'Venta cancelada' },
  { id: 19, nombre: 'Servicios Pro', telefono: '+1 555 121 212', correo: 'contacto@serviciospro.com', vendedor: 'Pedro Sánchez', estado: 'Venta pospuesta' },
  { id: 20, nombre: 'Patricia Cruz', telefono: '+1 555 343 454', correo: 'patricia@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta pendiente' },
  { id: 21, nombre: 'Miguel Ángel', telefono: '+1 555 565 676', correo: 'miguel@empresa.com', vendedor: 'María López', estado: 'Venta completada' },
  { id: 22, nombre: 'Marketing Plus', telefono: '+1 555 787 898', correo: 'info@marketingplus.com', vendedor: 'Pedro Sánchez', estado: 'Venta cancelada' },
  { id: 23, nombre: 'Isabel Navarro', telefono: '+1 555 909 010', correo: 'isabel@empresa.com', vendedor: 'Eduardo Magno', estado: 'Venta pospuesta' },
  { id: 24, nombre: 'Francisco Jiménez', telefono: '+1 555 232 434', correo: 'francisco@empresa.com', vendedor: 'María López', estado: 'Venta pendiente' },
  { id: 25, nombre: 'Desarrollo Web SA', telefono: '+1 555 656 878', correo: 'contacto@devweb.com', vendedor: 'Pedro Sánchez', estado: 'Venta completada' },
];

const TOTAL_CLIENTES = clientesMock.length;
const FILAS_POR_PAGINA = 5;

const ClientsPage = () => {
  const { isDark } = useThemeMode();
  const CHIP_ESTADOS = getChipEstadosVenta(isDark);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const handleChangePagina = (_, value) => setPagina(value);

  const inicio = (pagina - 1) * FILAS_POR_PAGINA + 1;
  const fin = Math.min(pagina * FILAS_POR_PAGINA, TOTAL_CLIENTES);
  const filasPagina = clientesMock.slice((pagina - 1) * FILAS_POR_PAGINA, pagina * FILAS_POR_PAGINA);

  const actionBtnBase = {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    [COMPACT_MEDIA]: { width: 28, height: 28, minWidth: 28, minHeight: 28 },
    padding: 0,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  };
  const actionBtnBlue = {
    ...actionBtnBase,
    bgcolor: isDark ? 'rgba(33, 150, 243, 0.22)' : 'rgba(33, 150, 243, 0.1)',
    color: 'primary.main',
    '&:hover': { bgcolor: isDark ? 'rgba(33, 150, 243, 0.35)' : 'rgba(33, 150, 243, 0.18)' },
  };
  const actionBtnRed = {
    ...actionBtnBase,
    bgcolor: isDark ? 'rgba(244, 67, 54, 0.22)' : 'rgba(244, 67, 54, 0.1)',
    color: 'error.main',
    '&:hover': { bgcolor: isDark ? 'rgba(244, 67, 54, 0.35)' : 'rgba(244, 67, 54, 0.18)' },
  };

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
        {/* Encabezado */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{
            mb: 3,
            flexShrink: 0,
            [COMPACT_MEDIA]: { mb: 1.5, gap: 1 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{
                letterSpacing: '-0.02em',
                [COMPACT_MEDIA]: { fontSize: '1.25rem' },
              }}
            >
              Clientes
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ [COMPACT_MEDIA]: { fontSize: '0.8125rem' } }}
            >
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

        {/* Filtros */}
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

        {/* Tabla: solo el espacio necesario */}
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
              {filasPagina.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell sx={{ py: 1.5, fontWeight: 500, [COMPACT_MEDIA]: { py: 1, fontSize: '0.8125rem' } }}>{row.nombre}</TableCell>
                  <TableCell sx={{ py: 1.5, color: 'text.secondary', [COMPACT_MEDIA]: { py: 1, fontSize: '0.8125rem' } }}>{row.telefono}</TableCell>
                  <TableCell sx={{ py: 1.5, color: 'text.secondary', [COMPACT_MEDIA]: { py: 1, fontSize: '0.8125rem' } }}>{row.correo}</TableCell>
                  <TableCell sx={{ py: 1.5, color: 'text.secondary', [COMPACT_MEDIA]: { py: 1, fontSize: '0.8125rem' } }}>{row.vendedor ?? '-'}</TableCell>
                  <TableCell sx={{ py: 1.5, [COMPACT_MEDIA]: { py: 1 } }}>
                    <Chip
                      label={row.estado}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 500,
                        borderRadius: 999,
                        px: 1.25,
                        bgcolor: CHIP_ESTADOS[row.estado]?.bg ?? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                        color: CHIP_ESTADOS[row.estado]?.color ?? 'text.secondary',
                        '& .MuiChip-label': { px: 0.5 },
                        [COMPACT_MEDIA]: { fontSize: '0.6875rem', px: 0.75, height: 20 },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5, [COMPACT_MEDIA]: { py: 1 } }}>
                    <Stack direction="row" justifyContent="center" spacing={0.75}>
                      <IconButton
                        size="small"
                        aria-label="Ver"
                        title="Ver"
                        sx={actionBtnBlue}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Editar"
                        title="Editar"
                        sx={actionBtnBlue}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Descargar"
                        title="Descargar"
                        sx={actionBtnBlue}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Eliminar"
                        title="Eliminar"
                        sx={actionBtnRed}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ flex: 1, minHeight: 0 }} />

        {/* Pie de tabla - siempre visible en la parte inferior */}
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0, [COMPACT_MEDIA]: { fontSize: '0.75rem' } }}
          >
            Mostrando {inicio}–{fin} de {TOTAL_CLIENTES} clientes
          </Typography>
          <Pagination
            count={Math.ceil(TOTAL_CLIENTES / FILAS_POR_PAGINA)}
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
};

export default ClientsPage;
