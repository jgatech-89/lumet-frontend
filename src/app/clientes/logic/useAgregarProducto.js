import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as apiCliente from './apiCliente';
import { useOpcionesPorEntidad } from './opcionesEntidad';
import * as apiCampos from '../../campos/logic/apiCampos';
import { listarContratistasPorServicio } from '../../servicios/logic/apiServicios';
import { listarServiciosActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { useChoices } from '../../../context/ChoicesContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';

/** Nombres que identifican tipo_cliente en campos dinámicos. */
const NOMBRES_TIPO_CLIENTE_CAMPO = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];

/** Nombres que identifican estado_venta en campos dinámicos. */
const NOMBRES_ESTADO_VENTA_CAMPO = ['estado_venta', 'Estado de venta', 'Estado venta', 'estado venta'];

/** Campo Producto: producto, Productos, Tipo producto, tipo de producto */
const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto', 'Productos', 'Tipo producto', 'tipo de producto'];

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');
const esCampoTipoCliente = (c) => NOMBRES_TIPO_CLIENTE_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoEstadoVenta = (c) => NOMBRES_ESTADO_VENTA_CAMPO.some((n) => norm(c.nombre) === norm(n));
const esCampoProducto = (c) => NOMBRES_PRODUCTO_CAMPO.some((n) => norm(c.nombre) === norm(n));

/**
 * Hook para agregar producto a un cliente existente.
 * Solo 3 pasos: (1) Tipo/Empresa/Servicio, (2) Campos del formulario, (3) Vendedor.
 * No incluye paso de datos base del cliente.
 */
