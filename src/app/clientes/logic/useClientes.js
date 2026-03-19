import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as api from './apiCliente';
import { FILAS_POR_PAGINA } from './constants';

/**
 * Hook con la lógica del listado de clientes: filtros, paginación y datos desde API.
 */
export function useClientes() {
  const { showSnackbar } = useSnackbar();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [opcionesEstadoVenta, setOpcionesEstadoVenta] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.obtenerOpcionesEstadoVenta()
      .then((list) => {
        if (!cancelled) setOpcionesEstadoVenta(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setOpcionesEstadoVenta([]);
      });
    return () => { cancelled = true; };
  }, []);

  const estadoVentaParam = filtroEstado && filtroEstado !== 'todos' ? filtroEstado : undefined;

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { search: busqueda.trim() || undefined };
      if (estadoVentaParam) filters.estado_venta = estadoVentaParam;
      const { results, count } = await api.listarClientes(pagina, FILAS_POR_PAGINA, filters);
      setClientes(results);
      setTotal(count);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'Error al cargar clientes'), 'error');
      setClientes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pagina, busqueda, estadoVentaParam, showSnackbar]);

  useEffect(() => {
    const t = setTimeout(cargarClientes, 300);
    return () => clearTimeout(t);
  }, [cargarClientes]);

  const inicio = total === 0 ? 0 : (pagina - 1) * FILAS_POR_PAGINA + 1;
  const fin = total === 0 ? 0 : Math.min(pagina * FILAS_POR_PAGINA, total);
  const totalPaginas = Math.max(1, Math.ceil(total / FILAS_POR_PAGINA));

  const handleChangePagina = (_, value) => setPagina(value);

  return {
    clientes,
    total,
    pagina,
    setPagina,
    inicio,
    fin,
    totalPaginas,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    handleChangePagina,
    pageSize: FILAS_POR_PAGINA,
    loading,
    recargar: cargarClientes,
    opcionesEstadoVenta,
  };
}
