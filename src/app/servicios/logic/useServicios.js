import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as api from './apiServicios';
import { CONFIG_FILAS_POR_PAGINA } from './constants';

/**
 * Hook con la lógica del módulo Contratistas: listado paginado, select para campos, CRUD y modales.
 * Conectado al backend.
 * @param {number} pagina - Página actual (controlada por padre)
 * @param {function} setPagina - Setter de página
 * @param {string} busqueda - Texto de búsqueda (nombre o empresa)
 * @param {string} filtroEstado - 'todos' | '1' | '0'
 * @param {boolean} active - Si el tab contratistas está activo
 * @param {Array} serviciosParaSelect - Servicios para el selector en modales
 * @param {function} cargarServiciosParaSelect - Recargar servicios para select
 */
export function useContratistas(pagina, setPagina, busqueda, filtroEstado, active, serviciosParaSelect, cargarServiciosParaSelect) {
  const { showSnackbar } = useSnackbar();
  const lastLoadKeyRef = useRef(null);

  const [contratistas, setContratistas] = useState([]);
  const [contratistasTotal, setContratistasTotal] = useState(0);
  const [contratistasParaSelect, setContratistasParaSelect] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [estadoServicio, setEstadoServicio] = useState('1');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const estadoParam = filtroEstado === '1' || filtroEstado === '0' ? filtroEstado : undefined;

  const cargarContratistas = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { results, count } = await api.listarContratistas(page, CONFIG_FILAS_POR_PAGINA, {
          search: busqueda?.trim() || undefined,
          estado: estadoParam,
        });
        setContratistas(results);
        setContratistasTotal(count);
      } catch (e) {
        showSnackbar(
          getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los contratistas'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, estadoParam, busqueda]
  );

  const cargarContratistasParaSelect = useCallback(async () => {
    try {
      const results = await api.listarContratistasParaSelect();
      setContratistasParaSelect(results);
      return results;
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los contratistas'),
        'error'
      );
      return [];
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (!active) {
      lastLoadKeyRef.current = null;
      return;
    }
    const key = `${pagina}-${filtroEstado}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;
    cargarContratistas(pagina);
    return () => {
      setTimeout(() => { lastLoadKeyRef.current = null; }, 0);
    };
  }, [active, pagina, filtroEstado, busqueda, cargarContratistas]);

  const handleAbrirNueva = useCallback(() => {
    setNombre('');
    setServicioId('');
    if (!serviciosParaSelect?.length) cargarServiciosParaSelect?.();
    setModalNueva(true);
  }, [serviciosParaSelect?.length, cargarServiciosParaSelect]);

  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setServicioId('');
  };

  const handleGuardarNueva = async () => {
    if (!nombre.trim() || !servicioId) return;
    setGuardandoNuevo(true);
    try {
      await api.crearContratista({
        nombre: nombre.trim(),
        servicio_id: Number(servicioId),
      });
      showSnackbar('Contratista creado correctamente', 'success');
      handleCerrarNueva();
      await cargarContratistas(pagina);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'No se pudo crear el contratista'), 'error');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const handleAbrirEditar = useCallback((contratista) => {
    setEnEdicion(contratista);
    setNombre(contratista.nombre ?? '');
    setServicioId(contratista.servicio_id?.toString() ?? '');
    setEstadoServicio(contratista.estado_contratista ?? (contratista.estado === 'Activa' ? '1' : '0'));
    if (!serviciosParaSelect?.length) cargarServiciosParaSelect?.();
    setModalEditar(true);
  }, [serviciosParaSelect?.length, cargarServiciosParaSelect]);

  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setServicioId('');
    setEstadoServicio('1');
  };

  const handleGuardarEditar = async () => {
    if (!enEdicion || !nombre.trim() || !servicioId) return;
    setGuardandoEditar(true);
    try {
      await api.actualizarContratista(enEdicion.id, {
        nombre: nombre.trim(),
        servicio_id: Number(servicioId),
        estado_contratista: estadoServicio,
      });
      showSnackbar('Contratista actualizado correctamente', 'success');
      handleCerrarEditar();
      await cargarContratistas(pagina);
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo actualizar el contratista'),
        'error'
      );
    } finally {
      setGuardandoEditar(false);
    }
  };

  const handleAbrirEliminar = (contratista) => {
    setAEliminar(contratista);
    setModalEliminar(true);
  };

  const handleCerrarEliminar = () => {
    setModalEliminar(false);
    setAEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.eliminarContratista(aEliminar.id);
      handleCerrarEliminar();
      showSnackbar('Contratista eliminado correctamente', 'success');
      const nextPage = contratistas.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(nextPage);
      await cargarContratistas(nextPage);
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo eliminar el contratista'),
        'error'
      );
    } finally {
      setEliminando(false);
    }
  };

  return {
    contratistas,
    contratistasTotal,
    contratistasParaSelect,
    cargarContratistasParaSelect,
    loading,
    pageSize: CONFIG_FILAS_POR_PAGINA,
    guardandoNuevo,
    guardandoEditar,
    eliminando,
    modalNueva,
    modalEditar,
    modalEliminar,
    nombre,
    setNombre,
    servicioId,
    setServicioId,
    estadoServicio,
    setEstadoServicio,
    enEdicion,
    aEliminar,
    handleAbrirNueva,
    handleCerrarNueva,
    handleGuardarNueva,
    handleAbrirEditar,
    handleCerrarEditar,
    handleGuardarEditar,
    handleAbrirEliminar,
    handleCerrarEliminar,
    handleConfirmarEliminar,
  };
}
