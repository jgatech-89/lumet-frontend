import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  isAdmin as checkIsAdmin,
  hasPermission as checkHasPermission,
  PERMISSIONS,
} from '../utils/permissions';

/**
 * Hook centralizado para comprobar permisos del usuario autenticado.
 * Usa el usuario del AuthContext (perfil/role) y las reglas definidas en utils/permissions.
 *
 * Uso:
 *   const { isAdmin, canAccessSettings, canDeleteClient, hasPermission } = usePermissions();
 *   if (canAccessSettings) { ... }
 *   if (hasPermission(PERMISSIONS.EDIT_CLIENT)) { ... }
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? user?.perfil ?? '';

  return useMemo(() => {
    const admin = checkIsAdmin(role);
    return {
      /** true si el usuario tiene rol admin */
      isAdmin: admin,
      /** true si puede ver y acceder a la sección Configuración */
      canAccessSettings: checkHasPermission(role, PERMISSIONS.ACCESS_SETTINGS),
      /** true si puede eliminar clientes */
      canDeleteClient: checkHasPermission(role, PERMISSIONS.DELETE_CLIENT),
      /** true si puede exportar/importar Excel y exportar PDF en clientes */
      canExportImportPdfClientes: checkHasPermission(role, PERMISSIONS.EXPORT_IMPORT_PDF_CLIENTES),
      /** true si puede cambiar estado de venta de productos en la tabla de productos */
      canChangeProductState: checkHasPermission(role, PERMISSIONS.CHANGE_PRODUCT_STATE),
      /**
       * Comprueba cualquier permiso por código.
       * @param {string} permission - PERMISSIONS.xxx
       * @returns {boolean}
       */
      hasPermission: (permission) => checkHasPermission(role, permission),
      /** Rol actual del usuario (para lógica específica si hace falta) */
      role,
    };
  }, [role]);
}
