import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiCliente from './apiCliente';
import { listarServiciosActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { useOpcionesPorEntidad } from './opcionesEntidad';
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
  const [camposPorSeccion, setCamposPorSeccion] = useState({
    cliente: [],
    datos_base: [],
    campos_formulario: [],
    vendedor: [],
  });
  const [guardando, setGuardando] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const loadedSeccionesRef = useRef({ cliente: false, datos_base: false, campos_formulario: false, vendedor: false });
  /** Último valor de producto con el que se cargó campos_formulario; al cambiar, se vuelve a pedir la lista. */
  const lastProductValueFormularioRef = useRef(null);
  /** Promesa en curso por sección: evita doble petición cuando Strict Mode ejecuta el efecto dos veces. */
  const promesaSeccionRef = useRef({});

  /** Valor seleccionado en el campo Producto (desde respuestas) para usar en paso 3 al pedir campos. */
  const productValueFromRespuestas = useMemo(() => {
    for (const name of NOMBRES_PRODUCTO_CAMPO) {
      const v = respuestas[name];
      if (v != null && String(v).trim() !== '') return String(v).trim();
    }
    return null;
  }, [respuestas]);

  const tipoClienteOptionsFallback = getOptions('tipo_cliente');

  /** Merge de todas las secciones ya cargadas (para derivados que usaban camposGlobales + camposFormulario). */
  const todosLosCamposRaw = [
    ...(camposPorSeccion.cliente || []),
    ...(camposPorSeccion.datos_base || []),
    ...(camposPorSeccion.campos_formulario || []),
    ...(camposPorSeccion.vendedor || []),
  ];
  const todosLosCamposUnicos = (() => {
    const seen = new Set();
    return todosLosCamposRaw.filter((c) => {
      const key = c.id ?? c.nombre;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  /** Campo "Tipo de cliente": primero sección cliente, luego campos_formulario. */
  const campoTipoCliente = (camposPorSeccion.cliente || []).find(esCampoTipoCliente)
    ?? (camposPorSeccion.campos_formulario || []).find(esCampoTipoCliente);
  /** Opciones: de campo si existe, sino de getOptions. */
  const tipoClienteOptions = campoTipoCliente?.opciones?.length
    ? campoTipoCliente.opciones
    : tipoClienteOptionsFallback;

  /** Campo "Estado de venta" de tabla campos: se muestra en paso 4 junto al vendedor. */
  const campEstadoVenta = todosLosCamposUnicos.find(esCampoEstadoVenta);

  /** Mantener tipoCliente en sync con respuestas por si algún componente lo lee. */
  useEffect(() => {
    if (campoTipoCliente?.nombre) {
      setTipoCliente(respuestas[campoTipoCliente.nombre] ?? '');
    }
  }, [campoTipoCliente?.nombre, respuestas]);

  const cargarEmpresas = useCallback(async () => {
    setCargandoEmpresas(true);
    try {
      const list = await listarServiciosActivasParaSelect();
      setEmpresas(Array.isArray(list) ? list : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar servicios'), 'error');
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
    if (empresa?.id && servicio?.id) {
      cargarVendedores();
    } else {
      setVendedores([]);
      setVendedorId('');
    }
  }, [empresa?.id, servicio?.id, cargarVendedores]);

  /** No cargar empresas/servicios al montar; las entidades se cargan solo cuando el campo está habilitado (vía entity_select). */

  /** No cargar lista de contratistas al cambiar de paso: no se usa en el wizard (opciones vía relaciones/opciones). Evita llamadas a relaciones/opciones y contratistas/?page_size=500 al pulsar Siguiente. */

  /** Al cambiar de paso (Siguiente o Anterior), forzar consulta de la sección actual para listar solo sus campos. */
  const fetchFormularioInFlightRef = useRef({});
  const pasoAnteriorRef = useRef(paso);
  useEffect(() => {
    const seccionPorPaso = { 1: 'cliente', 2: 'datos_base', 3: 'campos_formulario', 4: 'vendedor' };
    const seccion = seccionPorPaso[paso];
    if (!seccion) return;
    const pasoCambio = pasoAnteriorRef.current !== paso;
    if (pasoCambio) {
      pasoAnteriorRef.current = paso;
      loadedSeccionesRef.current[seccion] = false;
      promesaSeccionRef.current[seccion] = null;
    }
    if (seccion === 'campos_formulario' && paso === 3) {
      if (productValueFromRespuestas !== lastProductValueFormularioRef.current) {
        lastProductValueFormularioRef.current = productValueFromRespuestas;
        loadedSeccionesRef.current[seccion] = false;
      }
    }
    if (loadedSeccionesRef.current[seccion]) return;
    if ((seccion === 'datos_base' || seccion === 'campos_formulario' || seccion === 'vendedor') && (!empresa?.id || !servicio?.id)) {
      return;
    }
    const servicioId = (empresa?.id != null && servicio?.id != null) ? empresa.id : null;
    const contratistaId = (empresa?.id != null && servicio?.id != null) ? servicio.id : null;
    const esPasoCamposFormulario = seccion === 'campos_formulario' && paso === 3;
    const productoVal = esPasoCamposFormulario
      ? (productValueFromRespuestas || null)
      : ((producto && producto !== '__todos__' && String(producto).trim()) ? producto.trim() : null);
    const soloSinProducto = !productoVal;
    const productoId = esPasoCamposFormulario && productValueFromRespuestas != null && String(productValueFromRespuestas).trim() !== ''
      ? (Number(productValueFromRespuestas) || productValueFromRespuestas)
      : null;

    if (fetchFormularioInFlightRef.current[seccion]) return;
    fetchFormularioInFlightRef.current[seccion] = true;

    let cancelled = false;
    setCargandoCampos(true);
    const promise = apiCliente
      .obtenerCamposFormulario(servicioId, contratistaId, productoVal || undefined, soloSinProducto, seccion, productoId)
      .then((campos) => Array.isArray(campos) ? campos : []);

    promise
      .then((campos) => {
        if (!cancelled) {
          setCamposPorSeccion((prev) => ({ ...prev, [seccion]: campos }));
          loadedSeccionesRef.current[seccion] = true;
          if (seccion === 'campos_formulario') lastProductValueFormularioRef.current = productValueFromRespuestas;
        }
      })
      .catch((e) => {
        if (!cancelled) {
          showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar campos del formulario'), 'error');
          setCamposPorSeccion((prev) => ({ ...prev, [seccion]: [] }));
          loadedSeccionesRef.current[seccion] = false;
        }
      })
      .finally(() => {
        fetchFormularioInFlightRef.current[seccion] = false;
        setCargandoCampos(false);
        if (cancelled) loadedSeccionesRef.current[seccion] = false;
      });
    return () => {
      cancelled = true;
      // Liberar el lock para que una segunda ejecución del efecto (p. ej. React Strict Mode) pueda hacer su propia petición
      if (seccion) fetchFormularioInFlightRef.current[seccion] = false;
    };
  }, [paso, empresa?.id, servicio?.id, producto, productValueFromRespuestas, showSnackbar]);

  const actualizarRespuesta = (nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  };

  /** Limpia en next los valores de todos los campos que dependen (directa o indirectamente) del campo con id campoId. */
  const limpiarDependientesDe = useCallback((next, campos, campoId) => {
    if (!campoId || !Array.isArray(campos)) return;
    campos.forEach((c) => {
      if (c.depende_de === campoId) {
        if (c.nombre) next[c.nombre] = '';
        limpiarDependientesDe(next, campos, c.id);
      }
    });
  }, []);

  /** Actualiza una respuesta y limpia los valores de los campos que dependen de este (por depende_de). */
  const actualizarRespuestaConResetDependientes = useCallback(
    (nombreCampo, valor, listaCampos) => {
      setRespuestas((prev) => {
        const next = { ...prev, [nombreCampo]: valor };
        const lista = Array.isArray(listaCampos) ? listaCampos : [];
        const campoActual = lista.find((c) => c.nombre === nombreCampo);
        if (campoActual?.id) limpiarDependientesDe(next, lista, campoActual.id);
        return next;
      });
    },
    [limpiarDependientesDe]
  );

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
      if (!camposOrdenadosCliente?.length) return false;
      const requeridosCliente = camposOrdenadosCliente.filter(
        (c) => c.requerido && getValorPadre(c, camposOrdenadosCliente)
      );
      const okRequeridos = requeridosCliente.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okRequeridos) return false;
      const valorTipo = campoTipoCliente && respuestas[campoTipoCliente.nombre];
      if (campoTipoCliente && (!valorTipo || !String(valorTipo).trim())) return false;
      const prodEnCliente = campoTipoProducto && seccion(campoTipoProducto) === 'cliente';
      const valorProducto = campoTipoProducto ? (respuestas[campoTipoProducto.nombre] ?? producto) : producto;
      if (prodEnCliente && campoTipoProducto?.requerido && !(valorProducto != null && String(valorProducto).trim() !== '')) return false;
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
      const valorProducto = campoTipoProducto ? (respuestas[campoTipoProducto.nombre] ?? producto) : producto;
      if (prodEnDatosBase && campoTipoProducto?.requerido && !(valorProducto != null && String(valorProducto).trim() !== '')) return false;
      const requeridosDatosBase = camposSeccionDatosBase.filter(
        (c) => c.requerido && getValorPadre(c, camposSeccionDatosBase)
      );
      const okDatosBase = requeridosDatosBase.every((c) => {
        const v = respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
      if (!okDatosBase) return false;
      return true;
    }
    if (paso === 3) {
      const prodEnFormulario = campoTipoProducto && seccion(campoTipoProducto) === 'campos_formulario';
      const valorProducto = campoTipoProducto ? (respuestas[campoTipoProducto.nombre] ?? producto) : producto;
      if (prodEnFormulario && campoTipoProducto?.requerido && !(valorProducto != null && String(valorProducto).trim() !== '')) return false;
      const requeridos = camposFormularioSinTipoCliente.filter(
        (c) => c.requerido && getValorPadre(c, camposFormularioSinTipoCliente)
      );
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
      const valorProducto = campoTipoProducto ? (respuestas[campoTipoProducto.nombre] ?? producto) : producto;
      if (prodEnVendedor && campoTipoProducto?.requerido && !(valorProducto != null && String(valorProducto).trim() !== '')) return false;
      const requeridosVendedor = camposSeccionVendedor.filter(
        (c) => c.requerido && getValorPadre(c, camposSeccionVendedor)
      );
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
    setCamposPorSeccion({ cliente: [], datos_base: [], campos_formulario: [], vendedor: [] });
    loadedSeccionesRef.current = { cliente: false, datos_base: false, campos_formulario: false, vendedor: false };
    promesaSeccionRef.current = {};
    fetchFormularioInFlightRef.current = {};
    pasoAnteriorRef.current = 1;
    lastProductValueFormularioRef.current = null;
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
        ...todosLosCamposUnicos.map((c) => c.nombre).filter(Boolean),
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

      const productoVal = (campoTipoProducto ? (respuestas[campoTipoProducto.nombre] ?? producto) : producto);
      const productoValTrim = (productoVal && productoVal !== '__todos__') ? String(productoVal).trim() : undefined;
      const payload = {
        servicio_id: empresa.id,
        contratista_id: servicio.id,
        producto: productoValTrim || undefined,
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

  /** Campos que solo se muestran cuando "Cambio de titular" = Sí (por visible_si en Configuración). */
  const esVisibleSiCambioTitular = (c) => {
    const vs = c.visible_si;
    if (!vs) return false;
    if (typeof vs === 'object' && vs.campo) {
      const name = String(vs.campo).toLowerCase().replace(/_/g, ' ');
      return name.includes('cambio') && name.includes('titular');
    }
    const str = (vs || '').toLowerCase().replace(/_/g, ' ').trim();
    return str.includes('cambio') && str.includes('titular');
  };

  const seccion = (c) => (c.seccion || 'campos_formulario').toLowerCase();
  const campoTitular = todosLosCamposUnicos.find(esCambioTitular);
  const nombreCampoTitular = campoTitular?.nombre ?? 'Cambio de titular';
  const cambioTitularMarcado = (respuestas[nombreCampoTitular] === '1' || respuestas[nombreCampoTitular] === 'si' || respuestas[nombreCampoTitular] === true);

  const camposTitularDependientesRaw = todosLosCamposUnicos
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCambioTitular(c) && esVisibleSiCambioTitular(c));
  const seenIds = new Set();
  const camposTitularDependientes = camposTitularDependientesRaw.filter((c) => {
    const key = c.id ?? c.nombre;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });

  /** Campo Producto: se renderiza como selector en la sección que tenga asignada */
  const campoTipoProducto = todosLosCamposUnicos.find(esCampoProducto);

  /** Sección 1 (cliente): campos con seccion=cliente, excl. tipo_cliente que se maneja aparte, excl. producto (se renderiza aparte) */
  const camposSeccionCliente = todosLosCamposUnicos
    .filter((c) => seccion(c) === 'cliente' && !esCampoTipoCliente(c) && !esCampoProducto(c));

  /** Todos los campos de la sección cliente en orden (incl. Tipo Cliente) para mostrar todos desde el inicio y aplicar disabled por anterior. */
  const camposOrdenadosCliente = useMemo(() => {
    const raw = camposPorSeccion.cliente || [];
    return [...raw].sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999) || (a.id || 0) - (b.id || 0));
  }, [camposPorSeccion.cliente]);

  /** Valor del campo padre (por depende_de). Si no hay depende_de, se considera habilitado. Usar lista que incluya padres (ej. listaCamposConPadres). */
  const getValorPadre = useCallback(
    (campo, camposList) => {
      if (!campo.depende_de) return true;
      const lista = Array.isArray(camposList) ? camposList : (camposOrdenadosCliente || []);
      const padre = lista.find((f) => f.id === campo.depende_de);
      if (!padre?.nombre) return false;
      const v = respuestas[padre.nombre];
      return v !== undefined && v !== null && String(v).trim() !== '';
    },
    [camposOrdenadosCliente, respuestas]
  );

  /** Entidades a cargar en paso 1: solo entity_select SIN depende_de (los que dependen se cargan vía relaciones/opciones). */
  const entidadesHabilitadasCliente = useMemo(() => {
    const out = [];
    const lista = camposOrdenadosCliente || [];
    lista.forEach((c) => {
      if (c.tipo !== 'entity_select' || !c.entidad || c.depende_de) return;
      if (getValorPadre(c, lista)) out.push(String(c.entidad).trim().toLowerCase());
    });
    return [...new Set(out)];
  }, [camposOrdenadosCliente, respuestas, getValorPadre]);

  /** Sección 2 (datos_base): campos con seccion=datos_base, excl. producto */
  const camposSeccionDatosBase = todosLosCamposUnicos.filter((c) => seccion(c) === 'datos_base' && !esCampoProducto(c));

  /** Sección 3 (campos_formulario): todos los campos de esta sección (incl. con visible_si); la visibilidad se evalúa en render con esVisible(campo, respuestas). */
  const camposSeccionFormulario = todosLosCamposUnicos
    .filter((c) => seccion(c) === 'campos_formulario')
    .filter((c) => !esCampoTipoCliente(c) && !esCambioTitular(c))
    .sort((a, b) => (esCambioTitular(a) ? 1 : 0) - (esCambioTitular(b) ? 1 : 0));

  /** Sección 4 (vendedor): solo campos con seccion=vendedor */
  const camposSeccionVendedor = todosLosCamposUnicos.filter((c) => seccion(c) === 'vendedor');

  /** Paso 3: solo campos seccion=campos_formulario (campoTitular y dependientes se renderan aparte) */
  const camposFormularioSinTipoCliente = camposSeccionFormulario;

  /** Campos del paso actual (para pasos 2–4). */
  const camposDelPaso = useMemo(() => {
    if (paso === 1) return [];
    if (paso === 2) return camposPorSeccion.datos_base || [];
    if (paso === 3) return camposPorSeccion.campos_formulario || [];
    if (paso === 4) return camposPorSeccion.vendedor || [];
    return [];
  }, [paso, camposPorSeccion.datos_base, camposPorSeccion.campos_formulario, camposPorSeccion.vendedor]);

  /** Lista que incluye campos del paso actual + padres (ej. cliente) para resolver depende_de y cargar opciones vía relaciones. */
  const listaCamposConPadres = useMemo(() => {
    if (paso === 1) return camposOrdenadosCliente || [];
    const base = camposOrdenadosCliente || [];
    const delPaso = camposDelPaso || [];
    const byId = new Map();
    [...base, ...delPaso].forEach((c) => {
      if (c.id != null && !byId.has(c.id)) byId.set(c.id, c);
    });
    return Array.from(byId.values());
  }, [paso, camposOrdenadosCliente, camposDelPaso]);

  /** Entidades a cargar: solo las SIN depende_de (las dependientes se cargan vía relaciones/opciones). */
  const entidadesParaOpciones = useMemo(() => {
    if (paso === 1) return entidadesHabilitadasCliente;
    const lista = listaCamposConPadres;
    return lista
      .filter((c) => c.tipo === 'entity_select' && c.entidad && !c.depende_de && getValorPadre(c, lista))
      .map((c) => String(c.entidad).trim().toLowerCase());
  }, [paso, entidadesHabilitadasCliente, listaCamposConPadres, getValorPadre]);

  /** Campos para el hook de opciones: lista con padres para que dependientes (ej. producto → contratista) resuelvan y usen /api/relaciones/opciones/. */
  const { opcionesPorEntidad, loadingEntidad } = useOpcionesPorEntidad(
    entidadesParaOpciones,
    listaCamposConPadres,
    respuestas
  );

  /** Actualizar respuesta y resetear campos que dependen de este (por depende_de). Usa todos los campos para limpiar dependientes en cualquier sección. */
  const actualizarRespuestaClienteConReset = useCallback(
    (nombre, valor, indiceEnOrden) => {
      setRespuestas((prev) => {
        const next = { ...prev, [nombre]: valor };
        const lista = todosLosCamposUnicos || [];
        const campoActual = lista.find((c) => c.nombre === nombre);
        if (campoActual?.id) limpiarDependientesDe(next, lista, campoActual.id);
        return next;
      });
    },
    [todosLosCamposUnicos, limpiarDependientesDe]
  );

  /** Sincronizar empresa y servicio desde respuestas de entity_select (Servicio → empresa, Contratista → servicio). */
  useEffect(() => {
    const campoServicio = camposOrdenadosCliente.find((c) => c.tipo === 'entity_select' && (c.entidad || '').toLowerCase() === 'servicio');
    const campoContratista = camposOrdenadosCliente.find((c) => c.tipo === 'entity_select' && (c.entidad || '').toLowerCase() === 'contratista');
    const idServicio = campoServicio && respuestas[campoServicio.nombre];
    const idContratista = campoContratista && respuestas[campoContratista.nombre];
    const listServicio = opcionesPorEntidad.servicio || [];
    const keyContratista = campoContratista?.depende_de && idServicio != null
      ? `contratista_${idServicio}`
      : 'contratista';
    const listContratista = opcionesPorEntidad[keyContratista] || [];
    if (idServicio && listServicio.length) {
      const opt = listServicio.find((o) => String(o.value) === String(idServicio));
      setEmpresa(opt ? { id: Number(opt.value), nombre: opt.label } : null);
    } else {
      setEmpresa(null);
    }
    if (idContratista && listContratista.length) {
      const opt = listContratista.find((o) => String(o.value) === String(idContratista));
      setServicio(opt ? { id: Number(opt.value), nombre: opt.label } : null);
    } else {
      setServicio(null);
    }
  }, [camposOrdenadosCliente, respuestas, opcionesPorEntidad]);

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
    baseData,
    setBaseData,
    respuestas,
    actualizarRespuesta,
    camposOrdenadosCliente,
    listaCamposConPadres,
    actualizarRespuestaClienteConReset,
    camposFormulario: camposPorSeccion.campos_formulario || [],
    camposFormularioSinTipoCliente,
    campEstadoVenta,
    empresas,
    servicios,
    guardando,
    cargandoEmpresas,
    cargandoServicios,
    cargandoCampos,
    cargandoCamposGlobales: false,
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
    opcionesPorEntidad,
    loadingEntidad,
    getValorPadre,
    camposDelPaso,
    actualizarRespuestaConResetDependientes,
    todosLosCamposUnicos,
  };
}
