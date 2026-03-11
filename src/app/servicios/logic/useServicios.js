import { useState, useCallback } from 'react';
import { SERVICIOS_INICIAL } from './constants';

/**
 * Hook con la lógica del módulo Servicios (estado local, CRUD y modales).
 * Depende de empresasParaSelect y cargarEmpresasParaSelect del módulo empresa.
 */
export function useServicios(empresasParaSelect, cargarEmpresasParaSelect) {
  const [servicios, setServicios] = useState(SERVICIOS_INICIAL);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const handleAbrirNueva = useCallback(() => {
    setNombre('');
    setEmpresaId('');
    cargarEmpresasParaSelect();
    setModalNueva(true);
  }, [cargarEmpresasParaSelect]);

  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setEmpresaId('');
  };

  const handleGuardarNueva = () => {
    if (!nombre.trim() || !empresaId) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    if (!empresa) return;
    const nuevoId = Math.max(...servicios.map((s) => s.id), 0) + 1;
    setServicios((prev) => [
      ...prev,
      { id: nuevoId, servicio: nombre.trim(), tipoEmpresa: empresa.nombre, estado: 'Activa' },
    ]);
    handleCerrarNueva();
  };

  const handleAbrirEditar = useCallback(
    (servicio) => {
      setEnEdicion(servicio);
      setNombre(servicio.servicio);
      const emp = empresasParaSelect.find((e) => e.nombre === servicio.tipoEmpresa);
      setEmpresaId(emp?.id?.toString() ?? empresasParaSelect[0]?.id?.toString() ?? '');
      cargarEmpresasParaSelect();
      setModalEditar(true);
    },
    [empresasParaSelect, cargarEmpresasParaSelect]
  );

  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setEmpresaId('');
  };

  const handleGuardarEditar = () => {
    if (!enEdicion || !nombre.trim() || !empresaId) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    if (!empresa) return;
    setServicios((prev) =>
      prev.map((s) =>
        s.id === enEdicion.id ? { ...s, servicio: nombre.trim(), tipoEmpresa: empresa.nombre } : s
      )
    );
    handleCerrarEditar();
  };

  const handleAbrirEliminar = (servicio) => {
    setAEliminar(servicio);
    setModalEliminar(true);
  };
  const handleCerrarEliminar = () => {
    setModalEliminar(false);
    setAEliminar(null);
  };
  const handleConfirmarEliminar = () => {
    if (aEliminar) setServicios((prev) => prev.filter((s) => s.id !== aEliminar.id));
    handleCerrarEliminar();
  };

  return {
    servicios,
    setServicios,
    modalNueva,
    modalEditar,
    modalEliminar,
    nombre,
    setNombre,
    empresaId,
    setEmpresaId,
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
