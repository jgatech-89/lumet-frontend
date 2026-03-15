import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as api from './apiProducto';
import { PRODUCTOS_POR_PAGINA } from './constants';

/**
 * Hook con toda la lógica del módulo Productos: listado paginado, CRUD y modales.
 */
export function useProductos(pagina, setPagina, busqueda, filtroEstado, active) {
  const { showSnackbar } = useSnackbar();
  const lastLoadKeyRef = useRef(null);

  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [estadoProducto, setEstadoProducto] = useState('1');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const cargarProductos = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { results, count } = await api.listarProductos(
          page,
          PRODUCTOS_POR_PAGINA,
          { search: busqueda.trim() || undefined, estado: filtroEstado === '1' || filtroEstado === '0' ? filtroEstado : undefined }
        );
        setProductos(results);
        setTotal(count);
      } catch (e) {
        showSnackbar(
          getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los productos'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, busqueda, filtroEstado]
  );

  useEffect(() => {
    if (!active) return;
    const key = `${pagina}-${busqueda}-${filtroEstado}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;
    cargarProductos(pagina);
    return () => {
      setTimeout(() => { lastLoadKeyRef.current = null; }, 0);
    };
  }, [active, pagina, busqueda, filtroEstado, cargarProductos]);

  const handleAbrirNueva = () => {
    setNombre('');
    setEstadoProducto('1');
    setModalNueva(true);
  };
  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setEstadoProducto('1');
  };
  const handleGuardarNueva = async () => {
    if (!nombre.trim()) return;
    setGuardandoNuevo(true);
    try {
      await api.crearProducto({
        nombre: nombre.trim(),
        estado_producto: estadoProducto,
      });
      showSnackbar('Producto creado correctamente');
      handleCerrarNueva();
      setPagina(1);
      cargarProductos(1);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al guardar el producto'), 'error');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const handleAbrirEditar = (col) => {
    setEnEdicion(col);
    setNombre(col.nombre ?? '');
    setEstadoProducto(col.estadoProducto ?? '1');
    setModalEditar(true);
  };
  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setEstadoProducto('1');
  };
  const handleGuardarEditar = async () => {
    if (!enEdicion || !nombre.trim()) return;
    setGuardandoEditar(true);
    try {
      await api.actualizarProducto(enEdicion.id, {
        nombre: nombre.trim(),
        estado_producto: estadoProducto,
      });
      showSnackbar('Producto actualizado correctamente');
      handleCerrarEditar();
      cargarProductos(pagina);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al actualizar el producto'), 'error');
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
      await api.eliminarProducto(aEliminar.id);
      showSnackbar('Producto eliminado correctamente');
      handleCerrarEliminar();
      const nextPage = productos.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(nextPage);
      cargarProductos(nextPage);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al eliminar el producto'), 'error');
    } finally {
      setEliminando(false);
    }
  };

  return {
    productos,
    total,
    loading,
    pageSize: PRODUCTOS_POR_PAGINA,
    modalNueva,
    modalEditar,
    modalEliminar,
    nombre,
    setNombre,
    estadoProducto,
    setEstadoProducto,
    enEdicion,
    aEliminar,
    guardandoNuevo,
    guardandoEditar,
    eliminando,
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
