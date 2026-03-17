import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiCliente from './apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';
import { listarServiciosPorEmpresa } from '../../servicios/logic/apiServicios';
import { listarEmpresasActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { useChoices } from '../../../context/ChoicesContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/funciones';

const BASE_DATA_INICIAL = {
  nombre: '',
  tipo_identificacion: '',
  numero_identificacion: '',
  telefono: '',
  direccion: '',
  cuenta_bancaria: '',
  compania_anterior: '',
  compania_actual: '',
  correo_electronico_o_carta: '',
};

/** Nombres que identifican tipo_cliente en campos dinámicos (viene de tabla campos, se muestra en paso 1; el resto en paso 3). */
const NOMBRES_TIPO_CLIENTE_CAMPO = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];

/** Nombres que identifican estado_venta en campos dinámicos (se muestra con el resto de campos en paso 3). */
const NOMBRES_ESTADO_VENTA_CAMPO = ['estado_venta', 'Estado de venta', 'Estado venta', 'estado venta'];

/** Campo Producto: producto, Productos, Tipo producto, tipo de producto */
const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto', 'Productos', 'Tipo producto', 'tipo de producto'];

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esCampoTipoCliente = (c) => NOMBRES_TIPO_CLIENTE_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoCups = (n) => /cups|cup/i.test(n || '');
const validarCupsValor = (v) => {
  const s = String(v || '').trim();
  if (!s) return true;
  const digitos = (s.match(/\d/g) || []).length;
  const letras = (s.match(/[a-zA-Z]/g) || []).length;
  return digitos >= 16 && letras >= 4;
};
const esCampoEstadoVenta = (c) => NOMBRES_ESTADO_VENTA_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoProducto = (c) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(c.nombre) === norm(n));
/** Detecta si el campo es de vendedor/comercial (excl. cerrador). Las opciones vienen de la tabla vendedores. */
const esCampoVendedor = (n) => /vendedor|comercial/i.test(n || '') && !/cerrador/i.test(n || '');

/**
 * Hook con la lógica del formulario de nuevo cliente (4 pasos).
 * Paso 1 "Cliente": tipo de cliente (getOptions) primero; al seleccionar aparecen empresa y servicio.
 * Paso 3: campos dinámicos (excluyendo tipo_cliente si existe en campos).
 */
