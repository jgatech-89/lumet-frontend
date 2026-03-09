import { useState } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';

const SearchIcon = () => (
  <SvgIcon fontSize="small" sx={{ color: 'text.secondary' }}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </SvgIcon>
);

const EditIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </SvgIcon>
);

const DeleteIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </SvgIcon>
);

const actionBtnBase = {
  width: 36,
  height: 36,
  minWidth: 36,
  minHeight: 36,
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
  bgcolor: 'rgba(33, 150, 243, 0.1)',
  color: 'primary.main',
  '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.18)' },
};

const actionBtnRed = {
  ...actionBtnBase,
  bgcolor: 'rgba(244, 67, 54, 0.1)',
  color: 'error.main',
  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.18)' },
};

const CHIP_ESTADO_ACTIVO = {
  bg: 'rgba(46, 125, 50, 0.12)',
  color: '#1b5e20',
};

const CHIP_TIPO_CAMPO = {
  bg: 'rgba(33, 150, 243, 0.12)',
  color: '#0d47a1',
};

const CHIP_TIPO_EMPRESA = {
  bg: 'rgba(33, 150, 243, 0.12)',
  color: '#0d47a1',
};

// Mock data
const empresasMock = [
  { id: 1, nombre: 'Telefonía', estado: 'Activa' },
  { id: 2, nombre: 'Energía', estado: 'Activa' },
  { id: 3, nombre: 'ONG', estado: 'Activa' },
];

const serviciosMock = [
  { id: 1, servicio: 'Luz', tipoEmpresa: 'Energía', estado: 'Activa' },
  { id: 2, servicio: 'Gas', tipoEmpresa: 'Energía', estado: 'Activa' },
  { id: 3, servicio: 'Portabilidad', tipoEmpresa: 'Telefonía', estado: 'Activa' },
  { id: 4, servicio: 'Donación', tipoEmpresa: 'ONG', estado: 'Activa' },
];

const camposMock = [
  { id: 1, campo: 'CUPS luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Texto', estado: 'Activa' },
  { id: 2, campo: 'Tarifa luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Select', estado: 'Activa' },
  { id: 3, campo: 'Portabilidad', empresa: 'Telefonía', servicio: 'Portabilidad', tipoCampo: 'Select', estado: 'Activa' },
  { id: 4, campo: 'Tipo de donación', empresa: 'ONG', servicio: 'Donación', tipoCampo: 'Select', estado: 'Activa' },
];

const colaboradoresMock = [
  { id: 1, nombre: 'Eduardo Magno', estado: 'Activo' },
];

const TAB_CONFIG = {
  empresa: {
    label: 'Empresa',
    addLabel: 'Añadir empresa',
    searchPlaceholder: 'Buscar empresa...',
    countLabel: 'empresas',
    columns: ['Nombre', 'Estado', 'Opciones'],
    data: empresasMock,
  },
  servicios: {
    label: 'Servicios',
    addLabel: 'Añadir servicio',
    searchPlaceholder: 'Buscar servicio...',
    countLabel: 'servicios',
    columns: ['Servicio', 'Tipo de empresa', 'Estado', 'Opciones'],
    data: serviciosMock,
  },
  campos: {
    label: 'Campos',
    addLabel: 'Añadir campo',
    searchPlaceholder: 'Buscar campo...',
    countLabel: 'campos',
    columns: ['Campo', 'Empresa', 'Servicio', 'Tipo de campo', 'Estado', 'Opciones'],
    data: camposMock,
  },
  colaborador: {
    label: 'Colaborador',
    addLabel: 'Añadir colaborador',
    searchPlaceholder: 'Buscar colaborador...',
    countLabel: 'colaboradores',
    columns: ['Nombre', 'Estado', 'Opciones'],
    data: colaboradoresMock,
  },
};

const FILAS_POR_PAGINA = 5;

