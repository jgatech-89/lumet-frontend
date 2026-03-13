import { useState, useEffect, useCallback } from 'react';
import * as apiCliente from './apiCliente';
import * as apiCampos from '../../campos/logic/apiCampos';
import { listarServiciosPorEmpresa } from '../../servicios/logic/apiServicios';
import { listarEmpresasActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { useChoices } from '../../../context/ChoicesContext';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';

/** Nombres que identifican tipo_cliente en campos dinámicos. */
const NOMBRES_TIPO_CLIENTE_CAMPO = ['tipo_cliente', 'Tipo de cliente', 'Tipo Cliente', 'tipo cliente'];

/** Nombres que identifican estado_venta en campos dinámicos. */
const NOMBRES_ESTADO_VENTA_CAMPO = ['estado_venta', 'Estado de venta', 'Estado venta', 'estado venta'];

/** Campo Producto. */
const NOMBRES_PRODUCTO_CAMPO = ['producto', 'Producto'];

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
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [camposGlobales, setCamposGlobales] = useState([]);
  const [opcionesProducto, setOpcionesProducto] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [cargandoCampos, setCargandoCampos] = useState(false);
  const [cargandoCamposGlobales, setCargandoCamposGlobales] = useState(false);

  const tipoClienteOptionsFallback = getOptions('tipo_cliente');
  const campoTipoCliente = camposGlobales.find(esCampoTipoCliente) ?? camposFormulario.find(esCampoTipoCliente);
  const tipoClienteOptions = campoTipoCliente?.opciones?.length
    ? campoTipoCliente.opciones
    : tipoClienteOptionsFallback;

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
      const list = await apiCampos.obtenerOpcionesCampoPorNombre('producto');
      setOpcionesProducto(Array.isArray(list) ? list : []);
    } catch {
      setOpcionesProducto([]);
    }
  }, []);

  const cargarCamposFormulario = useCallback(async () => {
    if (!servicio?.empresa_id || !servicio?.id) {
      setCamposFormulario([]);
      return;
    }
    setCargandoCampos(true);
    try {
      const productoParam = (producto && producto !== '__todos__' && producto.trim()) ? producto.trim() : undefined;
      const campos = await apiCliente.obtenerCamposFormulario(servicio.empresa_id, servicio.id, productoParam);
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

  const puedeSiguientePaso = () => {
    if (paso === 1) {
      const valorTipo = campoTipoCliente ? respuestas[campoTipoCliente.nombre] : tipoCliente;
      if (!valorTipo || !String(valorTipo).trim()) return false;
      if (!empresa || !servicio) return false;
      return true;
    }
    if (paso === 2) {
      if (opcionesProducto?.length > 0 && !producto) return false;
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
      const esVendedor = ([k]) => norm(k) === 'vendedor';

      const nombresValidos = new Set([
        'vendedor',
        'Vendedor',
        ...(camposFormulario || []).map((c) => c.nombre).filter(Boolean),
        ...(camposGlobales || []).map((c) => c.nombre).filter(Boolean),
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
        servicio_id: servicio.id,
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

  const camposFormularioSinTipoCliente = camposFormulario
    .filter((c) => !esCampoTipoCliente(c) && !esCampoProducto(c) && !esCampoEstadoVenta(c) && !esCambioTitular(c) && !esVisibleSiCambioTitular(c))
    .sort((a, b) => (esCambioTitular(a) ? 1 : 0) - (esCambioTitular(b) ? 1 : 0));

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
    vendedorId,
    setVendedorId,
    vendedores,
    cargandoVendedores,
    campoTitular,
    nombreCampoTitular,
    cambioTitularMarcado,
    camposTitularDependientes,
  };
}
