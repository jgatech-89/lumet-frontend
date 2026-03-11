import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import * as api from './apiEmpresa';
import { EMPRESAS_POR_PAGINA } from './constants';
/**
 * Hook con toda la lógica del módulo Empresa: listado paginado, select para otros módulos, CRUD y modales.
 * @param {number} pagina - Página actual (controlada por padre)
 * @param {function} setPagina - Setter de página
 * @param {string} filtroEstado - 'todos' | 'activa' | 'inactiva'
 * @param {boolean} active - Si el tab empresa está activo (para cargar solo cuando corresponde)
 */
export function useEmpresas(pagina, setPagina, filtroEstado, active) {
  const { showSnackbar } = useSnackbar();
  const lastLoadKeyRef = useRef(null);

  const [empresas, setEmpresas] = useState([]);
  const [empresasTotal, setEmpresasTotal] = useState(0);
  const [empresasParaSelect, setEmpresasParaSelect] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('1');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const estadoParam =
    filtroEstado === 'activa' ? '1' : filtroEstado === 'inactiva' ? '0' : undefined;

  const cargarEmpresas = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { results, count } = await api.listarEmpresas(page, EMPRESAS_POR_PAGINA, {
          estado: estadoParam,
        });
        setEmpresas(results);
        setEmpresasTotal(count);
      } catch (e) {
        showSnackbar(
          getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar las empresas'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, estadoParam]
  );

  const cargarEmpresasParaSelect = useCallback(async () => {
    try {
      const results = await api.listarEmpresasParaSelect();
      setEmpresasParaSelect(results);
      return results;
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar las empresas'),
        'error'
      );
      return [];
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (!active) return;
    const key = `${pagina}-${filtroEstado}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;
    cargarEmpresas(pagina);
    return () => {
      setTimeout(() => { lastLoadKeyRef.current = null; }, 0);
    };
  }, [active, pagina, filtroEstado, cargarEmpresas]);

  const handleAbrirNueva = () => {
    setNombre('');
    setModalNueva(true);
  };
  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
  };
  const handleGuardarNueva = async () => {
    if (!nombre.trim()) return;
    setGuardandoNuevo(true);
    try {
      await api.crearEmpresa({ nombre: nombre.trim() });
      await cargarEmpresasParaSelect();
      await cargarEmpresas(pagina);
      handleCerrarNueva();
      showSnackbar('Empresa creada correctamente', 'success');
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'No se pudo crear la empresa'), 'error');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const handleAbrirEditar = (empresa) => {
    setEnEdicion(empresa);
    setNombre(empresa.nombre);
    setEstado(empresa.estado_empresa ?? (empresa.estado === 'Activa' ? '1' : '0'));
    setModalEditar(true);
  };
  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setEstado('1');
  };
  const handleGuardarEditar = async () => {
    if (!enEdicion || !nombre.trim()) return;
    setGuardandoEditar(true);
    try {
      await api.actualizarEmpresa(enEdicion.id, {
        nombre: nombre.trim(),
        estado_empresa: estado,
      });
      showSnackbar('Empresa actualizada correctamente', 'success');
      handleCerrarEditar();
      await cargarEmpresasParaSelect();
      await cargarEmpresas(pagina);
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo actualizar la empresa'),
        'error'
      );
    } finally {
      setGuardandoEditar(false);
    }
  };

  const handleAbrirEliminar = (empresa) => {
    setAEliminar(empresa);
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
      await api.eliminarEmpresa(aEliminar.id);
      handleCerrarEliminar();
      showSnackbar('Empresa eliminada correctamente', 'success');
      const nextPage = empresas.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      setPagina(nextPage);
      await cargarEmpresasParaSelect();
      await cargarEmpresas(nextPage);
    } catch (e) {
      showSnackbar(getErrorMessage(e, e?.status, e?.response, 'No se pudo eliminar la empresa'), 'error');
    } finally {
      setEliminando(false);
    }
  };

  return {
    empresas,
    empresasTotal,
    loading,
    pageSize: EMPRESAS_POR_PAGINA,
    empresasParaSelect,
    cargarEmpresasParaSelect,
    modalNueva,
    modalEditar,
    modalEliminar,
    nombre,
    setNombre,
    estado,
    setEstado,
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
