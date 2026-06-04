/**
 * Constantes y utilidades para el control de permisos por perfil (rol) de usuario.
 * Centraliza la lógica de qué puede hacer cada rol para mantener el frontend escalable.
 *
 * Los valores de rol deben coincidir con el campo `perfil` que devuelve el backend en /me.
 */

/** Roles del sistema (valores del backend: perfil) */
export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario',
  CLIENTE: 'cliente',
  INVITADO: 'invitado',
};

/**
 * Permisos que se pueden comprobar en la UI.
 * Añadir aquí nuevos permisos cuando se necesiten.
 */
export const PERMISSIONS = {
  /** Acceso a la sección Configuración (sidebar y ruta) */
  ACCESS_SETTINGS: 'access_settings',
  /** Poder eliminar clientes desde la tabla */
  DELETE_CLIENT: 'delete_client',
  /** Importar clientes desde Excel */
  IMPORT_EXCEL_CLIENTES: 'import_excel_clientes',
  /** Exportar listado de clientes a Excel */
  EXPORT_EXCEL_CLIENTES: 'export_excel_clientes',
  /** Descargar PDF de contrato por cliente */
  EXPORT_PDF_CLIENTE: 'export_pdf_cliente',
  /** Cambiar estado de venta de productos en la tabla de productos del cliente (solo admin) */
  CHANGE_PRODUCT_STATE: 'change_product_state',
};

/**
 * Mapa rol -> permisos permitidos.
 * Solo los roles listados tienen ese permiso. Admin tiene todos.
 * 'user' se trata como alias de 'usuario' por compatibilidad con rutas.
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ACCESS_SETTINGS,
    PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.IMPORT_EXCEL_CLIENTES,
    PERMISSIONS.EXPORT_EXCEL_CLIENTES,
    PERMISSIONS.EXPORT_PDF_CLIENTE,
    PERMISSIONS.CHANGE_PRODUCT_STATE,
  ],
  [ROLES.USUARIO]: [PERMISSIONS.IMPORT_EXCEL_CLIENTES],
  user: [PERMISSIONS.IMPORT_EXCEL_CLIENTES], // alias de usuario
  [ROLES.CLIENTE]: [],
  [ROLES.INVITADO]: [],
};

/**
 * Indica si el rol dado es administrador.
 * @param {string} role - Rol del usuario (ej. user.perfil o user.role)
 * @returns {boolean}
 */
export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

/**
 * Devuelve el conjunto de permisos para un rol.
 * Si el rol no está definido, se trata como usuario sin permisos extra.
 * @param {string} role - Rol del usuario
 * @returns {Set<string>} Set de códigos de permiso
 */
export function getPermissionsForRole(role) {
  const normalized = role && typeof role === 'string' ? role.toLowerCase().trim() : '';
  const list = ROLE_PERMISSIONS[normalized] ?? ROLE_PERMISSIONS[ROLES.USUARIO] ?? [];
  return new Set(list);
}

/**
 * Comprueba si un rol tiene un permiso concreto.
 * @param {string} role - Rol del usuario
 * @param {string} permission - Código de permiso (PERMISSIONS.xxx)
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!permission) return false;
  return getPermissionsForRole(role).has(permission);
}
