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
  // Ejemplos para escalar:
  // EDIT_CLIENT: 'edit_client',
  // CREATE_CLIENT: 'create_client',
};

/**
 * Mapa rol -> permisos permitidos.
 * Solo los roles listados tienen ese permiso. Admin tiene todos.
 * 'user' se trata como alias de 'usuario' por compatibilidad con rutas.
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [PERMISSIONS.ACCESS_SETTINGS, PERMISSIONS.DELETE_CLIENT],
  [ROLES.USUARIO]: [],
  user: [], // alias de usuario
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
