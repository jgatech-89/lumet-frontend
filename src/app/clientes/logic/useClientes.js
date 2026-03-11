import { useState, useMemo } from 'react';
import { CLIENTES_INICIAL, FILAS_POR_PAGINA } from './constants';

/**
 * Hook con la lógica del listado de clientes: filtros, paginación y datos (mock).
 */
export function useClientes() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    let list = [...CLIENTES_INICIAL];
    const q = busqueda.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          (c.nombre && c.nombre.toLowerCase().includes(q)) ||
          (c.telefono && c.telefono.includes(q)) ||
          (c.correo && c.correo.toLowerCase().includes(q)) ||
          (c.vendedor && c.vendedor.toLowerCase().includes(q))
      );
    }
    if (filtroEstado !== 'todos' && filtroEstado !== '') {
      list = list.filter((c) => c.estado === filtroEstado);
    }
    return list;
  }, [busqueda, filtroEstado]);

  const total = filtrados.length;
  const filasPagina = filtrados.slice(
    (pagina - 1) * FILAS_POR_PAGINA,
    pagina * FILAS_POR_PAGINA
  );
  const inicio = total === 0 ? 0 : (pagina - 1) * FILAS_POR_PAGINA + 1;
  const fin = total === 0 ? 0 : Math.min(pagina * FILAS_POR_PAGINA, total);
  const totalPaginas = Math.max(1, Math.ceil(total / FILAS_POR_PAGINA));

  const handleChangePagina = (_, value) => setPagina(value);

  return {
    clientes: filasPagina,
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
  };
}
