import { useState, useEffect } from 'react';
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
import { useContratistas, ContratistasConfigSection } from '../servicios';
import { useCampos, CamposConfigSection } from '../campos';
import { useVendedores, VendedorConfigSection } from '../vendedores';
import { listarEmpresasActivasParaSelect } from '../empresa/logic/apiEmpresa';
import { listarServiciosPorEmpresa } from '../servicios/logic/apiServicios';

const TAB_KEYS = ['servicios', 'compania', 'campos', 'comercial'];

const ADD_LABELS = {
  servicios: 'Añadir servicio',
  compania: 'Añadir compañía',
  campos: 'Añadir campo',
  comercial: 'Añadir comercial',
};

const SEARCH_PLACEHOLDERS = {
  servicios: 'Buscar servicio...',
  compania: 'Buscar compañía...',
  campos: 'Buscar campo...',
  comercial: 'Buscar comercial...',
};

/**
 * Orquestador de la pantalla de configuración: tabs, búsqueda y filtro independientes por tab,
 * renderizado de la sección activa. La lógica de cada dominio vive en sus módulos (app/empresa, etc.).
 */
const INIT_BUSQUEDA = { servicios: '', compania: '', campos: '', comercial: '' };
const INIT_FILTRO = { servicios: 'todos', compania: 'todos', campos: 'todos', comercial: 'todos' };
const INIT_FILTRO_EMPRESA_CAMPOS = '';
const INIT_FILTRO_SERVICIO_CAMPOS = '';
const INIT_PAGINA = { servicios: 1, compania: 1, campos: 1, comercial: 1 };

export function ConfigPageContent() {
  const [tabActual, setTabActual] = useState(0);
  const [busquedaPorTab, setBusquedaPorTab] = useState(INIT_BUSQUEDA);
  const [filtroEstadoPorTab, setFiltroEstadoPorTab] = useState(INIT_FILTRO);
  const [filtroEmpresaCampos, setFiltroEmpresaCampos] = useState(INIT_FILTRO_EMPRESA_CAMPOS);
  const [filtroServicioCampos, setFiltroServicioCampos] = useState(INIT_FILTRO_SERVICIO_CAMPOS);
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

  const empresa = useEmpresas(paginaPorTab.servicios, setPagina, busquedaPorTab.servicios, filtroEstadoPorTab.servicios, TAB_KEYS[tabActual] === 'servicios');
  const vendedores = useVendedores(
    paginaPorTab.comercial,
    setPagina,
    busquedaPorTab.comercial,
    filtroEstadoPorTab.comercial,
    TAB_KEYS[tabActual] === 'comercial'
  );
  const contratistas = useContratistas(
    paginaPorTab.compania,
    setPagina,
    busquedaPorTab.compania,
    filtroEstadoPorTab.compania,
    TAB_KEYS[tabActual] === 'compania',
    empresa.empresasParaSelect,
    empresa.cargarEmpresasParaSelect
  );
  const campos = useCampos(
    tabKey === 'campos',
    paginaPorTab.campos,
    setPagina,
    busquedaPorTab.campos,
    filtroEstadoPorTab.campos,
    filtroEmpresaCampos,
    filtroServicioCampos,
    ''
  );

  const handleChangeTab = (_, value) => {
    setTabActual(value);
    setPagina(1);
  };

  const [empresasParaFiltroCampos, setEmpresasParaFiltroCampos] = useState([]);
  const [serviciosParaFiltroCampos, setServiciosParaFiltroCampos] = useState([]);

  useEffect(() => {
    if (tabKey !== 'campos') return;
    let cancelled = false;
    listarEmpresasActivasParaSelect()
      .then((list) => { if (!cancelled) setEmpresasParaFiltroCampos(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setEmpresasParaFiltroCampos([]); });
    return () => { cancelled = true; };
  }, [tabKey]);

  useEffect(() => {
    if (!filtroEmpresaCampos) {
      setServiciosParaFiltroCampos([]);
      setFiltroServicioCampos('');
      return;
    }
    let cancelled = false;
    listarServiciosPorEmpresa(filtroEmpresaCampos)
      .then((list) => { if (!cancelled) setServiciosParaFiltroCampos(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setServiciosParaFiltroCampos([]); });
    return () => { cancelled = true; };
  }, [filtroEmpresaCampos]);

  // No cargar datos al cambiar de tab: cada hook carga solo cuando su tab está activo (active).
  // Los selects (empresas/servicios) se cargan bajo demanda al abrir los modales (handleAbrirNueva).

  const handleAddClick = () => {
    if (tabKey === 'servicios') empresa.handleAbrirNueva();
    else if (tabKey === 'compania') contratistas.handleAbrirNueva();
    else if (tabKey === 'campos') campos.handleAbrirNueva();
    else if (tabKey === 'comercial') vendedores.handleAbrirNueva();
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
            <Tab label="Servicios" />
            <Tab label="Compañía" />
            <Tab label="Campos" />
            <Tab label="Comercial" />
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
          {tabKey === 'campos' && (
            <>
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 }, minWidth: { xs: 0, sm: 200 } }}>
                <InputLabel id="filtro-empresa-campos-label">Servicio</InputLabel>
                <Select
                  labelId="filtro-empresa-campos-label"
                  value={filtroEmpresaCampos}
                  label="Servicio"
                  onChange={(e) => {
                    setFiltroEmpresaCampos(e.target.value);
                    setPaginaPorTab((p) => ({ ...p, campos: 1 }));
                  }}
                >
                  <MenuItem value="">Todos los servicios</MenuItem>
                  {empresasParaFiltroCampos.map((e) => (
                    <MenuItem key={e.id} value={String(e.id)}>{e.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 }, minWidth: { xs: 0, sm: 200 } }}>
                <InputLabel id="filtro-servicio-campos-label">Compañía actual</InputLabel>
                <Select
                  labelId="filtro-servicio-campos-label"
                  value={filtroServicioCampos}
                  label="Compañía"
                  onChange={(e) => {
                    setFiltroServicioCampos(e.target.value);
                    setPaginaPorTab((p) => ({ ...p, campos: 1 }));
                  }}
                  disabled={!filtroEmpresaCampos}
                >
                  <MenuItem value="">Todas las compañías</MenuItem>
                  {serviciosParaFiltroCampos.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>{s.nombre ?? s.servicio}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Stack>

        {tabKey === 'servicios' && (
          <EmpresaConfigSection empresa={empresa} pagina={paginaPorTab.servicios} setPagina={setPagina} />
        )}
        {tabKey === 'compania' && (
          <ContratistasConfigSection
            contratistas={contratistas}
            empresasParaSelect={empresa.empresasParaSelect}
            cargarEmpresasParaSelect={empresa.cargarEmpresasParaSelect}
            pagina={paginaPorTab.compania}
            setPagina={setPagina}
          />
        )}
        {tabKey === 'campos' && (
          <CamposConfigSection
            campos={campos}
            pagina={paginaPorTab.campos}
            setPagina={setPagina}
          />
        )}
        {tabKey === 'comercial' && (
          <VendedorConfigSection vendedores={vendedores} pagina={paginaPorTab.comercial} setPagina={setPagina} />
        )}
      </Box>
    </Paper>
  );
}
