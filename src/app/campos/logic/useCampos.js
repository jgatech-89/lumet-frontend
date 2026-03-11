import { useState, useCallback } from 'react';
import { CAMPOS_INICIAL } from './constants';

/**
 * Hook con la lógica del módulo Campos (estado local, CRUD, modales y modal Ver).
 * Depende de empresasParaSelect, servicios y cargarEmpresasParaSelect.
 */
export function useCampos(empresasParaSelect, servicios, cargarEmpresasParaSelect) {
  const [campos, setCampos] = useState(CAMPOS_INICIAL);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [nombre, setNombre] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [tipoCampo, setTipoCampo] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [opcionInput, setOpcionInput] = useState('');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [campoAVer, setCampoAVer] = useState(null);

  const empresaSeleccionada = empresasParaSelect.find((e) => e.id.toString() === empresaId);
  const serviciosFiltrados = empresaSeleccionada
    ? servicios.filter((s) => s.tipoEmpresa === empresaSeleccionada.nombre)
    : [];

  const handleAbrirNueva = useCallback(() => {
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOpciones([]);
    setOpcionInput('');
    cargarEmpresasParaSelect();
    setModalNueva(true);
  }, [cargarEmpresasParaSelect]);

  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOpciones([]);
    setOpcionInput('');
  };

  const handleAñadirOpcion = () => {
    const v = opcionInput.trim();
    if (v && !opciones.includes(v)) {
      setOpciones((prev) => [...prev, v]);
      setOpcionInput('');
    }
  };
  const handleQuitarOpcion = (idx) => {
    setOpciones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardarNueva = () => {
    if (!nombre.trim() || !empresaId || !servicioId || !tipoCampo) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    const servicio = servicios.find((s) => s.id.toString() === servicioId);
    if (!empresa || !servicio) return;
    const nuevoId = Math.max(...campos.map((c) => c.id), 0) + 1;
    setCampos((prev) => [
      ...prev,
      {
        id: nuevoId,
        campo: nombre.trim(),
        empresa: empresa.nombre,
        servicio: servicio.servicio,
        tipoCampo,
        estado: 'Activa',
        opciones: tipoCampo === 'Select' ? [...opciones] : [],
      },
    ]);
    handleCerrarNueva();
  };

  const handleAbrirEditar = useCallback(
    async (campo) => {
      setEnEdicion(campo);
      setNombre(campo.campo);
      const list = await cargarEmpresasParaSelect();
      const emp = list.find((e) => e.nombre === campo.empresa);
      setEmpresaId(emp?.id?.toString() ?? list[0]?.id?.toString() ?? '');
      const serv = servicios.find((s) => s.servicio === campo.servicio && s.tipoEmpresa === campo.empresa);
      setServicioId(serv?.id?.toString() ?? '');
      setTipoCampo(campo.tipoCampo);
      setOpciones(campo.opciones ?? []);
      setOpcionInput('');
      setModalEditar(true);
    },
    [servicios, cargarEmpresasParaSelect]
  );

  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOpciones([]);
    setOpcionInput('');
  };

  const handleGuardarEditar = () => {
    if (!enEdicion || !nombre.trim() || !empresaId || !servicioId) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    const servicio = servicios.find((s) => s.id.toString() === servicioId);
    if (!empresa || !servicio) return;
    setCampos((prev) =>
      prev.map((c) =>
        c.id === enEdicion.id
          ? {
              ...c,
              campo: nombre.trim(),
              empresa: empresa.nombre,
              servicio: servicio.servicio,
              tipoCampo,
              opciones: tipoCampo === 'Select' ? [...opciones] : [],
            }
          : c
      )
    );
    handleCerrarEditar();
  };

  const handleAbrirVer = (campo) => {
    setCampoAVer(campo);
    setModalVer(true);
  };
  const handleCerrarVer = () => {
    setModalVer(false);
    setCampoAVer(null);
  };

  const handleAbrirEliminar = (campo) => {
    setAEliminar(campo);
    setModalEliminar(true);
  };
  const handleCerrarEliminar = () => {
    setModalEliminar(false);
    setAEliminar(null);
  };
  const handleConfirmarEliminar = () => {
    if (aEliminar) setCampos((prev) => prev.filter((c) => c.id !== aEliminar.id));
    handleCerrarEliminar();
  };

  return {
    campos,
    setCampos,
    modalNueva,
    modalEditar,
    modalEliminar,
    modalVer,
    nombre,
    setNombre,
    empresaId,
    setEmpresaId,
    servicioId,
    setServicioId,
    tipoCampo,
    setTipoCampo,
    opciones,
    opcionInput,
    setOpcionInput,
    enEdicion,
    aEliminar,
    campoAVer,
    serviciosFiltrados,
    handleAbrirNueva,
    handleCerrarNueva,
    handleGuardarNueva,
    handleAñadirOpcion,
    handleQuitarOpcion,
    handleAbrirEditar,
    handleCerrarEditar,
    handleGuardarEditar,
    handleAbrirVer,
    handleCerrarVer,
    handleAbrirEliminar,
    handleCerrarEliminar,
    handleConfirmarEliminar,
  };
}
