import { useState } from 'react';

const FORM_INICIAL = {
  cupsLuz: '',
  comercializadoraLuz: '',
  tarifaLuz: '',
  mantenimientoLuz: '',
  cupsGas: '',
  comercializadoraGas: '',
  mantenimientoGas: '',
};

/**
 * Hook con la lógica del formulario de nuevo cliente.
 */
export function useNuevoCliente() {
  const [tipoCliente, setTipoCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [formData, setFormData] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const handleLimpiar = () => {
    setTipoCliente('');
    setEmpresa('');
    setFormData({ ...FORM_INICIAL });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // TODO: llamar API para crear cliente cuando exista el endpoint
    } finally {
      setGuardando(false);
    }
  };

  return {
    tipoCliente,
    setTipoCliente,
    empresa,
    setEmpresa,
    formData,
    setFormData,
    guardando,
    handleLimpiar,
    handleGuardar,
  };
}