export function useNuevoCliente() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { getOptions } = useChoices();
  const { user } = useAuth();
  const esAdmin = user?.perfil === 'admin';

  const [paso, setPaso] = useState(1);
  const [tipoCliente, setTipoCliente] = useState('');
  const [empresa, setEmpresa] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [baseData, setBaseData] = useState(BASE_DATA_INICIAL);
  const [respuestas, setRespuestas] = useState({});
  const [producto, setProducto] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [cerradorId, setCerradorId] = useState('');
  const [tieneCerrador, setTieneCerrador] = useState(false);
  const [documentoDni, setDocumentoDni] = useState(null);
  const [documentoFactura, setDocumentoFactura] = useState(null);

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
      // Solo campos globales sin restricción por producto (aplican a todos); así no mezclamos campos de otro producto
      const campos = await apiCliente.obtenerCamposFormulario(undefined, undefined, undefined, true);
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
      // No limpiar respuestas al cambiar servicio: preservar datos del usuario al volver atrás
    }
  }, [servicio?.empresa_id, servicio?.id, producto, cargarCamposFormulario]);

  const actualizarRespuesta = (nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  };

  const validarTelefono = (t) => {
    const digits = (t || '').replace(/\D/g, '');
    return digits.length >= 5;
  };
  const validarCorreoOCarta = (e) => {
    const s = (e || '').trim().toLowerCase();
    if (!s) return true;
    if (s === 'carta' || s === 'papel') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  };
  const validarCuentaBancaria = (c) => {
    const s = (c || '').trim();
    if (!s) return true;
    const nums = (s.match(/\d/g) || []).length;
    const lets = (s.match(/[a-zA-Z]/g) || []).length;
    return nums >= 22 && lets >= 2;
  };

  const puedeSiguientePaso = () => {
    if (stepType === 'cliente') {
      if (!campoTipoCliente) return false;
      const valorTipo = respuestas[campoTipoCliente.nombre];
      if (!valorTipo || !String(valorTipo).trim()) return false;
      if (!empresa || !servicio) return false;
      const prodEnCliente = campoTipoProducto && seccion(campoTipoProducto) === 'cliente';
      if (prodEnCliente && opcionesProducto?.length > 0 && !producto) return false;
      return true;
    }
    if (stepType === 'datos_base') {
      if (!baseData.nombre?.trim()) return false;
      if (!baseData.numero_identificacion?.trim()) return false;
      if (baseData.numero_identificacion?.trim().length < 3) return false;
      if (!baseData.telefono?.trim()) return false;
      if (!validarTelefono(baseData.telefono)) return false;
      if (!baseData.correo_electronico_o_carta?.trim()) return false;
      if (!validarCorreoOCarta(baseData.correo_electronico_o_carta)) return false;
      if (baseData.cuenta_bancaria?.trim() && !validarCuentaBancaria(baseData.cuenta_bancaria)) return false;
      const requeridosDatosBase = camposSeccionDatosBase.filter((c) => c.requerido);
      const okDatosBase = requeridosDatosBase.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okDatosBase) return false;
      const cupsInvalido = Object.entries(respuestas).some(([k, v]) => esCampoCups(k) && v != null && String(v).trim() !== '' && !validarCupsValor(v));
      if (cupsInvalido) return false;
      return true;
    }
    if (stepType === 'campos_del_formulario') {
      const prodEnFormulario = campoTipoProducto && seccion(campoTipoProducto) === 'campos_formulario';
      if (prodEnFormulario && opcionesProducto?.length > 0 && !producto) return false;
      const requeridos = camposFormularioSinTipoCliente.filter((c) => c.requerido);
      const okRequeridos = requeridos.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okRequeridos) return false;
      const cupsInvalido = Object.entries(respuestas).some(([k, v]) => esCampoCups(k) && v != null && String(v).trim() !== '' && !validarCupsValor(v));
      if (cupsInvalido) return false;
      if (cambioTitularMarcado) {
        const requeridosTitular = camposTitularDependientes.filter((c) => c.requerido);
        return requeridosTitular.every((c) => {
          const v = respuestas[c.nombre];
          return v != null && String(v).trim() !== '';
        });
      }
      return true;
    }
    if (stepType === 'comercial') {
      const prodEnVendedor = campoTipoProducto && seccion(campoTipoProducto) === 'vendedor';
      if (prodEnVendedor && opcionesProducto?.length > 0 && !producto) return false;
      const requeridosVendedor = camposSeccionVendedor.filter((c) => c.requerido);
      const okVendedor = requeridosVendedor.every((c) => {
        const v = esCampoVendedor(c.nombre) ? (respuestas[c.nombre] ?? vendedorId) : respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okVendedor) return false;
      const cupsInvalido = Object.entries(respuestas).some(([k, v]) => esCampoCups(k) && v != null && String(v).trim() !== '' && !validarCupsValor(v));
      if (cupsInvalido) return false;
      if (tieneCerrador && esAdmin && !cerradorId?.trim()) return false;
      return true;
    }
    if (stepType === 'documentos') {
      return true;  /* PDFs opcionales: se puede guardar con o sin documentos */
    }
    return true;
  };

  const handleSiguiente = () => {
    if (paso < totalSteps && puedeSiguientePaso()) setPaso((p) => p + 1);
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
    setCerradorId('');
    setTieneCerrador(false);
    setDocumentoDni(null);
    setDocumentoFactura(null);
  };

  /** Lógica por tipo de servicio (Paso 8 y 9) */
  const nombreServicio = (servicio?.nombre || '').toLowerCase();
  const nombreEmpresa = (empresa?.nombre || '').toLowerCase();
  const esOng = nombreServicio.includes('ong') || nombreEmpresa.includes('ong');
  const esEnergia = nombreServicio.includes('energía') || nombreServicio.includes('energia') || nombreEmpresa.includes('energía') || nombreEmpresa.includes('energia');
  const esOngOTelefonia = esOng || nombreServicio.includes('telefonía') || nombreServicio.includes('telefonia') || nombreEmpresa.includes('telefonía') || nombreEmpresa.includes('telefonia');

  const steps = (() => {
    const s = ['Cliente', 'Datos base'];
    if (!esOng) s.push('Campos del formulario');
    s.push('Comercial');
    if (esEnergia) s.push('Documentos');
    return s;
  })();
  const stepType = steps[paso - 1]?.toLowerCase().replace(/\s+/g, '_') ?? '';
  const totalSteps = steps.length;

  const handleGuardar = async () => {
    if (!empresa?.id || !servicio?.id) {
      showSnackbar('Seleccione servicio y compañía actual', 'error');
      return;
    }
    if (!baseData.nombre?.trim()) {
      showSnackbar('El nombre es obligatorio', 'error');
      return;
    }

    const cupsInvalido = Object.entries(respuestas || {}).some(([k, v]) => esCampoCups(k) && v != null && String(v).trim() !== '' && !validarCupsValor(v));
    if (cupsInvalido) {
      showSnackbar('El campo CUPS debe tener mínimo 16 dígitos y 4 letras', 'error');
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
      const esVendedor = ([k]) => /vendedor|comercial/i.test(norm(k)) && !/cerrador/i.test(norm(k));
      const esCerrador = ([k]) => /cerrador/i.test(norm(k));

      const nombresValidos = new Set([
        'vendedor',
        'Vendedor',
        'comercial',
        'Comercial',
        'cerrador',
        'Cerrador',
        ...(camposFormulario || []).map((c) => c.nombre).filter(Boolean),
        ...(camposGlobales || []).map((c) => c.nombre).filter(Boolean),
        ...getCamposRepetidosExpandidos().map((c) => c.nombre).filter(Boolean),
      ]);
      const esNombreValido = (nombre) =>
        nombresValidos.has(nombre) || [...nombresValidos].some((n) => norm(n) === norm(nombre));

      let respuestasList = respuestasEntries
        .filter(([k]) => !esProducto([k]) && esNombreValido(k))
        .map(([nombre_campo, respuesta_campo]) => ({ nombre_campo, respuesta_campo }));

      if (vendedorId && String(vendedorId).trim()) {
        respuestasList = respuestasList.filter((item) => !esVendedor([item.nombre_campo]));
        respuestasList.push({ nombre_campo: 'comercial', respuesta_campo: String(vendedorId).trim() });
      }
      if (tieneCerrador && cerradorId && String(cerradorId).trim()) {
        respuestasList = respuestasList.filter((item) => !esCerrador([item.nombre_campo]));
        respuestasList.push({ nombre_campo: 'cerrador', respuesta_campo: String(cerradorId).trim() });
      }

      const productoVal = (producto && producto !== '__todos__') ? producto.trim() : undefined;
      const payload = {
        servicio_id: servicio.id,
        producto: productoVal,
        nombre: baseData.nombre.trim(),
        tipo_identificacion: baseData.tipo_identificacion?.trim() || '',
        numero_identificacion: baseData.numero_identificacion?.trim() || '',
        telefono: baseData.telefono?.trim() || '',
        correo_electronico_o_carta: baseData.correo_electronico_o_carta?.trim() || '',
        direccion: baseData.direccion?.trim() || '',
        cuenta_bancaria: baseData.cuenta_bancaria?.trim() || '',
        compania_anterior: baseData.compania_anterior?.trim() || '',
        compania_actual: servicio?.nombre?.trim() || baseData.compania_actual?.trim() || '',
        respuestas: respuestasList,
      };

      const clienteCreado = await apiCliente.crearCliente(payload);
      const clienteId = clienteCreado?.id ?? clienteCreado?.data?.id;

      if (stepType === 'documentos' && clienteId && (documentoDni || documentoFactura)) {
        await apiCliente.subirDocumentos(clienteId, documentoDni, documentoFactura);
      }

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
    if (c.visible_si && typeof c.visible_si === 'object' && c.visible_si.repetir_segun) return false;
    const vs = (c.visible_si || '').toLowerCase().replace(/_/g, ' ').trim();
    return vs.includes('cambio') && vs.includes('titular');
  };

  /** Campos que se repiten N veces según el valor numérico de otro campo (ej: linea adicional (x) según lineas adicionales). */
  const esCampoRepetirSegun = (c) =>
    c.visible_si && typeof c.visible_si === 'object' && (c.visible_si.repetir_segun || '').trim();

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

  /** Sección 3 (campos_formulario): solo campos de esta sección, excl. tipo_cliente, producto, cambio titular, visible_si, repetir_segun */
  const camposSeccionFormulario = todosLosCampos
    .filter((c) => seccion(c) === 'campos_formulario')
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCambioTitular(c) && !esVisibleSiCambioTitular(c) && !esCampoRepetirSegun(c))
    .sort((a, b) => (esCambioTitular(a) ? 1 : 0) - (esCambioTitular(b) ? 1 : 0));

  /** Obtiene valor de respuestas por nombre de campo (búsqueda insensible a mayúsculas/espacios). */
  const getValorPorNombreCampo = (nombre) => {
    if (respuestas[nombre] !== undefined && respuestas[nombre] !== null) return respuestas[nombre];
    const n = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
    const target = n(nombre);
    for (const k of Object.keys(respuestas)) {
      if (n(k) === target) return respuestas[k];
    }
    return undefined;
  };

  /** Campos que se repiten según otro campo (ej: linea adicional (x) según lineas adicionales). Devuelve instancias expandidas. */
  const getCamposRepetidosExpandidos = () => {
    const repetidos = todosLosCampos.filter((c) => seccion(c) === 'campos_formulario' && esCampoRepetirSegun(c));
    const expandidos = [];
    const respuestasKeys = Object.keys(respuestas);
    for (const c of repetidos) {
      const nombreCampoCantidad = (c.visible_si?.repetir_segun || '').trim();
      let valorCantidad = getValorPorNombreCampo(nombreCampoCantidad);
      // Si no hay valor, buscar en todosLosCampos el campo que coincida (p. ej. "Lineas adicionales")
      if (valorCantidad == null || valorCantidad === '') {
        const nNorm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
        const targetNorm = nNorm(nombreCampoCantidad);
        const campoCantidad = todosLosCampos.find((cam) => nNorm(cam.nombre) === targetNorm);
        if (campoCantidad) valorCantidad = respuestas[campoCantidad.nombre];
      }
      let n = Math.min(20, Math.max(0, parseInt(String(valorCantidad || 0), 10) || 0));
      if (n === 0) {
        const nombreBase = (c.nombre || '').replace(/\(x\)|\(\$\)/i, '').trim();
        const regex = nombreBase
          ? new RegExp(`^${nombreBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)$`, 'i')
          : null;
        if (regex) {
          for (const k of respuestasKeys) {
            const m = k.match(regex);
            if (m) n = Math.max(n, parseInt(m[1], 10));
          }
        }
      }
      const nombreBase = c.nombre || '';
      const opcionesDesde = (c.visible_si?.opciones_desde || '').trim();
      let opcionesUsar = c.opciones;
      if (opcionesDesde) {
        const nNorm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
        const baseRef = opcionesDesde.replace(/\(x\)|\(\$\)/i, '').trim();
        const targetNorm = nNorm(baseRef);
        const campoRef = todosLosCampos.find((cam) => {
          const baseCam = (cam.nombre || '').replace(/\(x\)|\(\$\)/i, '').trim();
          return nNorm(baseCam) === targetNorm;
        });
        if (campoRef?.opciones?.length) opcionesUsar = campoRef.opciones;
      }
      const tienePlaceholder = /\(x\)|\(\$\)/i.test(nombreBase);
      for (let i = 1; i <= n; i++) {
        const nombreConNumero = tienePlaceholder
          ? nombreBase.replace(/\(x\)|\(\$\)/i, `(${i})`)
          : `${nombreBase.trim()} (${i})`;
        expandidos.push({ ...c, nombre: nombreConNumero, _indice: i, opciones: opcionesUsar ?? c.opciones });
      }
    }
    return expandidos;
  };

  /** Sección 4 (vendedor): solo campos con seccion=vendedor */
  const camposSeccionVendedor = todosLosCampos.filter((c) => seccion(c) === 'vendedor');

  /** Paso 3: solo campos seccion=campos_formulario (campoTitular y dependientes se renderan aparte) */
  const camposFormularioSinTipoCliente = camposSeccionFormulario;
  const camposRepetidosExpandidos = getCamposRepetidosExpandidos();

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
    camposRepetidosExpandidos,
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
    validarCorreoOCarta,
    validarCuentaBancaria,
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
    steps,
    totalSteps,
    stepType,
    esOngOTelefonia,
    cerradorId,
    setCerradorId,
    tieneCerrador,
    setTieneCerrador,
    documentoDni,
    setDocumentoDni,
    documentoFactura,
    setDocumentoFactura,
  };
}
