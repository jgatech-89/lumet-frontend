import { useState } from 'react';
import { COMPACT_MEDIA } from '../../utils/theme';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const CloseIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </SvgIcon>
);

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

const EyeIcon = () => (
  <SvgIcon fontSize="small">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </SvgIcon>
);

const actionBtnBase = {
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  padding: 0,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid transparent',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  [COMPACT_MEDIA]: { width: 28, height: 28, minWidth: 28, minHeight: 28 },
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

const actionBtnGray = {
  ...actionBtnBase,
  bgcolor: 'rgba(0, 0, 0, 0.06)',
  color: 'text.secondary',
  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' },
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

// Mock data inicial
const EMPRESAS_INICIAL = [
  { id: 1, nombre: 'Telefonía', estado: 'Activa' },
  { id: 2, nombre: 'Energía', estado: 'Activa' },
  { id: 3, nombre: 'ONG', estado: 'Activa' },
];

const SERVICIOS_INICIAL = [
  { id: 1, servicio: 'Luz', tipoEmpresa: 'Energía', estado: 'Activa' },
  { id: 2, servicio: 'Gas', tipoEmpresa: 'Energía', estado: 'Activa' },
  { id: 3, servicio: 'Portabilidad', tipoEmpresa: 'Telefonía', estado: 'Activa' },
  { id: 4, servicio: 'Donación', tipoEmpresa: 'ONG', estado: 'Activa' },
];

const CAMPOS_INICIAL = [
  { id: 1, campo: 'CUPS luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Texto', estado: 'Activa', opciones: [] },
  { id: 2, campo: 'Tarifa luz', empresa: 'Energía', servicio: 'Luz', tipoCampo: 'Select', estado: 'Activa', opciones: ['Básica', 'Premium'] },
  { id: 3, campo: 'Portabilidad', empresa: 'Telefonía', servicio: 'Portabilidad', tipoCampo: 'Select', estado: 'Activa', opciones: ['Sí', 'No'] },
  { id: 4, campo: 'Tipo de donación', empresa: 'ONG', servicio: 'Donación', tipoCampo: 'Select', estado: 'Activa', opciones: ['Única', 'Recurrente'] },
];

const VENDEDORES_INICIAL = [
  { id: 1, nombre: 'Eduardo Magno', numeroIdentificacion: '12345678A', tipoIdentificacion: 'DNI', estado: 'Activo' },
];

const TIPOS_CAMPO = ['Texto', 'Select', 'Número'];
const TIPOS_IDENTIFICACION = ['CC', 'DNI', 'Pasaporte', 'PT'];

const getTabConfig = (empresas, servicios, campos, vendedores) => ({
  empresa: {
    label: 'Empresa',
    addLabel: 'Añadir empresa',
    searchPlaceholder: 'Buscar empresa...',
    countLabel: 'empresas',
    columns: ['Nombre', 'Estado', 'Opciones'],
    data: empresas,
  },
  servicios: {
    label: 'Servicios',
    addLabel: 'Añadir servicio',
    searchPlaceholder: 'Buscar servicio...',
    countLabel: 'servicios',
    columns: ['Servicio', 'Tipo de empresa', 'Estado', 'Opciones'],
    data: servicios,
  },
  campos: {
    label: 'Campos',
    addLabel: 'Añadir campo',
    searchPlaceholder: 'Buscar campo...',
    countLabel: 'campos',
    columns: ['Campo', 'Empresa', 'Servicio', 'Tipo de campo', 'Estado', 'Opciones'],
    data: campos,
  },
  vendedor: {
    label: 'Vendedor',
    addLabel: 'Añadir vendedor',
    searchPlaceholder: 'Buscar vendedor...',
    countLabel: 'vendedores',
    columns: ['Nombre', 'Nº identificación', 'Tipo identificación', 'Estado', 'Opciones'],
    data: vendedores,
  },
});

const FILAS_POR_PAGINA = 5;

const compactCellSx = { py: 1, [COMPACT_MEDIA]: { py: 0.5, fontSize: '0.8125rem' } };
const compactChipSx = { [COMPACT_MEDIA]: { fontSize: '0.6875rem', px: 0.75, height: 20 } };

const modalPaperSx = {
  width: '100%',
  maxWidth: 420,
  borderRadius: 2,
  mx: { xs: 1, sm: 2 },
  my: { xs: 2, sm: 0 },
};

const ConfigurationPage = () => {
  const [tabActual, setTabActual] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [empresas, setEmpresas] = useState(EMPRESAS_INICIAL);
  const [servicios, setServicios] = useState(SERVICIOS_INICIAL);
  const [campos, setCampos] = useState(CAMPOS_INICIAL);
  const [vendedores, setVendedores] = useState(VENDEDORES_INICIAL);

  // Modales Empresa
  const [modalNuevaEmpresa, setModalNuevaEmpresa] = useState(false);
  const [modalEditarEmpresa, setModalEditarEmpresa] = useState(false);
  const [modalEliminarEmpresa, setModalEliminarEmpresa] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [empresaEnEdicion, setEmpresaEnEdicion] = useState(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);

  // Modales Servicios
  const [modalNuevoServicio, setModalNuevoServicio] = useState(false);
  const [modalEditarServicio, setModalEditarServicio] = useState(false);
  const [modalEliminarServicio, setModalEliminarServicio] = useState(false);
  const [nombreServicio, setNombreServicio] = useState('');
  const [empresaIdServicio, setEmpresaIdServicio] = useState('');
  const [servicioEnEdicion, setServicioEnEdicion] = useState(null);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);

  // Modales Campos
  const [modalNuevoCampo, setModalNuevoCampo] = useState(false);
  const [modalEditarCampo, setModalEditarCampo] = useState(false);
  const [modalEliminarCampo, setModalEliminarCampo] = useState(false);
  const [nombreCampo, setNombreCampo] = useState('');
  const [empresaIdCampo, setEmpresaIdCampo] = useState('');
  const [servicioIdCampo, setServicioIdCampo] = useState('');
  const [tipoCampoSeleccionado, setTipoCampoSeleccionado] = useState('Texto');
  const [opcionesCampo, setOpcionesCampo] = useState([]);
  const [opcionInput, setOpcionInput] = useState('');
  const [campoEnEdicion, setCampoEnEdicion] = useState(null);
  const [campoAEliminar, setCampoAEliminar] = useState(null);
  const [modalVerCampo, setModalVerCampo] = useState(false);
  const [campoAVer, setCampoAVer] = useState(null);

  // Modales Vendedor
  const [modalNuevoVendedor, setModalNuevoVendedor] = useState(false);
  const [modalEditarVendedor, setModalEditarVendedor] = useState(false);
  const [modalEliminarVendedor, setModalEliminarVendedor] = useState(false);
  const [nombreVendedor, setNombreVendedor] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('DNI');
  const [vendedorEnEdicion, setVendedorEnEdicion] = useState(null);
  const [vendedorAEliminar, setVendedorAEliminar] = useState(null);

  const tabKeys = ['empresa', 'servicios', 'campos', 'vendedor'];
  const TAB_CONFIG = getTabConfig(empresas, servicios, campos, vendedores);

  const serviciosFiltradosPorEmpresa = empresaIdCampo
    ? servicios.filter((s) => s.tipoEmpresa === empresas.find((e) => e.id.toString() === empresaIdCampo)?.nombre)
    : [];
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

  // Handlers modales Empresa
  const handleAbrirNuevaEmpresa = () => {
    setNombreEmpresa('');
    setModalNuevaEmpresa(true);
  };

  const handleCerrarNuevaEmpresa = () => {
    setModalNuevaEmpresa(false);
    setNombreEmpresa('');
  };

  const handleGuardarNuevaEmpresa = () => {
    if (!nombreEmpresa.trim()) return;
    const nuevoId = Math.max(...empresas.map((e) => e.id), 0) + 1;
    setEmpresas((prev) => [...prev, { id: nuevoId, nombre: nombreEmpresa.trim(), estado: 'Activa' }]);
    handleCerrarNuevaEmpresa();
  };

  const handleAbrirEditarEmpresa = (empresa) => {
    setEmpresaEnEdicion(empresa);
    setNombreEmpresa(empresa.nombre);
    setModalEditarEmpresa(true);
  };

  const handleCerrarEditarEmpresa = () => {
    setModalEditarEmpresa(false);
    setEmpresaEnEdicion(null);
    setNombreEmpresa('');
  };

  const handleGuardarEditarEmpresa = () => {
    if (!empresaEnEdicion || !nombreEmpresa.trim()) return;
    setEmpresas((prev) =>
      prev.map((e) => (e.id === empresaEnEdicion.id ? { ...e, nombre: nombreEmpresa.trim() } : e))
    );
    handleCerrarEditarEmpresa();
  };

  const handleAbrirEliminarEmpresa = (empresa) => {
    setEmpresaAEliminar(empresa);
    setModalEliminarEmpresa(true);
  };

  const handleCerrarEliminarEmpresa = () => {
    setModalEliminarEmpresa(false);
    setEmpresaAEliminar(null);
  };

  const handleConfirmarEliminarEmpresa = () => {
    if (empresaAEliminar) {
      setEmpresas((prev) => prev.filter((e) => e.id !== empresaAEliminar.id));
    }
    handleCerrarEliminarEmpresa();
  };

  // Handlers modales Servicios
  const handleAbrirNuevoServicio = () => {
    setNombreServicio('');
    setEmpresaIdServicio(empresas.length > 0 ? empresas[0].id.toString() : '');
    setModalNuevoServicio(true);
  };

  const handleCerrarNuevoServicio = () => {
    setModalNuevoServicio(false);
    setNombreServicio('');
    setEmpresaIdServicio('');
  };

  const handleGuardarNuevoServicio = () => {
    if (!nombreServicio.trim() || !empresaIdServicio) return;
    const empresa = empresas.find((e) => e.id.toString() === empresaIdServicio);
    if (!empresa) return;
    const nuevoId = Math.max(...servicios.map((s) => s.id), 0) + 1;
    setServicios((prev) => [
      ...prev,
      { id: nuevoId, servicio: nombreServicio.trim(), tipoEmpresa: empresa.nombre, estado: 'Activa' },
    ]);
    handleCerrarNuevoServicio();
  };

  const handleAbrirEditarServicio = (servicio) => {
    setServicioEnEdicion(servicio);
    setNombreServicio(servicio.servicio);
    const emp = empresas.find((e) => e.nombre === servicio.tipoEmpresa);
    setEmpresaIdServicio(emp?.id?.toString() ?? empresas[0]?.id?.toString() ?? '');
    setModalEditarServicio(true);
  };

  const handleCerrarEditarServicio = () => {
    setModalEditarServicio(false);
    setServicioEnEdicion(null);
    setNombreServicio('');
    setEmpresaIdServicio('');
  };

  const handleGuardarEditarServicio = () => {
    if (!servicioEnEdicion || !nombreServicio.trim() || !empresaIdServicio) return;
    const empresa = empresas.find((e) => e.id.toString() === empresaIdServicio);
    if (!empresa) return;
    setServicios((prev) =>
      prev.map((s) =>
        s.id === servicioEnEdicion.id ? { ...s, servicio: nombreServicio.trim(), tipoEmpresa: empresa.nombre } : s
      )
    );
    handleCerrarEditarServicio();
  };

  const handleAbrirEliminarServicio = (servicio) => {
    setServicioAEliminar(servicio);
    setModalEliminarServicio(true);
  };

  const handleCerrarEliminarServicio = () => {
    setModalEliminarServicio(false);
    setServicioAEliminar(null);
  };

  const handleConfirmarEliminarServicio = () => {
    if (servicioAEliminar) {
      setServicios((prev) => prev.filter((s) => s.id !== servicioAEliminar.id));
    }
    handleCerrarEliminarServicio();
  };

  // Handlers modales Campos
  const handleAbrirNuevoCampo = () => {
    setNombreCampo('');
    setEmpresaIdCampo(empresas.length > 0 ? empresas[0].id.toString() : '');
    setServicioIdCampo('');
    setTipoCampoSeleccionado('Texto');
    setOpcionesCampo([]);
    setOpcionInput('');
    setModalNuevoCampo(true);
  };

  const handleCerrarNuevoCampo = () => {
    setModalNuevoCampo(false);
    setNombreCampo('');
    setEmpresaIdCampo('');
    setServicioIdCampo('');
    setTipoCampoSeleccionado('Texto');
    setOpcionesCampo([]);
    setOpcionInput('');
  };

  const handleAñadirOpcion = () => {
    const v = opcionInput.trim();
    if (v && !opcionesCampo.includes(v)) {
      setOpcionesCampo((prev) => [...prev, v]);
      setOpcionInput('');
    }
  };

  const handleQuitarOpcion = (idx) => {
    setOpcionesCampo((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardarNuevoCampo = () => {
    if (!nombreCampo.trim() || !empresaIdCampo || !servicioIdCampo) return;
    const empresa = empresas.find((e) => e.id.toString() === empresaIdCampo);
    const servicio = servicios.find((s) => s.id.toString() === servicioIdCampo);
    if (!empresa || !servicio) return;
    const nuevoId = Math.max(...campos.map((c) => c.id), 0) + 1;
    setCampos((prev) => [
      ...prev,
      {
        id: nuevoId,
        campo: nombreCampo.trim(),
        empresa: empresa.nombre,
        servicio: servicio.servicio,
        tipoCampo: tipoCampoSeleccionado,
        estado: 'Activa',
        opciones: tipoCampoSeleccionado === 'Select' ? [...opcionesCampo] : [],
      },
    ]);
    handleCerrarNuevoCampo();
  };

  const handleAbrirEditarCampo = (campo) => {
    setCampoEnEdicion(campo);
    setNombreCampo(campo.campo);
    const emp = empresas.find((e) => e.nombre === campo.empresa);
    setEmpresaIdCampo(emp?.id?.toString() ?? empresas[0]?.id?.toString() ?? '');
    const serv = servicios.find((s) => s.servicio === campo.servicio && s.tipoEmpresa === campo.empresa);
    setServicioIdCampo(serv?.id?.toString() ?? '');
    setTipoCampoSeleccionado(campo.tipoCampo);
    setOpcionesCampo(campo.opciones ?? []);
    setOpcionInput('');
    setModalEditarCampo(true);
  };

  const handleCerrarEditarCampo = () => {
    setModalEditarCampo(false);
    setCampoEnEdicion(null);
    setNombreCampo('');
    setEmpresaIdCampo('');
    setServicioIdCampo('');
    setTipoCampoSeleccionado('Texto');
    setOpcionesCampo([]);
    setOpcionInput('');
  };

  const handleGuardarEditarCampo = () => {
    if (!campoEnEdicion || !nombreCampo.trim() || !empresaIdCampo || !servicioIdCampo) return;
    const empresa = empresas.find((e) => e.id.toString() === empresaIdCampo);
    const servicio = servicios.find((s) => s.id.toString() === servicioIdCampo);
    if (!empresa || !servicio) return;
    setCampos((prev) =>
      prev.map((c) =>
        c.id === campoEnEdicion.id
          ? {
              ...c,
              campo: nombreCampo.trim(),
              empresa: empresa.nombre,
              servicio: servicio.servicio,
              tipoCampo: tipoCampoSeleccionado,
              opciones: tipoCampoSeleccionado === 'Select' ? [...opcionesCampo] : [],
            }
          : c
      )
    );
    handleCerrarEditarCampo();
  };

  const handleAbrirVerCampo = (campo) => {
    setCampoAVer(campo);
    setModalVerCampo(true);
  };

  const handleCerrarVerCampo = () => {
    setModalVerCampo(false);
    setCampoAVer(null);
  };

  const handleAbrirEliminarCampo = (campo) => {
    setCampoAEliminar(campo);
    setModalEliminarCampo(true);
  };

  const handleCerrarEliminarCampo = () => {
    setModalEliminarCampo(false);
    setCampoAEliminar(null);
  };

  const handleConfirmarEliminarCampo = () => {
    if (campoAEliminar) {
      setCampos((prev) => prev.filter((c) => c.id !== campoAEliminar.id));
    }
    handleCerrarEliminarCampo();
  };

  // Handlers modales Vendedor
  const handleAbrirNuevoVendedor = () => {
    setNombreVendedor('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('DNI');
    setModalNuevoVendedor(true);
  };

  const handleCerrarNuevoVendedor = () => {
    setModalNuevoVendedor(false);
    setNombreVendedor('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('DNI');
  };

  const handleGuardarNuevoVendedor = () => {
    if (!nombreVendedor.trim() || !numeroIdentificacion.trim()) return;
    const nuevoId = Math.max(...vendedores.map((c) => c.id), 0) + 1;
    setVendedores((prev) => [
      ...prev,
      { id: nuevoId, nombre: nombreVendedor.trim(), numeroIdentificacion: numeroIdentificacion.trim(), tipoIdentificacion, estado: 'Activo' },
    ]);
    handleCerrarNuevoVendedor();
  };

  const handleAbrirEditarVendedor = (col) => {
    setVendedorEnEdicion(col);
    setNombreVendedor(col.nombre);
    setNumeroIdentificacion(col.numeroIdentificacion ?? '');
    setTipoIdentificacion(col.tipoIdentificacion ?? 'DNI');
    setModalEditarVendedor(true);
  };

  const handleCerrarEditarVendedor = () => {
    setModalEditarVendedor(false);
    setVendedorEnEdicion(null);
    setNombreVendedor('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('DNI');
  };

  const handleGuardarEditarVendedor = () => {
    if (!vendedorEnEdicion || !nombreVendedor.trim() || !numeroIdentificacion.trim()) return;
    setVendedores((prev) =>
      prev.map((c) =>
        c.id === vendedorEnEdicion.id
          ? { ...c, nombre: nombreVendedor.trim(), numeroIdentificacion: numeroIdentificacion.trim(), tipoIdentificacion }
          : c
      )
    );
    handleCerrarEditarVendedor();
  };

  const handleAbrirEliminarVendedor = (col) => {
    setVendedorAEliminar(col);
    setModalEliminarVendedor(true);
  };

  const handleCerrarEliminarVendedor = () => {
    setModalEliminarVendedor(false);
    setVendedorAEliminar(null);
  };

  const handleConfirmarEliminarVendedor = () => {
    if (vendedorAEliminar) {
      setVendedores((prev) => prev.filter((c) => c.id !== vendedorAEliminar.id));
    }
    handleCerrarEliminarVendedor();
  };

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
            <TableCell sx={{ py: 1, fontWeight: 500 }}>{row.nombre}</TableCell>
            <TableCell sx={{ py: 1 }}>
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
            <TableCell align="center" sx={{ py: 1 }}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton
                  size="small"
                  aria-label="Editar"
                  title="Editar"
                  sx={actionBtnBlue}
                  onClick={() => handleAbrirEditarEmpresa(row)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Eliminar"
                  title="Eliminar"
                  sx={actionBtnRed}
                  onClick={() => handleAbrirEliminarEmpresa(row)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'servicios':
        return (
          <>
            <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.servicio}</TableCell>
            <TableCell sx={compactCellSx}>
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
                  ...compactChipSx,
                }}
              />
            </TableCell>
            <TableCell sx={compactCellSx}>
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
                  ...compactChipSx,
                }}
              />
            </TableCell>
            <TableCell align="center" sx={compactCellSx}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton
                  size="small"
                  aria-label="Editar"
                  title="Editar"
                  sx={actionBtnBlue}
                  onClick={() => handleAbrirEditarServicio(row)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Eliminar"
                  title="Eliminar"
                  sx={actionBtnRed}
                  onClick={() => handleAbrirEliminarServicio(row)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'campos':
        return (
          <>
            <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.campo}</TableCell>
            <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.empresa}</TableCell>
            <TableCell sx={{ ...compactCellSx, color: 'text.secondary' }}>{row.servicio}</TableCell>
            <TableCell sx={compactCellSx}>
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
                  ...compactChipSx,
                }}
              />
            </TableCell>
            <TableCell sx={compactCellSx}>
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
                  ...compactChipSx,
                }}
              />
            </TableCell>
            <TableCell align="center" sx={compactCellSx}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Ver detalles" title="Ver detalles" sx={actionBtnGray} onClick={() => handleAbrirVerCampo(row)}>
                  <EyeIcon />
                </IconButton>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => handleAbrirEditarCampo(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => handleAbrirEliminarCampo(row)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </TableCell>
          </>
        );
      case 'vendedor':
        return (
          <>
            <TableCell sx={{ ...compactCellSx, fontWeight: 500 }}>{row.nombre}</TableCell>
            <TableCell sx={compactCellSx}>{row.numeroIdentificacion ?? '-'}</TableCell>
            <TableCell sx={compactCellSx}>{row.tipoIdentificacion ?? '-'}</TableCell>
            <TableCell sx={compactCellSx}>
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
                  ...compactChipSx,
                }}
              />
            </TableCell>
            <TableCell align="center" sx={compactCellSx}>
              <Stack direction="row" justifyContent="center" spacing={0.75}>
                <IconButton size="small" aria-label="Editar" title="Editar" sx={actionBtnBlue} onClick={() => handleAbrirEditarVendedor(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" aria-label="Eliminar" title="Eliminar" sx={actionBtnRed} onClick={() => handleAbrirEliminarVendedor(row)}>
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
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        [COMPACT_MEDIA]: { borderRadius: 2 },
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          [COMPACT_MEDIA]: { p: 1.5 },
        }}
      >
        {/* Encabezado */}
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
              Configuración
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ [COMPACT_MEDIA]: { fontSize: '0.8125rem' } }}>
              Administra la configuración del sistema
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 2, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1, gap: 1 } }}
        >
          <Tabs
            value={tabActual}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 40,
              flex: { xs: 1, sm: 'none' },
              minWidth: 0,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.8125rem', sm: '0.9375rem' }, [COMPACT_MEDIA]: { fontSize: '0.75rem', minHeight: 36 } },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab label="Empresa" />
            <Tab label="Servicios" />
            <Tab label="Campos" />
            <Tab label="Vendedor" />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<Typography component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
            onClick={
              tabKeys[tabActual] === 'empresa'
                ? handleAbrirNuevaEmpresa
                : tabKeys[tabActual] === 'servicios'
                  ? handleAbrirNuevoServicio
                  : tabKeys[tabActual] === 'campos'
                    ? handleAbrirNuevoCampo
                    : tabKeys[tabActual] === 'vendedor'
                      ? handleAbrirNuevoVendedor
                      : undefined
            }
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
            {config.addLabel}
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{ mb: 3, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1.5, gap: 1 } }}
        >
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
            overflow: 'visible',
            [COMPACT_MEDIA]: { borderRadius: 1 },
          }}
        >
          <Table size="small" sx={{ minWidth: 400 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {config.columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      fontSize: '0.8125rem',
                      py: 1,
                      [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 0.5 },
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

      {/* Modal Nueva empresa */}
      <Dialog
        open={modalNuevaEmpresa}
        onClose={handleCerrarNuevaEmpresa}
        PaperProps={{
          sx: modalPaperSx,
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Nueva empresa
          </Typography>
          <IconButton size="small" onClick={handleCerrarNuevaEmpresa} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar una empresa.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Nombre de la empresa"
            placeholder="Introduce el nombre..."
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarNuevaEmpresa}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarNuevaEmpresa}
            disabled={!nombreEmpresa.trim()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
            }}
          >
            Guardar empresa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar empresa */}
      <Dialog
        open={modalEditarEmpresa}
        onClose={handleCerrarEditarEmpresa}
        PaperProps={{
          sx: modalPaperSx,
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Editar empresa
          </Typography>
          <IconButton size="small" onClick={handleCerrarEditarEmpresa} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica el nombre de la empresa.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Nombre de la empresa"
            placeholder="Introduce el nombre..."
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarEditarEmpresa}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEditarEmpresa}
            disabled={!nombreEmpresa.trim()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar empresa */}
      <Dialog
        open={modalEliminarEmpresa}
        onClose={handleCerrarEliminarEmpresa}
        PaperProps={{
          sx: modalPaperSx,
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Eliminar empresa
          </Typography>
          <IconButton size="small" onClick={handleCerrarEliminarEmpresa} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.primary">
            ¿Está seguro que desea eliminar esta empresa?
          </Typography>
          {empresaAEliminar && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Se eliminará: <strong>{empresaAEliminar.nombre}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarEliminarEmpresa}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminarEmpresa}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nuevo servicio */}
      <Dialog
        open={modalNuevoServicio}
        onClose={handleCerrarNuevoServicio}
        PaperProps={{ sx: modalPaperSx }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Nuevo servicio
          </Typography>
          <IconButton size="small" onClick={handleCerrarNuevoServicio} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un servicio.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del servicio"
              placeholder="Introduce el nombre..."
              value={nombreServicio}
              onChange={(e) => setNombreServicio(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="servicio-empresa-label">Empresa</InputLabel>
              <Select
                labelId="servicio-empresa-label"
                value={empresaIdServicio}
                label="Empresa"
                onChange={(e) => setEmpresaIdServicio(e.target.value)}
              >
                {empresas.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarNuevoServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarNuevoServicio}
            disabled={!nombreServicio.trim() || !empresaIdServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
            }}
          >
            Guardar servicio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar servicio */}
      <Dialog
        open={modalEditarServicio}
        onClose={handleCerrarEditarServicio}
        PaperProps={{ sx: modalPaperSx }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Editar servicio
          </Typography>
          <IconButton size="small" onClick={handleCerrarEditarServicio} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica el nombre y la empresa del servicio.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del servicio"
              placeholder="Introduce el nombre..."
              value={nombreServicio}
              onChange={(e) => setNombreServicio(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-servicio-empresa-label">Empresa</InputLabel>
              <Select
                labelId="editar-servicio-empresa-label"
                value={empresaIdServicio}
                label="Empresa"
                onChange={(e) => setEmpresaIdServicio(e.target.value)}
              >
                {empresas.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarEditarServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEditarServicio}
            disabled={!nombreServicio.trim() || !empresaIdServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar servicio */}
      <Dialog
        open={modalEliminarServicio}
        onClose={handleCerrarEliminarServicio}
        PaperProps={{ sx: modalPaperSx }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Eliminar servicio
          </Typography>
          <IconButton size="small" onClick={handleCerrarEliminarServicio} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.primary">
            ¿Está seguro que desea eliminar este servicio?
          </Typography>
          {servicioAEliminar && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Se eliminará: <strong>{servicioAEliminar.servicio}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCerrarEliminarServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(0,0,0,0.12)',
              color: 'text.primary',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminarServicio}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nuevo campo */}
      <Dialog open={modalNuevoCampo} onClose={handleCerrarNuevoCampo} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Nuevo campo
          </Typography>
          <IconButton size="small" onClick={handleCerrarNuevoCampo} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información. Selecciona empresa y servicio; si el tipo es Select, añade las opciones.
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-empresa-label">Empresa</InputLabel>
              <Select
                labelId="campo-empresa-label"
                value={empresaIdCampo}
                label="Empresa"
                onChange={(e) => {
                  setEmpresaIdCampo(e.target.value);
                  setServicioIdCampo('');
                }}
              >
                {empresas.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-servicio-label">Servicio</InputLabel>
              <Select
                labelId="campo-servicio-label"
                value={servicioIdCampo}
                label="Servicio"
                onChange={(e) => setServicioIdCampo(e.target.value)}
                disabled={!empresaIdCampo}
              >
                {serviciosFiltradosPorEmpresa.map((s) => (
                  <MenuItem key={s.id} value={s.id.toString()}>
                    {s.servicio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Nombre del campo"
              placeholder="Introduce el nombre..."
              value={nombreCampo}
              onChange={(e) => setNombreCampo(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="campo-tipo-label">Tipo de campo</InputLabel>
              <Select
                labelId="campo-tipo-label"
                value={tipoCampoSeleccionado}
                label="Tipo de campo"
                onChange={(e) => setTipoCampoSeleccionado(e.target.value)}
              >
                {TIPOS_CAMPO.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {tipoCampoSeleccionado === 'Select' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Opciones
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Escribe una opción..."
                    value={opcionInput}
                    onChange={(e) => setOpcionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAñadirOpcion())}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAñadirOpcion} disabled={!opcionInput.trim()}>
                    Añadir
                  </Button>
                </Stack>
                {opcionesCampo.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {opcionesCampo.map((opt, idx) => (
                      <Chip
                        key={idx}
                        label={opt}
                        size="small"
                        onDelete={() => handleQuitarOpcion(idx)}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNuevoCampo} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarNuevoCampo}
            disabled={
              !nombreCampo.trim() ||
              !empresaIdCampo ||
              !servicioIdCampo ||
              (tipoCampoSeleccionado === 'Select' && opcionesCampo.length === 0)
            }
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)' }}
          >
            Guardar campo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar campo */}
      <Dialog open={modalEditarCampo} onClose={handleCerrarEditarCampo} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Editar campo
          </Typography>
          <IconButton size="small" onClick={handleCerrarEditarCampo} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica la información del campo. Si el tipo es Select, puedes añadir o quitar opciones.
          </Typography>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-empresa-label">Empresa</InputLabel>
              <Select
                labelId="editar-campo-empresa-label"
                value={empresaIdCampo}
                label="Empresa"
                onChange={(e) => {
                  setEmpresaIdCampo(e.target.value);
                  setServicioIdCampo('');
                }}
              >
                {empresas.map((e) => (
                  <MenuItem key={e.id} value={e.id.toString()}>
                    {e.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-servicio-label">Servicio</InputLabel>
              <Select
                labelId="editar-campo-servicio-label"
                value={servicioIdCampo}
                label="Servicio"
                onChange={(e) => setServicioIdCampo(e.target.value)}
                disabled={!empresaIdCampo}
              >
                {serviciosFiltradosPorEmpresa.map((s) => (
                  <MenuItem key={s.id} value={s.id.toString()}>
                    {s.servicio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Nombre del campo"
              placeholder="Introduce el nombre..."
              value={nombreCampo}
              onChange={(e) => setNombreCampo(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-campo-tipo-label">Tipo de campo</InputLabel>
              <Select
                labelId="editar-campo-tipo-label"
                value={tipoCampoSeleccionado}
                label="Tipo de campo"
                onChange={(e) => setTipoCampoSeleccionado(e.target.value)}
              >
                {TIPOS_CAMPO.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {tipoCampoSeleccionado === 'Select' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Opciones
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Escribe una opción..."
                    value={opcionInput}
                    onChange={(e) => setOpcionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAñadirOpcion())}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button variant="outlined" size="small" onClick={handleAñadirOpcion} disabled={!opcionInput.trim()}>
                    Añadir
                  </Button>
                </Stack>
                {opcionesCampo.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {opcionesCampo.map((opt, idx) => (
                      <Chip
                        key={idx}
                        label={opt}
                        size="small"
                        onDelete={() => handleQuitarOpcion(idx)}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditarCampo} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEditarCampo}
            disabled={
              !nombreCampo.trim() ||
              !empresaIdCampo ||
              !servicioIdCampo ||
              (tipoCampoSeleccionado === 'Select' && opcionesCampo.length === 0)
            }
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)' }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar campo */}
      <Dialog open={modalEliminarCampo} onClose={handleCerrarEliminarCampo} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Eliminar campo
          </Typography>
          <IconButton size="small" onClick={handleCerrarEliminarCampo} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.primary">
            ¿Está seguro que desea eliminar este campo?
          </Typography>
          {campoAEliminar && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Se eliminará: <strong>{campoAEliminar.campo}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEliminarCampo} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmarEliminarCampo} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver detalles del campo */}
      <Dialog open={modalVerCampo} onClose={handleCerrarVerCampo} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Detalles del campo
          </Typography>
          <IconButton size="small" onClick={handleCerrarVerCampo} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {campoAVer && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Nombre
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {campoAVer.campo}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Empresa
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {campoAVer.empresa}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Servicio
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {campoAVer.servicio}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Tipo de campo
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {campoAVer.tipoCampo}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Estado
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {campoAVer.estado}
                </Typography>
              </Box>
              {campoAVer.tipoCampo === 'Select' && (campoAVer.opciones ?? []).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                    Opciones
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                    {campoAVer.opciones.map((opt, idx) => (
                      <Chip key={idx} label={opt} size="small" sx={{ borderRadius: 1 }} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button variant="outlined" onClick={handleCerrarVerCampo} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cerrar
          </Button>
          {campoAVer && (
            <Button
              variant="contained"
              onClick={() => {
                handleCerrarVerCampo();
                handleAbrirEditarCampo(campoAVer);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)' }}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal Nuevo vendedor */}
      <Dialog open={modalNuevoVendedor} onClose={handleCerrarNuevoVendedor} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Nuevo vendedor
          </Typography>
          <IconButton size="small" onClick={handleCerrarNuevoVendedor} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para registrar un vendedor (persona que cierra la venta).
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre"
              placeholder="Introduce el nombre..."
              value={nombreVendedor}
              onChange={(e) => setNombreVendedor(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="colab-tipo-id-label">Tipo de identificación</InputLabel>
              <Select
                labelId="colab-tipo-id-label"
                value={tipoIdentificacion}
                label="Tipo de identificación"
                onChange={(e) => setTipoIdentificacion(e.target.value)}
              >
                {TIPOS_IDENTIFICACION.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Número de identificación"
              placeholder="Introduce el número..."
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarNuevoVendedor} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarNuevoVendedor}
            disabled={!nombreVendedor.trim() || !numeroIdentificacion.trim()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)' }}
          >
            Guardar vendedor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar vendedor */}
      <Dialog open={modalEditarVendedor} onClose={handleCerrarEditarVendedor} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Editar vendedor
          </Typography>
          <IconButton size="small" onClick={handleCerrarEditarVendedor} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modifica los datos del vendedor.
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Nombre"
              placeholder="Introduce el nombre..."
              value={nombreVendedor}
              onChange={(e) => setNombreVendedor(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="editar-colab-tipo-id-label">Tipo de identificación</InputLabel>
              <Select
                labelId="editar-colab-tipo-id-label"
                value={tipoIdentificacion}
                label="Tipo de identificación"
                onChange={(e) => setTipoIdentificacion(e.target.value)}
              >
                {TIPOS_IDENTIFICACION.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Número de identificación"
              placeholder="Introduce el número..."
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEditarVendedor} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEditarVendedor}
            disabled={!nombreVendedor.trim() || !numeroIdentificacion.trim()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)' }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar vendedor */}
      <Dialog open={modalEliminarVendedor} onClose={handleCerrarEliminarVendedor} PaperProps={{ sx: modalPaperSx }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Eliminar vendedor
          </Typography>
          <IconButton size="small" onClick={handleCerrarEliminarVendedor} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.primary">
            ¿Está seguro que desea eliminar este vendedor?
          </Typography>
          {vendedorAEliminar && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Se eliminará: <strong>{vendedorAEliminar.nombre}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" onClick={handleCerrarEliminarVendedor} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmarEliminarVendedor} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ConfigurationPage;
