/**
 * Opciones para campos tipo entity_select.
 * Sin dependencia: endpoint normal de la entidad (ej. /api/servicios/, /api/contratistas/).
 * Con depende_de: siempre GET /api/relaciones/opciones/?origen_tipo=...&origen_id=...&destino_tipo=...
 * No se cargan opciones dependientes si el campo padre no tiene valor (evita consultas innecesarias).
 * Se evitan consultas duplicadas mediante cache y inFlightKeysRef.
 */
import { useState, useEffect, useRef } from 'react';
import { listarServiciosActivasParaSelect } from '../../empresa/logic/apiEmpresa';
import { listarContratistasParaSelect } from '../../servicios/logic/apiServicios';
import { listarProductos } from '../../producto/logic/apiProducto';
import { listarVendedores } from '../../vendedores/logic/apiVendedores';
import { listarOpcionesDestino } from '../../configuracion/logic/apiRelaciones';

/**
 * Obtiene opciones para una entidad (servicio, contratista, producto, vendedor).
 * @param {string} entidad - servicio | contratista | producto | vendedor
 * @returns {Promise<Array<{ label: string, value: string }>>}
 */
export async function fetchOpcionesEntidad(entidad) {
  const key = (entidad || '').toLowerCase().trim();
  if (!key) return [];

  switch (key) {
    case 'servicio': {
      const list = await listarServiciosActivasParaSelect();
      return (list || []).map((o) => ({
        label: o.nombre ?? String(o.id),
        value: String(o.id),
      }));
    }
    case 'contratista': {
      const list = await listarContratistasParaSelect();
      return (list || []).map((o) => ({
        label: o.nombre ?? String(o.id),
        value: String(o.id),
      }));
    }
    case 'producto': {
      const { results } = await listarProductos(1, 500, { estado: '1' });
      return (results || []).map((o) => ({
        label: o.nombre ?? String(o.id),
        value: String(o.id),
      }));
    }
    case 'vendedor': {
      const { results } = await listarVendedores(1, 500, { estado: '1' });
      return (results || []).map((o) => ({
        label: o.nombre ?? String(o.id),
        value: String(o.id),
      }));
    }
    default:
      return [];
  }
}

/** Cache en memoria: clave = entidad (sin dependencia) o entidad_valorPadre (con dependencia). */
const cacheOpciones = {};
const cachePromesas = {};

/**
 * Obtiene opciones para un entity_select con dependencia (vía relaciones).
 * @param {string} origenTipo - entidad del campo padre (servicio, contratista, etc.)
 * @param {number|string} origenId - valor seleccionado en el padre
 * @param {string} destinoTipo - entidad del campo actual
 * @returns {Promise<Array<{ label: string, value: string }>>}
 */
export async function fetchOpcionesPorRelacion(origenTipo, origenId, destinoTipo) {
  const id = origenId != null ? Number(origenId) : NaN;
  if (Number.isNaN(id) || id < 1) return [];
  const data = await listarOpcionesDestino(
    String(origenTipo).toLowerCase().trim(),
    id,
    String(destinoTipo).toLowerCase().trim()
  );
  return (data || []).map((o) => ({
    label: o.label ?? String(o.id),
    value: String(o.id),
  }));
}

/**
 * Hook: opciones para entity_select. Sin dependencia = endpoint entidad; con depende_de = relaciones.
 * @param {string[]} entidadesHabilitadas - Entidades habilitadas (sin dependencia)
 * @param {Array<{ id: number, nombre: string, entidad: string, depende_de: number }>} [campos] - Campos del formulario (para dependientes)
 * @param {Object} [respuestas] - respuestas[nombre] = valor (para saber valor del padre)
 * @returns {{ opcionesPorEntidad: Record<string, Array<{label, value}>>, loadingEntidad: Record<string, boolean> }}
 */
