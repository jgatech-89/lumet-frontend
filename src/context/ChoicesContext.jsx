import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { get } from '../utils/funciones';
import { useAuth } from './AuthContext';

/**
 * Formato esperado del backend: { [key]: [ { value, label }, ... ] }
 * Ej: { tipo_identificacion: [...], estado: [...], ... }
 */
const ChoicesContext = createContext(null);

export const useChoices = () => {
  const ctx = useContext(ChoicesContext);
  if (!ctx) {
    throw new Error('useChoices debe usarse dentro de ChoicesProvider');
  }
  return ctx;
};

/** Promesa única del primer fetch para evitar doble carga (ej. Strict Mode). */
let choicesRequestPromise = null;

/**
 * ChoicesProvider: carga GET /api/choices/ una sola vez cuando el usuario está autenticado
 * y expone los valores en un store global. Los choices se reutilizan en toda la app.
 */
export const ChoicesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false);

  const loadChoices = useCallback(async () => {
    if (loadedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      if (choicesRequestPromise === null) {
        choicesRequestPromise = get('api/choices');
      }
      const { data } = await choicesRequestPromise;
      loadedRef.current = true;
      setChoices(typeof data === 'object' && data !== null ? data : {});
    } catch (err) {
      setError(err?.response || err);
      setChoices({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setChoices({});
      setError(null);
      return;
    }
    loadChoices();
  }, [isAuthenticated, loadChoices]);

  const value = {
    choices,
    loading,
    error,
    /** Obtiene la lista de opciones para una key (ej. 'estado', 'tipo_identificacion'). Devuelve [] si no existe. */
    getOptions: useCallback((key) => {
      const list = choices[key];
      return Array.isArray(list) ? list : [];
    }, [choices]),
  };

  return (
    <ChoicesContext.Provider value={value}>
      {children}
    </ChoicesContext.Provider>
  );
};
