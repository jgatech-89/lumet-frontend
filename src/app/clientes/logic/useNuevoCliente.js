import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiCliente from './apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';
import { listarServiciosPorEmpresa } from '../../servicios/logic/apiServicios';
import { listarEmpresasActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { useChoices } from '../../../context/ChoicesContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';

const BASE_DATA_INICIAL = {
  nombre: '',
  tipo_identificacion: '',
  numero_identificacion: '',
  telefono: '',
  correo: '',
  direccion: '',
};

/** Nombres que identifican tipo_cliente en campos dinámicos (viene de tabla campos, se muestra en paso 1; el resto en paso 3). */
const NOMBRES_TIPO_CLIENTE_CAMPO = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];

/** Nombres que identifican estado_venta en campos dinámicos (se muestra con el resto de campos en paso 3). */
const NOMBRES_ESTADO_VENTA_CAMPO = ['estado_venta', 'Estado de venta', 'Estado venta', 'estado venta'];

/** Campo Producto: producto, Productos, Tipo producto, tipo de producto */
const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto', 'Productos', 'Tipo producto', 'tipo de producto'];

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esCampoTipoCliente = (c) => NOMBRES_TIPO_CLIENTE_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoEstadoVenta = (c) => NOMBRES_ESTADO_VENTA_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoProducto = (c) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(c.nombre) === norm(n));
/** Detecta si el campo es de vendedor. Las opciones vienen de la tabla vendedores. */
const esCampoVendedor = (n) => /vendedor/i.test(n || '');

/**
 * Hook con la lógica del formulario de nuevo cliente (4 pasos).
 * Paso 1 "Cliente": tipo de cliente (getOptions) primero; al seleccionar aparecen empresa y servicio.
 * Paso 3: campos dinámicos (excluyendo tipo_cliente si existe en campos).
 */