export function useAgregarProducto(cliente, onExito) {
  const { showSnackbar } = useSnackbar();
  const { getOptions } = useChoices();

  const [paso, setPaso] = useState(1);
  const [tipoCliente, setTipoCliente] = useState('');
  const [empresa, setEmpresa] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [producto, setProducto] = useState('');
  const [vendedorId, setVendedorId] = useState('');

  const [empresas, setEmpresas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [cargandoVendedores, setCargandoVendedores] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [camposPorSeccion, setCamposPorSeccion] = useState({
    cliente: [],
    campos_formulario: [],
    vendedor: [],
  });
  const [opcionesProducto, setOpcionesProducto] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const loadedSeccionesRef = useRef({ cliente: false, campos_formulario: false, vendedor: false });
  const lastProductoIdFormularioRef = useRef(null);
  const promesaSeccionRef = useRef({});

  const tipoClienteOptionsFallback = getOptions('tipo_cliente');
  const todosLosCamposRaw = [
    ...(camposPorSeccion.cliente || []),
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
  const campoTipoCliente = (camposPorSeccion.cliente || []).find(esCampoTipoCliente)
    ?? (camposPorSeccion.campos_formulario || []).find(esCampoTipoCliente);
  const tipoClienteOptions = campoTipoCliente?.opciones?.length
    ? campoTipoCliente.opciones
    : tipoClienteOptionsFallback;

  const campEstadoVenta = todosLosCamposUnicos.find(esCampoEstadoVenta);

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
    if (servicio?.empresa_id && servicio?.id) {
      cargarVendedores();
    } else {
      setVendedores([]);
      setVendedorId('');
    }
  }, [empresa?.id, servicio?.id, cargarVendedores]);

  useEffect(() => {
    cargarEmpresas();
  }, [cargarEmpresas]);

  useEffect(() => {
    if (!cliente?.id) {
      setPaso(1);
      setTipoCliente('');
      setEmpresa(null);
      setServicio(null);
      setRespuestas({});
      setProducto('');
      setVendedorId('');
    }
  }, [cliente?.id]);

  const cargarServicios = useCallback(async () => {
    if (!empresa?.id) {
      setServicios([]);
      return;
    }
    setCargandoServicios(true);
    try {
      const list = await listarContratistasPorServicio(empresa.id);
      setServicios(Array.isArray(list) ? list : []);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar contratistas'), 'error');
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
      const params = empresa?.id && servicio?.id
        ? { servicioId: empresa.id, contratistaId: servicio.id }
        : {};
      const list = await apiCampos.obtenerOpcionesCampoPorNombre('producto', params);
      setOpcionesProducto(Array.isArray(list) ? list : []);
    } catch {
      setOpcionesProducto([]);
    }
  }, [empresa?.id, servicio?.id]);

  useEffect(() => {
    if (empresa?.id && servicio?.id) {
      cargarOpcionesProducto();
    } else {
      setOpcionesProducto([]);
    }
  }, [empresa?.id, servicio?.id, cargarOpcionesProducto]);

  /** Una sola consulta por sección al montar el paso. En campos_formulario, al cambiar producto se recarga con producto_id. */
  useEffect(() => {
    const seccionPorPaso = { 1: 'cliente', 2: 'campos_formulario', 3: 'vendedor' };
    const seccion = seccionPorPaso[paso];
    if (!seccion) return;
    if (seccion === 'campos_formulario' && producto !== lastProductoIdFormularioRef.current) {
      lastProductoIdFormularioRef.current = producto;
      loadedSeccionesRef.current[seccion] = false;
    }
    if (loadedSeccionesRef.current[seccion]) return;
    if ((seccion === 'campos_formulario' || seccion === 'vendedor') && (!empresa?.id || !servicio?.id)) return;
    const servicioId = (empresa?.id != null && servicio?.id != null) ? empresa.id : null;
    const contratistaId = (empresa?.id != null && servicio?.id != null) ? servicio.id : null;
    const esCamposFormulario = seccion === 'campos_formulario';
    const productoVal = (producto && producto !== '__todos__' && String(producto).trim()) ? producto.trim() : null;
    const soloSinProducto = !productoVal;
    const productoId = esCamposFormulario && productoVal ? (Number(productoVal) || productoVal) : null;

    let promise = promesaSeccionRef.current[seccion];
    if (promise) {
      setCargandoCampos(true);
      promise
        .then((campos) => {
          setCamposPorSeccion((prev) => ({ ...prev, [seccion]: Array.isArray(campos) ? campos : [] }));
          loadedSeccionesRef.current[seccion] = true;
        })
        .catch(() => {})
        .finally(() => setCargandoCampos(false));
      return;
    }

    let cancelled = false;
    setCargandoCampos(true);
    promise = apiCliente
      .obtenerCamposFormulario(servicioId, contratistaId, productoVal || undefined, soloSinProducto, seccion, productoId)
      .then((campos) => Array.isArray(campos) ? campos : []);
    promesaSeccionRef.current[seccion] = promise;

    promise
      .then((campos) => {
        if (!cancelled) {
          setCamposPorSeccion((prev) => ({ ...prev, [seccion]: campos }));
          loadedSeccionesRef.current[seccion] = true;
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
        promesaSeccionRef.current[seccion] = null;
        setCargandoCampos(false);
        if (cancelled) loadedSeccionesRef.current[seccion] = false;
      });
    return () => { cancelled = true; };
  }, [paso, empresa?.id, servicio?.id, producto, showSnackbar]);

  const actualizarRespuesta = (nombreCampo, valor) => {
    setRespuestas((p) => ({ ...p, [nombreCampo]: valor }));
  };

  const puedeSiguientePaso = () => {
    if (paso === 1) {
      if (!campoTipoCliente) return false;
      const valorTipo = respuestas[campoTipoCliente.nombre];
      if (!valorTipo || !String(valorTipo).trim()) return false;
      if (!empresa || !servicio) return false;
      const prodEnPaso1 = campoTipoProducto && ['cliente', 'datos_base'].includes(seccion(campoTipoProducto));
      if (prodEnPaso1 && opcionesProducto?.length > 0 && !producto) return false;
      return true;
    }
    if (paso === 2) {
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
    if (paso === 3) {
      const prodEnVendedor = campoTipoProducto && seccion(campoTipoProducto) === 'vendedor';
      if (prodEnVendedor && opcionesProducto?.length > 0 && !producto) return false;
      const esCampoVendedor = (n) => /vendedor/i.test(n || '');
      const requeridosVendedor = camposSeccionVendedor.filter((c) => c.requerido);
      return requeridosVendedor.every((c) => {
        const v = esCampoVendedor(c.nombre) ? (respuestas[c.nombre] ?? vendedorId) : respuestas[c.nombre];
        return v != null && String(v).trim() !== '';
      });
    }
    return true;
  };

  const handleSiguiente = () => {
    if (paso < 3 && puedeSiguientePaso()) setPaso((p) => p + 1);
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso((p) => p - 1);
  };

  const handleLimpiar = () => {
    setPaso(1);
    setTipoCliente('');
    setEmpresa(null);
    setServicio(null);
    setRespuestas({});
    setProducto('');
    setVendedorId('');
    setCamposPorSeccion({ cliente: [], campos_formulario: [], vendedor: [] });
    loadedSeccionesRef.current = { cliente: false, campos_formulario: false, vendedor: false };
    promesaSeccionRef.current = {};
  };

  const handleGuardar = async () => {
    if (!cliente?.id) return;
    if (!empresa?.id || !servicio?.id) {
      showSnackbar('Seleccione empresa y servicio', 'error');
      return;
    }

    setGuardando(true);
    try {
      const respuestasObj = respuestas && typeof respuestas === 'object' ? respuestas : {};
      const respuestasEntries = Object.entries(respuestasObj)
        .filter(([, v]) => v != null && String(v).trim() !== '');

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
        .filter(([k]) => !esProducto([k]) && !esEstadoVenta([k]) && esNombreValido(k))
        .map(([nombre_campo, respuesta_campo]) => ({ nombre_campo, respuesta_campo }));

      if (vendedorId && String(vendedorId).trim()) {
        respuestasList = respuestasList.filter((item) => !esVendedor([item.nombre_campo]));
        respuestasList.push({ nombre_campo: 'vendedor', respuesta_campo: String(vendedorId).trim() });
      }

      const productoVal = (producto && producto !== '__todos__') ? producto.trim() : undefined;
      const payload = {
        servicio_id: empresa.id,
        contratista_id: servicio.id,
        producto: productoVal,
        respuestas: respuestasList,
      };

      await apiCliente.agregarProductoCliente(cliente.id, payload);

      showSnackbar('Producto agregado correctamente.', 'success');
      handleLimpiar();
      onExito?.();
    } catch (e) {
      const msg = getErrorMessage(e, e?.status, e?.response, 'Error al agregar producto');
      showSnackbar(msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const CAMBIO_TITULAR_NAMES = ['cambio de titular', 'Cambio de titular', 'cambio titular', 'Cambio titular'];
  const esCambioTitular = (c) => CAMBIO_TITULAR_NAMES.some((n) => norm(c.nombre) === norm(n));

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

  const campoTipoProducto = todosLosCamposUnicos.find(esCampoProducto);
  const camposSeccionFormulario = todosLosCamposUnicos
    .filter((c) => seccion(c) === 'campos_formulario')
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCampoEstadoVenta(c) && !esCambioTitular(c))
    .sort((a, b) => (esCambioTitular(a) ? 1 : 0) - (esCambioTitular(b) ? 1 : 0));
  const camposSeccionVendedor = todosLosCamposUnicos.filter((c) => seccion(c) === 'vendedor');
  const camposFormularioSinTipoCliente = camposSeccionFormulario;

  const camposDelPaso = useMemo(() => {
    if (paso === 1) return camposPorSeccion.cliente || [];
    if (paso === 2) return camposPorSeccion.campos_formulario || [];
    if (paso === 3) return camposPorSeccion.vendedor || [];
    return [];
  }, [paso, camposPorSeccion.cliente, camposPorSeccion.campos_formulario, camposPorSeccion.vendedor]);

  /** Lista que incluye cliente + paso actual para resolver depende_de y cargar opciones vía /api/relaciones/opciones/. */
  const listaCamposConPadres = useMemo(() => {
    const base = camposPorSeccion.cliente || [];
    const delPaso = camposDelPaso || [];
    const byId = new Map();
    [...base, ...delPaso].forEach((c) => {
      if (c.id != null && !byId.has(c.id)) byId.set(c.id, c);
    });
    return Array.from(byId.values());
  }, [camposPorSeccion.cliente, camposDelPaso]);

  /** Valor del campo padre (por depende_de). Usar lista que incluya padres (listaCamposConPadres). */
  const getValorPadre = useCallback(
    (campo, camposList) => {
      if (!campo.depende_de) return true;
      const lista = Array.isArray(camposList) ? camposList : listaCamposConPadres;
      const padre = lista.find((f) => f.id === campo.depende_de);
      if (!padre?.nombre) return false;
      const v = respuestas[padre.nombre];
      return v !== undefined && v !== null && String(v).trim() !== '';
    },
    [listaCamposConPadres, respuestas]
  );

  const entidadesParaOpciones = useMemo(() => {
    const lista = listaCamposConPadres;
    return [
      ...new Set(
        (lista || [])
          .filter((c) => c.tipo === 'entity_select' && c.entidad && !c.depende_de && getValorPadre(c, lista))
          .map((c) => String(c.entidad).toLowerCase().trim())
      ),
    ];
  }, [listaCamposConPadres, getValorPadre]);

  const { opcionesPorEntidad, loadingEntidad } = useOpcionesPorEntidad(
    entidadesParaOpciones,
    listaCamposConPadres,
    respuestas
  );

  const camposTitularDependientesRaw = todosLosCamposUnicos
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCambioTitular(c) && esVisibleSiCambioTitular(c));
  const seenIdsTitular = new Set();
  const camposTitularDependientes = camposTitularDependientesRaw.filter((c) => {
    const key = c.id ?? c.nombre;
    if (seenIdsTitular.has(key)) return false;
    seenIdsTitular.add(key);
    return true;
  });

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
    respuestas,
    actualizarRespuesta,
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
    vendedorId,
    setVendedorId,
    vendedores,
    cargandoVendedores,
    campoTitular,
    nombreCampoTitular,
    cambioTitularMarcado,
    camposTitularDependientes,
    camposSeccionVendedor,
    campoTipoProducto,
    opcionesPorEntidad,
    loadingEntidad,
    todosLosCamposUnicos,
    listaCamposConPadres,
    getValorPadre,
  };
}