export function useOpcionesPorEntidad(entidadesHabilitadas, campos = [], respuestas = {}) {
  const uniques = Array.isArray(entidadesHabilitadas)
    ? [...new Set(entidadesHabilitadas.map((e) => String(e).toLowerCase().trim()).filter(Boolean))]
    : [];

  /** Claves dependientes: { entidad_parentValue } solo cuando el campo está habilitado (parent tiene valor). */
  const dependientes = (() => {
    const list = [];
    const camposArr = Array.isArray(campos) ? campos : [];
    const resp = typeof respuestas === 'object' && respuestas !== null ? respuestas : {};
    camposArr.forEach((c) => {
      if (c.tipo !== 'entity_select' || !c.entidad || !c.depende_de) return;
      const padre = camposArr.find((f) => f.id === c.depende_de);
      if (!padre || !padre.nombre) return;
      const parentVal = resp[padre.nombre];
      if (parentVal == null || String(parentVal).trim() === '') return;
      const key = `${String(c.entidad).toLowerCase().trim()}_${parentVal}`;
      if (!list.some((x) => x.key === key)) {
        list.push({
          key,
          origenTipo: (padre.entidad || '').toLowerCase().trim(),
          origenId: parentVal,
          destinoTipo: (c.entidad || '').toLowerCase().trim(),
        });
      }
    });
    return list;
  })();

  const [opcionesPorEntidad, setOpcionesPorEntidad] = useState(() => {
    const init = {};
    uniques.forEach((e) => {
      if (cacheOpciones[e]) init[e] = cacheOpciones[e];
    });
    dependientes.forEach((d) => {
      if (cacheOpciones[d.key]) init[d.key] = cacheOpciones[d.key];
    });
    return init;
  });
  const [loadingEntidad, setLoadingEntidad] = useState({});
  const mountedRef = useRef(true);
  const inFlightKeysRef = useRef(new Set());

  useEffect(() => {
    mountedRef.current = true;

    const keysToLoad = [...uniques];
    dependientes.forEach((d) => keysToLoad.push(d.key));

    if (keysToLoad.length === 0) return;

    uniques.forEach((entidad) => {
      if (cacheOpciones[entidad]) {
        setOpcionesPorEntidad((prev) => ({ ...prev, [entidad]: cacheOpciones[entidad] }));
        return;
      }
      if (inFlightKeysRef.current.has(entidad)) return;
      inFlightKeysRef.current.add(entidad);
      setLoadingEntidad((prev) => ({ ...prev, [entidad]: true }));
      if (!cachePromesas[entidad]) cachePromesas[entidad] = fetchOpcionesEntidad(entidad);
      const promise = cachePromesas[entidad];
      promise
        .then((list) => {
          cacheOpciones[entidad] = list;
          if (mountedRef.current) {
            setOpcionesPorEntidad((prev) => ({ ...prev, [entidad]: list }));
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setOpcionesPorEntidad((prev) => ({ ...prev, [entidad]: [] }));
          }
        })
        .finally(() => {
          if (mountedRef.current) {
            setLoadingEntidad((prev) => ({ ...prev, [entidad]: false }));
          }
        });
    });

    dependientes.forEach((d) => {
      if (cacheOpciones[d.key]) {
        setOpcionesPorEntidad((prev) => ({ ...prev, [d.key]: cacheOpciones[d.key] }));
        return;
      }
      if (inFlightKeysRef.current.has(d.key)) return;
      inFlightKeysRef.current.add(d.key);
      setLoadingEntidad((prev) => ({ ...prev, [d.key]: true }));
      if (!cachePromesas[d.key]) {
        cachePromesas[d.key] = fetchOpcionesPorRelacion(d.origenTipo, d.origenId, d.destinoTipo);
      }
      const promise = cachePromesas[d.key];
      promise
        .then((list) => {
          cacheOpciones[d.key] = list;
          if (mountedRef.current) {
            setOpcionesPorEntidad((prev) => ({ ...prev, [d.key]: list }));
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setOpcionesPorEntidad((prev) => ({ ...prev, [d.key]: [] }));
          }
        })
        .finally(() => {
          inFlightKeysRef.current.delete(d.key);
          if (mountedRef.current) {
            setLoadingEntidad((prev) => ({ ...prev, [d.key]: false }));
          }
        });
    });

    return () => {
      mountedRef.current = false;
    };
  }, [uniques.join(','), dependientes.map((d) => d.key).join(',')]);

  return { opcionesPorEntidad, loadingEntidad };
}