export function useNuevoCliente() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { getOptions } = useChoices();

  const [paso, setPaso] = useState(1);
  const [tipoCliente, setTipoCliente] = useState('');
  const [empresa, setEmpresa] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [baseData, setBaseData] = useState(BASE_DATA_INICIAL);
  const [respuestas, setRespuestas] = useState({});
  const [producto, setProducto] = useState('');
  const [vendedorId, setVendedorId] = useState('');

  const [empresas, setEmpresas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [cargandoVendedores, setCargandoVendedores] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [camposGlobales, setCamposGlobales] = useState([]);
  const [opcionesProducto, setOpcionesProducto] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [cargandoCamposGlobales, setCargandoCamposGlobales] = useState(false);

  const tipoClienteOptionsFallback = getOptions('tipo_cliente');

  /** Campo "Tipo de cliente" de tabla campos: primero de globales (disponible al cargar), luego de camposFormulario. */
  const campoTipoCliente = camposGlobales.find(esCampoTipoCliente) ?? camposFormulario.find(esCampoTipoCliente);
  /** Opciones: de campo si existe, sino de getOptions. */
  const tipoClienteOptions = campoTipoCliente?.opciones?.length
    ? campoTipoCliente.opciones
    : tipoClienteOptionsFallback;

  /** Campo "Estado de venta" de tabla campos: se muestra en paso 4 junto al vendedor. Opciones y datos vienen exclusivamente de la tabla campos. */
  const campEstadoVenta = camposFormulario.find(esCampoEstadoVenta) ?? camposGlobales.find(esCampoEstadoVenta);

  const cargarEmpresas = useCallback(async () => {
    setCargandoEmpresas(true);
    try {
      const list = await listarEmpresasActivasParaSelect();
      setEmpresas(Array.isArray(list) ? list : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar empresas'), 'error');
      setEmpresas([]);
    } finally {
      setCargandoEmpresas(false);
    }
  }, [showSnackbar]);

  const cargarVendedores = useCallback(async () => {
    setCargandoVendedores(true);
    try {
      const { results } = await listarVendedores(1, 100, { estado: '1' });
      setVendedores(Array.isArray(results) ? results : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar vendedores'), 'error');
      setVendedores([]);
    } finally {
      setCargandoVendedores(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (servicio?.empresa_id && servicio?.id) {
      cargarVendedores();
    } else {
      setVendedores([]);
      setVendedorId('');
    }
  }, [servicio?.empresa_id, servicio?.id, cargarVendedores]);

  const cargarCamposGlobales = useCallback(async () => {
    setCargandoCamposGlobales(true);
    try {
      const campos = await apiCliente.obtenerCamposFormulario();
      setCamposGlobales(Array.isArray(campos) ? campos : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar campos del formulario'), 'error');
      setCamposGlobales([]);
    } finally {
      setCargandoCamposGlobales(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    cargarEmpresas();
    cargarCamposGlobales();
  }, [cargarEmpresas, cargarCamposGlobales]);

  const cargarServicios = useCallback(async () => {
    if (!empresa?.id) {
      setServicios([]);
      return;
    }
    setCargandoServicios(true);
    try {
      const list = await listarServiciosPorEmpresa(empresa.id);
      setServicios(Array.isArray(list) ? list : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar servicios'), 'error');
      setServicios([]);
    } finally {
      setCargandoServicios(false);
    }
  }, [empresa?.id, showSnackbar]);

  useEffect(() => {
    if (empresa?.id) {
      cargarServicios();
    } else {
      setServicios([]);
      setServicio(null);
    }
  }, [empresa?.id, cargarServicios]);

  const cargarOpcionesProducto = useCallback(async () => {
    try {
      const params = servicio?.empresa_id && servicio?.id
        ? { empresaId: servicio.empresa_id, servicioId: servicio.id }
        : {};
      const list = await apiCampos.obtenerOpcionesCampoPorNombre('producto', params);
      setOpcionesProducto(Array.isArray(list) ? list : []);
    } catch {
      setOpcionesProducto([]);
    }
  }, [servicio?.empresa_id, servicio?.id]);

  const cargarCamposFormulario = useCallback(async () => {
    if (!servicio?.empresa_id || !servicio?.id) {
      setCamposFormulario([]);
      return;
    }
    setCargandoCampos(true);
    try {
      const productoSeleccionado = (producto && producto !== '__todos__' && String(producto).trim()) ? producto.trim() : null;
      const soloSinProducto = !productoSeleccionado;
      const campos = await apiCliente.obtenerCamposFormulario(
        servicio.empresa_id,
        servicio.id,
        productoSeleccionado || undefined,
        soloSinProducto
      );
      setCamposFormulario(Array.isArray(campos) ? campos : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar campos del formulario'), 'error');
      setCamposFormulario([]);
    } finally {
      setCargandoCampos(false);
    }
  }, [servicio?.empresa_id, servicio?.id, producto, showSnackbar]);

  useEffect(() => {
    if (servicio?.empresa_id && servicio?.id) {
      cargarOpcionesProducto();
    } else {
      setOpcionesProducto([]);
    }
  }, [servicio?.empresa_id, servicio?.id, cargarOpcionesProducto]);

  useEffect(() => {
    if (servicio?.empresa_id && servicio?.id) {
      cargarCamposFormulario();
    } else {
      setCamposFormulario([]);
      setRespuestas({});
    }
  }, [servicio?.empresa_id, servicio?.id, producto, cargarCamposFormulario]);

  const actualizarRespuesta = (nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  };

  const validarTelefono = (t) => {
    const digits = (t || '').replace(/\D/g, '');
    return digits.length >= 5;
  };
  const validarCorreo = (e) => {
    const s = (e || '').trim();
    if (!s) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  };

  const puedeSiguientePaso = () => {
    if (paso === 1) {
      if (!campoTipoCliente) return false;
      const valorTipo = respuestas[campoTipoCliente.nombre];
      if (!valorTipo || !String(valorTipo).trim()) return false;
      if (!empresa || !servicio) return false;
      const prodEnCliente = campoTipoProducto && seccion(campoTipoProducto) === 'cliente';
      if (prodEnCliente && opcionesProducto?.length > 0 && !producto) return false;
      return true;
    }
    if (paso === 2) {
      if (!baseData.nombre?.trim()) return false;
      if (!baseData.numero_identificacion?.trim()) return false;
      if (!baseData.telefono?.trim()) return false;
      if (!validarTelefono(baseData.telefono)) return false;
      if (!baseData.correo?.trim()) return false;
      if (!validarCorreo(baseData.correo)) return false;
      const prodEnDatosBase = campoTipoProducto && seccion(campoTipoProducto) === 'datos_base';
      if (prodEnDatosBase && opcionesProducto?.length > 0 && !producto) return false;
      const requeridosDatosBase = camposSeccionDatosBase.filter((c) => c.requerido);
      const okDatosBase = requeridosDatosBase.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okDatosBase) return false;
      return true;
    }
    if (paso === 3) {
      const prodEnFormulario = campoTipoProducto && seccion(campoTipoProducto) === 'campos_formulario';
      if (prodEnFormulario && opcionesProducto?.length > 0 && !producto) return false;
      const requeridos = camposFormularioSinTipoCliente.filter((c) => c.requerido);
      const okRequeridos = requeridos.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okRequeridos) return false;
      if (cambioTitularMarcado) {
        const requeridosTitular = camposTitularDependientes.filter((c) => c.requerido);
        return requeridosTitular.every((c) => {
          const v = respuestas[c.nombre];
          return v != null && String(v).trim() !== '';
        });
      }
      return true;
    }
    if (paso === 4) {
      const prodEnVendedor = campoTipoProducto && seccion(campoTipoProducto) === 'vendedor';
      if (prodEnVendedor && opcionesProducto?.length > 0 && !producto) return false;
      const requeridosVendedor = camposSeccionVendedor.filter((c) => c.requerido);
      return requeridosVendedor.every((c) => {
        const v = esCampoVendedor(c.nombre) ? (respuestas[c.nombre] ?? vendedorId) : respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
    }
    return true;
  };

  const handleSiguiente = () => {
    if (paso < 4 && puedeSiguientePaso()) setPaso((p) => p + 1);
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso((p) => p - 1);
  };

  const handleLimpiar = () => {
    setPaso(1);
    setTipoCliente('');
    setEmpresa(null);
    setServicio(null);
    setProducto('');
    setBaseData({ ...BASE_DATA_INICIAL });
    setRespuestas({});
    setVendedorId('');
  };

  const handleGuardar = async () => {
    if (!empresa?.id || !servicio?.id) {
      showSnackbar('Seleccione servicio y contratista', 'error');
      return;
    }
    if (!baseData.nombre?.trim()) {
      showSnackbar('El nombre es obligatorio', 'error');
      return;
    }

    setGuardando(true);
    try {
      const respuestasObj = respuestas && typeof respuestas === 'object' ? respuestas : {};
      const respuestasEntries = Object.entries(respuestasObj)
        .filter(([, v]) => v != null && String(v).trim() !== '');

      const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
      const esTipoCliente = ([k]) => NOMBRES_TIPO_CLIENTE_CAMPO.some((n) => norm(k) === norm(n));
      const esEstadoVenta = ([k]) => NOMBRES_ESTADO_VENTA_CAMPO.some((n) => norm(k) === norm(n));
      const esProducto = ([k]) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(k) === norm(n));
      const esVendedor = ([k]) => /vendedor/i.test(norm(k));

      const nombresValidos = new Set([
        'vendedor',
        'Vendedor',
        ...(camposFormulario || []).map((c) => c.nombre).filter(Boolean),
        ...(camposGlobales || []).map((c) => c.nombre).filter(Boolean),
      ]);
      const esNombreValido = (nombre) =>
        nombresValidos.has(nombre) || [...nombresValidos].some((n) => norm(n) === norm(nombre));

      let respuestasList = respuestasEntries
        .filter(([k]) => !esProducto([k]) && esNombreValido(k))
        .map(([nombre_campo, respuesta_campo]) => ({ nombre_campo, respuesta_campo }));

      if (vendedorId && String(vendedorId).trim()) {
        respuestasList = respuestasList.filter((item) => !esVendedor([item.nombre_campo]));
        respuestasList.push({ nombre_campo: 'vendedor', respuesta_campo: String(vendedorId).trim() });
      }

      const productoVal = (producto && producto !== '__todos__') ? producto.trim() : undefined;
      const payload = {
        servicio_id: servicio.id,
        producto: productoVal,
        nombre: baseData.nombre.trim(),
        tipo_identificacion: baseData.tipo_identificacion?.trim() || '',
        numero_identificacion: baseData.numero_identificacion?.trim() || '',
        telefono: baseData.telefono?.trim() || '',
        correo: baseData.correo?.trim() || '',
        direccion: baseData.direccion?.trim() || '',
        respuestas: respuestasList,
      };

      await apiCliente.crearCliente(payload);

      showSnackbar('Cliente creado correctamente');
      navigate('/clientes');
    } catch (e) {
      const msg = getErrorMessage(e, e?.status, e?.response, 'Error al guardar el cliente');
      if (process.env.NODE_ENV === 'development') {
        console.error('[crearCliente] Error:', e?.status, e?.response, e);
      }
      showSnackbar(msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const CAMBIO_TITULAR_NAMES = ['cambio de titular', 'Cambio de titular', 'cambio titular', 'Cambio titular'];
  const esCambioTitular = (c) => CAMBIO_TITULAR_NAMES.some((n) => norm(c.nombre) === norm(n));

  /** Campos que solo se muestran cuando "Cambio de titular" = Sí. Todo viene de visible_si en Configuración → Campos. */
  const esVisibleSiCambioTitular = (c) => {
    const vs = (c.visible_si || '').toLowerCase().replace(/_/g, ' ').trim();
    return vs.includes('cambio') && vs.includes('titular');
  };

  const campoTitular = camposFormulario.find(esCambioTitular) ?? camposGlobales.find(esCambioTitular);
  const nombreCampoTitular = campoTitular?.nombre ?? 'Cambio de titular';
  const cambioTitularMarcado = (respuestas[nombreCampoTitular] === '1' || respuestas[nombreCampoTitular] === 'si' || respuestas[nombreCampoTitular] === true);

  const camposTitularDependientesRaw = [...camposFormulario, ...camposGlobales]
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCambioTitular(c) && esVisibleSiCambioTitular(c));
  const seenIds = new Set();
  const camposTitularDependientes = camposTitularDependientesRaw.filter((c) => {
    const key = c.id ?? c.nombre;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  const todosLosCampos = (() => {
    const seen = new Set();
    return [...camposFormulario, ...camposGlobales].filter((c) => {
      const key = c.id ?? c.nombre;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const seccion = (c) => (c.seccion || 'campos_formulario').toLowerCase();

  /** Campo Producto: se renderiza como selector en la sección que tenga asignada */
  const campoTipoProducto = todosLosCampos.find(esCampoProducto);

  /** Sección 1 (cliente): campos con seccion=cliente, excl. tipo_cliente que se maneja aparte, excl. producto (se renderiza aparte) */
  const camposSeccionCliente = todosLosCampos
    .filter((c) => seccion(c) === 'cliente' && !esCampoTipoCliente(c) && !esCampoProducto(c));

  /** Sección 2 (datos_base): campos con seccion=datos_base, excl. producto */
  const camposSeccionDatosBase = todosLosCampos.filter((c) => seccion(c) === 'datos_base' && !esCampoProducto(c));

  /** Sección 3 (campos_formulario): solo campos de esta sección, excl. tipo_cliente, producto, cambio titular, visible_si */
  const camposSeccionFormulario = todosLosCampos
    .filter((c) => seccion(c) === 'campos_formulario')
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCambioTitular(c) && !esVisibleSiCambioTitular(c))
    .sort((a, b) => (esCambioTitular(a) ? 1 : 0) - (esCambioTitular(b) ? 1 : 0));

  /** Sección 4 (vendedor): solo campos con seccion=vendedor */
  const camposSeccionVendedor = todosLosCampos.filter((c) => seccion(c) === 'vendedor');

  /** Paso 3: solo campos seccion=campos_formulario (campoTitular y dependientes se renderan aparte) */
  const camposFormularioSinTipoCliente = camposSeccionFormulario;

  return {
    paso,
    setPaso,
    tipoCliente,
    setTipoCliente,
    tipoClienteOptions,
    campoTipoCliente,
    empresa,
    setEmpresa,
    servicio,
    setServicio,
    producto,
    setProducto,
    opcionesProducto,
    baseData,
    setBaseData,
    respuestas,
    actualizarRespuesta,
    camposFormulario,
    camposFormularioSinTipoCliente,
    campEstadoVenta,
    empresas,
    servicios,
    guardando,
    cargandoEmpresas,
    cargandoServicios,
    cargandoCampos,
    cargandoCamposGlobales,
    handleSiguiente,
    handleAnterior,
    handleLimpiar,
    handleGuardar,
    puedeSiguientePaso,
    validarTelefono,
    validarCorreo,
    vendedorId,
    setVendedorId,
    vendedores,
    cargandoVendedores,
    campoTitular,
    nombreCampoTitular,
    cambioTitularMarcado,
    camposTitularDependientes,
    camposSeccionCliente,
    camposSeccionDatosBase,
    camposSeccionVendedor,
    campoTipoProducto,
  };
}
