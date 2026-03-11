import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as api from './apiVendedores';
import { VENDEDORES_POR_PAGINA } from './constants';

/**
 * Hook con toda la lógica del módulo Vendedores: listado paginado, CRUD y modales.
 */
export function useVendedores(pagina, setPagina, busqueda, filtroEstado, active) {
  const { showSnackbar } = useSnackbar();
  const lastLoadKeyRef = useRef(null);

  const [vendedores, setVendedores] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('');
  const [estado, setEstado] = useState('1');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const estadoParam =
    filtroEstado === '1' || filtroEstado === '0' ? filtroEstado : undefined;
  const numeroIdentificacionValido = numeroIdentificacion.trim().length >= 5;

  const cargarVendedores = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { results, count } = await api.listarVendedores(
          page,
          VENDEDORES_POR_PAGINA,
          { search: busqueda.trim() || undefined, estado: estadoParam }
        );
        setVendedores(results);
        setTotal(count);
      } catch (e) {
        showSnackbar(
          getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los vendedores'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, busqueda, estadoParam]
  );

  useEffect(() => {
    if (!active) return;
    const key = `${pagina}-${busqueda}-${filtroEstado}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;
    cargarVendedores(pagina);
    return () => {
      setTimeout(() => { lastLoadKeyRef.current = null; }, 0);
    };
  }, [active, pagina, busqueda, filtroEstado, cargarVendedores]);

  const handleAbrirNueva = () => {
    setNombre('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('');
    setModalNueva(true);
  };
  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('');
  };
  const handleGuardarNueva = async () => {
    if (!nombre.trim() || !numeroIdentificacionValido || !tipoIdentificacion) return;
    setGuardandoNuevo(true);
    try {
      await api.crearVendedor({
        nombre_completo: nombre.trim(),
        tipo_identificacion: tipoIdentificacion || undefined,
        numero_identificacion: numeroIdentificacion.trim(),
      });
      showSnackbar('Vendedor registrado correctamente');
      handleCerrarNueva();
      setPagina(1);
      cargarVendedores(1);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al guardar el vendedor'), 'error');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const handleAbrirEditar = (col) => {
    setEnEdicion(col);
    setNombre(col.nombre);
    setNumeroIdentificacion(col.numeroIdentificacion ?? '');
    setTipoIdentificacion(col.tipoIdentificacion ?? '');
    setEstado(col.estadoVendedor ?? '1');
    setModalEditar(true);
  };
  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setNumeroIdentificacion('');
    setTipoIdentificacion('');
    setEstado('1');
  };
  const handleGuardarEditar = async () => {
    if (!enEdicion || !nombre.trim() || !numeroIdentificacionValido || !tipoIdentificacion) return;
    setGuardandoEditar(true);
    try {
      await api.actualizarVendedor(enEdicion.id, {
        nombre_completo: nombre.trim(),
        tipo_identificacion: tipoIdentificacion || undefined,
        numero_identificacion: numeroIdentificacion.trim(),
        estado_vendedor: estado,
      });
      showSnackbar('Vendedor actualizado correctamente');
      handleCerrarEditar();
      cargarVendedores(pagina);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al actualizar el vendedor'), 'error');
    } finally {
      setGuardandoEditar(false);
    }
  };

  const handleAbrirEliminar = (col) => {
    setAEliminar(col);
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
      await api.eliminarVendedor(aEliminar.id);
      showSnackbar('Vendedor eliminado correctamente');
      handleCerrarEliminar();
      const nextPage = vendedores.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(nextPage);
      cargarVendedores(nextPage);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al eliminar el vendedor'), 'error');
    } finally {
      setEliminando(false);
    }
  };

  return {
    vendedores,
    total,
    loading,
    pageSize: VENDEDORES_POR_PAGINA,
    modalNueva,
    modalEditar,
    modalEliminar,
    nombre,
    setNombre,
    numeroIdentificacion,
    setNumeroIdentificacion,
    tipoIdentificacion,
    setTipoIdentificacion,
    estado,
    setEstado,
    enEdicion,
    aEliminar,
    guardandoNuevo,
    guardandoEditar,
    eliminando,
    numeroIdentificacionValido,
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
