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
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { SearchIcon } from '../../utils/icons';
import { useChoices } from '../../context/ChoicesContext';
import { useEmpresas, EmpresaConfigSection } from '../empresa';
import { useServicios, ServiciosConfigSection } from '../servicios';
import { useCampos, CamposConfigSection } from '../campos';
import { useVendedores, VendedorConfigSection } from '../vendedores';

const TAB_KEYS = ['empresa', 'servicios', 'campos', 'vendedor'];

const ADD_LABELS = {
  empresa: 'Añadir empresa',
  servicios: 'Añadir servicio',
  campos: 'Añadir campo',
  vendedor: 'Añadir vendedor',
};

const SEARCH_PLACEHOLDERS = {
  empresa: 'Buscar empresa...',
  servicios: 'Buscar servicio...',
  campos: 'Buscar campo...',
  vendedor: 'Buscar vendedor...',
};

/**
 * Orquestador de la pantalla de configuración: tabs, búsqueda y filtro independientes por tab,
 * renderizado de la sección activa. La lógica de cada dominio vive en sus módulos (app/empresa, etc.).
 */
const INIT_BUSQUEDA = { empresa: '', servicios: '', campos: '', vendedor: '' };
const INIT_FILTRO = { empresa: 'todos', servicios: 'todos', campos: 'todos', vendedor: 'todos' };
const INIT_PAGINA = { empresa: 1, servicios: 1, campos: 1, vendedor: 1 };

export function ConfigPageContent() {
  const [tabActual, setTabActual] = useState(0);
  const [busquedaPorTab, setBusquedaPorTab] = useState(INIT_BUSQUEDA);
  const [filtroEstadoPorTab, setFiltroEstadoPorTab] = useState(INIT_FILTRO);
  const [paginaPorTab, setPaginaPorTab] = useState(INIT_PAGINA);

  const tabKey = TAB_KEYS[tabActual];
  const busqueda = busquedaPorTab[tabKey] ?? '';
  const filtroEstado = filtroEstadoPorTab[tabKey] ?? 'todos';
  const pagina = paginaPorTab[tabKey] ?? 1;

  const setBusqueda = (v) => {
    setBusquedaPorTab((prev) => ({ ...prev, [tabKey]: typeof v === 'function' ? v(prev[tabKey]) : v }));
    setPaginaPorTab((prev) => ({ ...prev, [tabKey]: 1 }));
  };
  const setFiltroEstado = (v) => {
    setFiltroEstadoPorTab((prev) => ({ ...prev, [tabKey]: typeof v === 'function' ? v(prev[tabKey]) : v }));
    setPaginaPorTab((prev) => ({ ...prev, [tabKey]: 1 }));
  };
  const setPagina = (v) => {
    setPaginaPorTab((prev) => ({ ...prev, [tabKey]: typeof v === 'function' ? v(prev[tabKey]) : v }));
  };
  const { getOptions, loading: choicesLoading } = useChoices();
  const opcionesEstado = getOptions('estado');

  const empresa = useEmpresas(paginaPorTab.empresa, setPagina, busquedaPorTab.empresa, filtroEstadoPorTab.empresa, TAB_KEYS[tabActual] === 'empresa');
  const vendedores = useVendedores(
    paginaPorTab.vendedor,
    setPagina,
    busquedaPorTab.vendedor,
    filtroEstadoPorTab.vendedor,
    TAB_KEYS[tabActual] === 'vendedor'
  );
  const servicios = useServicios(
    paginaPorTab.servicios,
    setPagina,
    busquedaPorTab.servicios,
    filtroEstadoPorTab.servicios,
    TAB_KEYS[tabActual] === 'servicios',
    empresa.empresasParaSelect,
    empresa.cargarEmpresasParaSelect
  );
  const campos = useCampos(
    empresa.empresasParaSelect,
    servicios.serviciosParaSelect,
    empresa.cargarEmpresasParaSelect
  );

  const handleChangeTab = (_, value) => {
    setTabActual(value);
    setPagina(1);
  };

  // No cargar datos al cambiar de tab: cada hook carga solo cuando su tab está activo (active).
  // Los selects (empresas/servicios) se cargan bajo demanda al abrir los modales (handleAbrirNueva).

  const handleAddClick = () => {
    if (tabKey === 'empresa') empresa.handleAbrirNueva();
    else if (tabKey === 'servicios') servicios.handleAbrirNueva();
    else if (tabKey === 'campos') campos.handleAbrirNueva();
    else if (tabKey === 'vendedor') vendedores.handleAbrirNueva();
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
          <Button
            variant="contained"
            startIcon={<Typography component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 300 }}>+</Typography>}
            onClick={handleAddClick}
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
            {ADD_LABELS[tabKey]}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} sx={{ mb: 2, flexShrink: 0, [COMPACT_MEDIA]: { mb: 1 } }}>
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
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{ mb: 4, flexShrink: 0, [COMPACT_MEDIA]: { mb: 2.5, gap: 1 } }}
        >
          <TextField
            placeholder={SEARCH_PLACEHOLDERS[tabKey]}
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
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 }, minWidth: { xs: 0, sm: 220 } }} disabled={choicesLoading}>
            <InputLabel id="filtro-estado-label">Estado</InputLabel>
            <Select
              labelId="filtro-estado-label"
              value={filtroEstado}
              label="Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="">Seleccionar una opción</MenuItem>
              <MenuItem value="todos">Todos los estados</MenuItem>
              {opcionesEstado.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {tabKey === 'empresa' && (
          <EmpresaConfigSection empresa={empresa} pagina={paginaPorTab.empresa} setPagina={setPagina} />
        )}
        {tabKey === 'servicios' && (
          <ServiciosConfigSection
            servicios={servicios}
            empresasParaSelect={empresa.empresasParaSelect}
            cargarEmpresasParaSelect={empresa.cargarEmpresasParaSelect}
            pagina={paginaPorTab.servicios}
            setPagina={setPagina}
          />
        )}
        {tabKey === 'campos' && (
          <CamposConfigSection
            campos={campos}
            empresasParaSelect={empresa.empresasParaSelect}
            servicios={servicios.servicios}
            cargarEmpresasParaSelect={empresa.cargarEmpresasParaSelect}
            pagina={paginaPorTab.campos}
            setPagina={setPagina}
          />
        )}
        {tabKey === 'vendedor' && (
          <VendedorConfigSection vendedores={vendedores} pagina={paginaPorTab.vendedor} setPagina={setPagina} />
        )}
      </Box>
    </Paper>
  );
}