const ConfigurationPage = () => {
  const [tabActual, setTabActual] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const tabKeys = ['empresa', 'servicios', 'campos', 'colaborador'];
  const config = TAB_CONFIG[tabKeys[tabActual]];
  const totalItems = config.data.length;
  const inicio = (pagina - 1) * FILAS_POR_PAGINA + 1;
  const fin = Math.min(pagina * FILAS_POR_PAGINA, totalItems);
  const filasPagina = config.data.slice((pagina - 1) * FILAS_POR_PAGINA, pagina * FILAS_POR_PAGINA);

  const handleChangeTab = (_, value) => {
    setTabActual(value);
    setPagina(1);
  };

  const handleChangePagina = (_, value) => setPagina(value);

  const getEstadoChip = (estado) => {
    const isActivo = estado === 'Activa' || estado === 'Activo';
    return {
      bg: isActivo ? CHIP_ESTADO_ACTIVO.bg : 'rgba(0,0,0,0.06)',
      color: isActivo ? CHIP_ESTADO_ACTIVO.color : 'text.secondary',
    };
  };

  const renderTableRow = (row) => {
    switch (tabKeys[tabActual]) {
      case 'empresa':
        return (
          <>
            <TableCell sx={{ py: 1.75, fontWeight: 500 }}>{row.nombre}</TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.estado}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: getEstadoChip(row.estado).bg,
                  color: getEstadoChip(row.estado).color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ py: 1.75 }}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'servicios':
        return (
          <>
            <TableCell sx={{ py: 1.75, fontWeight: 500 }}>{row.servicio}</TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.tipoEmpresa}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: CHIP_TIPO_EMPRESA.bg,
                  color: CHIP_TIPO_EMPRESA.color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.estado}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: getEstadoChip(row.estado).bg,
                  color: getEstadoChip(row.estado).color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ py: 1.75 }}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'campos':
        return (
          <>
            <TableCell sx={{ py: 1.75, fontWeight: 500 }}>{row.campo}</TableCell>
            <TableCell sx={{ py: 1.75, color: 'text.secondary' }}>{row.empresa}</TableCell>
            <TableCell sx={{ py: 1.75, color: 'text.secondary' }}>{row.servicio}</TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.tipoCampo}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: CHIP_TIPO_CAMPO.bg,
                  color: CHIP_TIPO_CAMPO.color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.estado}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: getEstadoChip(row.estado).bg,
                  color: getEstadoChip(row.estado).color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ py: 1.75 }}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'colaborador':
        return (
          <>
            <TableCell sx={{ py: 1.75, fontWeight: 500 }}>{row.nombre}</TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={row.estado}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.25,
                  bgcolor: getEstadoChip(row.estado).bg,
                  color: getEstadoChip(row.estado).color,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </TableCell>
            <TableCell align="center" sx={{ py: 1.75 }}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 3, flexShrink: 0 }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
              Configuración
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra la configuración del sistema
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <Tabs
            value={tabActual}
            onChange={handleChangeTab}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.9375rem' },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab label="Empresa" />
            <Tab label="Servicios" />
            <Tab label="Campos" />
            <Tab label="Colaborador" />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<Typography component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1.25,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
              },
            }}
          >
            {config.addLabel}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mb: 3, flexShrink: 0 }}>
          <TextField
            placeholder={config.searchPlaceholder}
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
            sx={{ minWidth: { sm: 280 } }}
          />
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="filtro-estado-label">Estado</InputLabel>
            <Select
              labelId="filtro-estado-label"
              value={filtroEstado}
              label="Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="todos">Todos los estados</MenuItem>
              <MenuItem value="activa">Activa</MenuItem>
              <MenuItem value="inactiva">Inactiva</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            flex: 1,
            minHeight: 200,
            overflow: 'visible',
          }}
        >
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {config.columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.8125rem',
                      py: 1.5,
                      ...(col === 'Opciones' && { align: 'center' }),
                    }}
                    align={col === 'Opciones' ? 'center' : 'left'}
                  >
                    {col}
                  </TableCell>
                ))}
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
                  {renderTableRow(row)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
            gap: 1,
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Mostrando {inicio}–{fin} de {totalItems} {config.countLabel}
          </Typography>
          <Pagination
            count={Math.max(1, Math.ceil(totalItems / FILAS_POR_PAGINA))}
            page={pagina}
            onChange={handleChangePagina}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default ConfigurationPage;
