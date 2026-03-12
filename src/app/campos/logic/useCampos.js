import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getErrorMessage } from '../../../utils/funciones';
import { useChoices } from '../../../context/ChoicesContext';
import * as api from './apiCampos';
import { listarEmpresasActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarServiciosPorEmpresa } from '../../servicios/logic/apiServicios';
import { CONFIG_FILAS_POR_PAGINA } from './constants';

const INIT_ERRORS = { empresa: '', servicio: '', nombre: '', tipo: '', orden: '' };
const TIPO_CAMPO_KEY = 'tipo_campo';

/**
 * Hook con la lógica del módulo Campos: listado paginado desde API, CRUD y modales.
 * Empresas y servicios para los modales se cargan por consulta: empresas activas al abrir modal, servicios al elegir empresa.
 * @param {boolean} active - Si el tab Campos está activo
 * @param {number} pagina - Página actual (controlada por padre)
 * @param {function} setPagina - Setter de página
 * @param {string} busqueda - Texto de búsqueda (nombre)
 * @param {string} filtroEstado - 'todos' | '1' | '0'
 */
export function useCampos(active = true, pagina = 1, setPagina = () => {}, busqueda = '', filtroEstado = 'todos') {
  const { showSnackbar } = useSnackbar();
  const { getOptions } = useChoices();
  const tipoCampoOptions = useMemo(() => getOptions(TIPO_CAMPO_KEY), [getOptions]);

  const getTipoLabel = useCallback(
    (value) => (tipoCampoOptions.find((t) => t.value === value)?.label ?? value),
    [tipoCampoOptions]
  );
  const getTipoValueFromCampo = useCallback(
    (campo) => {
      if (campo.tipo) return campo.tipo;
      const byLabel = tipoCampoOptions.find((t) => t.label === campo.tipoCampo);
      return byLabel?.value ?? '';
    },
    [tipoCampoOptions]
  );

  const [campos, setCampos] = useState([]);
  const [camposTotal, setCamposTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastLoadKeyRef = useRef(null);
  const [guardandoNueva, setGuardandoNueva] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [modalNueva, setModalNueva] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [nombre, setNombre] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [tipoCampo, setTipoCampo] = useState('');
  const [orden, setOrden] = useState('0');
  const [activo, setActivo] = useState(true);
  const [requerido, setRequerido] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [help_text, setHelp_text] = useState('');
  const [default_value, setDefault_value] = useState('');
  const [visible_si, setVisible_si] = useState('');
  /** Opciones: en crear = string[]; en editar = Array<{ id?, label, value? }> */
  const [opciones, setOpciones] = useState([]);
  const [opcionInput, setOpcionInput] = useState('');
  const [enEdicion, setEnEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [campoAVer, setCampoAVer] = useState(null);
  const [errors, setErrors] = useState(INIT_ERRORS);
  /** Empresas activas para el select; se cargan al abrir modal añadir/editar */
  const [empresasParaSelect, setEmpresasParaSelect] = useState([]);
  /** Servicios de la empresa seleccionada; se cargan al elegir empresa */
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  /** Evitar doble fetch: al abrir editar ya cargamos servicios en handleAbrirEditar */
  const skipServiciosLoadRef = useRef(false);

  useEffect(() => {
    if (!empresaId) {
      setServiciosFiltrados([]);
      return;
    }
    if (skipServiciosLoadRef.current) {
      skipServiciosLoadRef.current = false;
      return;
    }
    let cancelled = false;
    setCargandoServicios(true);
    listarServiciosPorEmpresa(empresaId)
      .then((results) => {
        if (!cancelled) setServiciosFiltrados(results);
      })
      .catch((e) => {
        if (!cancelled) {
          showSnackbar(
            getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los servicios'),
            'error'
          );
          setServiciosFiltrados([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCargandoServicios(false);
      });
    return () => { cancelled = true; };
  }, [empresaId, showSnackbar]);

  /** Al cambiar empresa en el select: actualizar id y limpiar servicio para que el usuario elija de la nueva lista */
  const handleChangeEmpresa = useCallback((id) => {
    setEmpresaId(id);
    setServicioId('');
  }, []);

  const getFormValid = useCallback(() => {
    const nextErrors = { ...INIT_ERRORS };
    if (!empresaId) nextErrors.empresa = 'Seleccione una empresa';
    if (!servicioId) nextErrors.servicio = 'Seleccione un servicio';
    if (!nombre?.trim()) nextErrors.nombre = 'El nombre del campo es obligatorio';
    if (!tipoCampo) nextErrors.tipo = 'Seleccione el tipo de campo';
    const ordenNum = parseInt(orden, 10);
    if (orden === '' || isNaN(ordenNum) || ordenNum < 0) {
      nextErrors.orden = 'Introduzca un número entero mayor o igual a 0';
    }
    const valid = Object.values(nextErrors).every((v) => !v);
    return { valid, errors: nextErrors };
  }, [empresaId, servicioId, nombre, tipoCampo, orden]);

  const canSave = useMemo(() => {
    const { valid } = getFormValid();
    const opcionesOk = tipoCampo !== 'select' || opciones.length > 0;
    return valid && opcionesOk;
  }, [getFormValid, tipoCampo, opciones.length]);

  const activoParam = filtroEstado === '1' ? true : filtroEstado === '0' ? false : undefined;

  const cargarCampos = useCallback(
    async (page = pagina) => {
      if (!active) return;
      setLoading(true);
      try {
        const { results, count } = await api.listarCampos(page, CONFIG_FILAS_POR_PAGINA, {
          search: busqueda?.trim() || undefined,
          activo: activoParam,
        });
        const mapped = results.map((item) => api.mapCampoFromApi(item, getTipoLabel));
        setCampos(mapped);
        setCamposTotal(count);
      } catch (e) {
        showSnackbar(
          getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar los campos'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [active, pagina, busqueda, activoParam, getTipoLabel, showSnackbar]
  );

  useEffect(() => {
    if (!active) {
      lastLoadKeyRef.current = null;
      return;
    }
    const key = `${pagina}-${filtroEstado}-${busqueda}`;
    if (lastLoadKeyRef.current === key) return;
    lastLoadKeyRef.current = key;
    cargarCampos(pagina);
    return () => {
      setTimeout(() => { lastLoadKeyRef.current = null; }, 0);
    };
  }, [active, pagina, filtroEstado, busqueda, cargarCampos]);

  const handleAbrirNueva = useCallback(() => {
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOrden('0');
    setActivo(true);
    setRequerido(false);
    setPlaceholder('');
    setHelp_text('');
    setDefault_value('');
    setVisible_si('');
    setOpciones([]);
    setOpcionInput('');
    setErrors(INIT_ERRORS);
    setServiciosFiltrados([]);
    setModalNueva(true);
  }, []);

  /** Cargar empresas para el select solo cuando se abre el modal (evitar múltiples llamadas) */
  useEffect(() => {
    if (!modalNueva) return;
    let cancelled = false;
    listarEmpresasActivasParaSelect()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? [...list] : [];
          setEmpresasParaSelect(arr);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          showSnackbar(
            getErrorMessage(e, e?.status, e?.response, 'No se pudieron cargar las empresas'),
            'error'
          );
          setEmpresasParaSelect([]);
        }
      });
    return () => { cancelled = true; };
  }, [modalNueva, showSnackbar]);

  const handleCerrarNueva = () => {
    setModalNueva(false);
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOrden('0');
    setActivo(true);
    setRequerido(false);
    setPlaceholder('');
    setHelp_text('');
    setDefault_value('');
    setVisible_si('');
    setOpciones([]);
    setOpcionInput('');
    setErrors(INIT_ERRORS);
  };

  const handleAñadirOpcion = useCallback(() => {
    const v = opcionInput.trim();
    if (!v) return;
    const exists = opciones.some((o) => (typeof o === 'string' ? o : o.label) === v);
    if (exists) return;
    if (enEdicion) {
      setOpciones((prev) => [...prev, { label: v, value: v }]);
    } else {
      setOpciones((prev) => [...prev, v]);
    }
    setOpcionInput('');
  }, [opcionInput, opciones, enEdicion]);

  const handleQuitarOpcion = (idx) => {
    setOpciones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardarNueva = useCallback(async () => {
    const { valid, errors: nextErrors } = getFormValid();
    setErrors(nextErrors);
    if (!valid) return;
    if (tipoCampo === 'select' && opciones.length === 0) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    const servicio = serviciosFiltrados.find((s) => s.id.toString() === servicioId);
    if (!empresa || !servicio) return;

    setGuardandoNueva(true);
    try {
      const ordenNum = Math.max(0, parseInt(orden, 10) || 0);
      const payload = {
        nombre: nombre.trim(),
        tipo: tipoCampo,
        empresa_id: Number(empresa.id),
        servicio_id: Number(servicio.id),
        orden: ordenNum,
        placeholder: placeholder.trim() || '',
        help_text: help_text.trim() || '',
        default_value: default_value.trim() || '',
        visible_si: visible_si.trim() || '',
        requerido: !!requerido,
        activo: !!activo,
        estado: '1',
      };
      const data = await api.crearCampo(payload);
      if (tipoCampo === 'select' && opciones.length > 0) {
        await api.crearOpcionesCampoBulk(data.id, opciones);
      }
      await cargarCampos(pagina);
      handleCerrarNueva();
      showSnackbar('Campo creado correctamente.', 'success');
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo crear el campo'),
        'error'
      );
    } finally {
      setGuardandoNueva(false);
    }
  }, [
    getFormValid,
    tipoCampo,
    opciones,
    empresaId,
    servicioId,
    nombre,
    orden,
    placeholder,
    help_text,
    default_value,
    visible_si,
    requerido,
    activo,
    empresasParaSelect,
    serviciosFiltrados,
    cargarCampos,
    pagina,
    showSnackbar,
  ]);

  const handleAbrirEditar = useCallback(
    async (campo) => {
      setEnEdicion(campo);
      setNombre(campo.campo ?? '');
      const list = await listarEmpresasActivasParaSelect();
      setEmpresasParaSelect(list);
      const emp = list.find((e) => e.nombre === campo.empresa);
      const empId = emp?.id?.toString() ?? list[0]?.id?.toString() ?? '';
      skipServiciosLoadRef.current = true;
      setEmpresaId(empId);
      const servs = empId ? await listarServiciosPorEmpresa(empId) : [];
      setServiciosFiltrados(servs);
      const serv = servs.find((s) => (s.nombre ?? s.servicio) === campo.servicio);
      setServicioId(serv?.id?.toString() ?? '');
      setTipoCampo(getTipoValueFromCampo(campo));
      setOrden(String(campo.orden ?? 0));
      setActivo(campo.activo ?? true);
      setRequerido(campo.requerido ?? false);
      setPlaceholder(campo.placeholder ?? '');
      setHelp_text(campo.help_text ?? '');
      setDefault_value(campo.default_value ?? '');
      setVisible_si(campo.visible_si ?? '');

      if (campo.tipo === 'select' && campo.id) {
        try {
          const listOpciones = await api.listarOpcionesCampo(campo.id);
          setOpciones(
            listOpciones.map((o) => ({ id: o.id, label: o.label ?? '', value: o.value ?? o.label ?? '' }))
          );
        } catch {
          setOpciones(campo.opciones?.map((o) => (typeof o === 'string' ? { label: o, value: o } : { ...o })) ?? []);
        }
      } else {
        setOpciones(campo.opciones ?? []);
      }
      setOpcionInput('');
      setErrors(INIT_ERRORS);
      setModalEditar(true);
    },
    [getTipoValueFromCampo]
  );

  const handleCerrarEditar = () => {
    setModalEditar(false);
    setEnEdicion(null);
    setNombre('');
    setEmpresaId('');
    setServicioId('');
    setTipoCampo('');
    setOrden('0');
    setActivo(true);
    setRequerido(false);
    setPlaceholder('');
    setHelp_text('');
    setDefault_value('');
    setVisible_si('');
    setOpciones([]);
    setOpcionInput('');
    setErrors(INIT_ERRORS);
  };

  const handleGuardarEditar = useCallback(async () => {
    if (!enEdicion) return;
    const { valid, errors: nextErrors } = getFormValid();
    setErrors(nextErrors);
    if (!valid) return;
    if (tipoCampo === 'select' && opciones.length === 0) return;
    const empresa = empresasParaSelect.find((e) => e.id.toString() === empresaId);
    const servicio = serviciosFiltrados.find((s) => s.id.toString() === servicioId);
    if (!empresa || !servicio) return;

    setGuardandoEditar(true);
    try {
      const ordenNum = Math.max(0, parseInt(orden, 10) || 0);
      const payload = {
        nombre: nombre.trim(),
        tipo: tipoCampo,
        empresa_id: Number(empresa.id),
        servicio_id: Number(servicio.id),
        orden: ordenNum,
        placeholder: placeholder.trim() || '',
        help_text: help_text.trim() || '',
        default_value: default_value.trim() || '',
        visible_si: visible_si.trim() || '',
        requerido: !!requerido,
        activo: !!activo,
      };
      await api.actualizarCampo(enEdicion.id, payload);

      if (tipoCampo === 'select') {
        const opcionesConOrden = opciones.map((o, i) => ({
          id: typeof o === 'object' && o.id != null ? o.id : undefined,
          label: typeof o === 'string' ? o : (o.label ?? o.value),
          value: typeof o === 'string' ? o : (o.value ?? o.label),
          orden: i,
        }));
        const apiOpciones = await api.listarOpcionesCampo(enEdicion.id);
        const idsMantener = opcionesConOrden.filter((o) => o.id != null).map((o) => o.id);
        const aEliminarOps = apiOpciones.filter((opt) => !idsMantener.includes(opt.id));
        for (const opt of aEliminarOps) {
          await api.eliminarOpcionCampo(opt.id);
        }
        const nuevasOpciones = opcionesConOrden.filter((o) => o.id == null);
        if (nuevasOpciones.length > 0) {
          await api.crearOpcionesCampoBulk(enEdicion.id, nuevasOpciones);
        }
        const aActualizar = opcionesConOrden
          .filter((o) => o.id != null)
          .map((o, i) => ({ id: o.id, label: o.label, value: o.value, orden: i }));
        if (aActualizar.length > 0) {
          await api.actualizarOpcionesCampoLote(aActualizar);
        }
      }

      await cargarCampos(pagina);
      handleCerrarEditar();
      showSnackbar('Campo actualizado correctamente.', 'success');
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo actualizar el campo'),
        'error'
      );
    } finally {
      setGuardandoEditar(false);
    }
  }, [
    enEdicion,
    getFormValid,
    tipoCampo,
    opciones,
    empresaId,
    servicioId,
    nombre,
    orden,
    placeholder,
    help_text,
    default_value,
    visible_si,
    requerido,
    activo,
    empresasParaSelect,
    serviciosFiltrados,
    cargarCampos,
    pagina,
    showSnackbar,
  ]);

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

  const handleConfirmarEliminar = useCallback(async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.eliminarCampo(aEliminar.id);
      const nextPage = campos.length === 1 && pagina > 1 ? pagina - 1 : pagina;
      if (nextPage !== pagina) setPagina(nextPage);
      await cargarCampos(nextPage);
      handleCerrarEliminar();
      showSnackbar('Campo eliminado correctamente.', 'success');
    } catch (e) {
      showSnackbar(
        getErrorMessage(e, e?.status, e?.response, 'No se pudo eliminar el campo'),
        'error'
      );
    } finally {
      setEliminando(false);
    }
  }, [aEliminar, campos.length, pagina, setPagina, cargarCampos, showSnackbar]);

  return {
    tipoCampoOptions,
    campos,
    setCampos,
    totalItems: camposTotal,
    loading,
    guardandoNueva,
    guardandoEditar,
    eliminando,
    modalNueva,
    modalEditar,
    modalEliminar,
    modalVer,
    nombre,
    setNombre,
    empresaId,
    setEmpresaId,
    handleChangeEmpresa,
    servicioId,
    setServicioId,
    cargandoServicios,
    tipoCampo,
    setTipoCampo,
    orden,
    setOrden,
    activo,
    setActivo,
    requerido,
    setRequerido,
    placeholder,
    setPlaceholder,
    help_text,
    setHelp_text,
    default_value,
    setDefault_value,
    visible_si,
    setVisible_si,
    opciones,
    opcionInput,
    setOpcionInput,
    enEdicion,
    aEliminar,
    campoAVer,
    serviciosFiltrados,
    empresasParaSelect,
    errors,
    canSave,
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
