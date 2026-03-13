# Lumet Frontend

Frontend del proyecto Lumet. React + Vite, entorno de desarrollo con hot reload.

## Requisitos

- **Docker**

## Dependencias (resumen)

- **React** + **react-router-dom** — interfaz y rutas
- **Vite** — build y dev server
- **MUI** (@mui/material, @emotion/react, @emotion/styled) — componentes UI
- **axios** — peticiones HTTP
- **react-hook-form** — formularios
- **react-toastify** — notificaciones
- **dayjs** — fechas
- **ESLint** — linting

## Levantar con Docker

```bash
docker compose up
```

Abrir **http://localhost:5173**

## Detener el proyecto

- Con el contenedor en primer plano: **Ctrl + C**
- Para bajar contenedores y red: `docker compose down`

## Scripts (dentro del contenedor)

| Comando           | Descripción            |
|-------------------|------------------------|
| `npm run dev`     | Servidor de desarrollo |
| `npm run build`   | Build de producción    |
| `npm run lint`    | ESLint                 |
| `npm run sync-logo` | Copia el logo de `src/assets/logo-lumet.png` a `public/` (favicon). Ejecutar al cambiar el logo. |

## Control de permisos por perfil

La app restringe partes de la interfaz según el perfil (rol) del usuario autenticado. Los permisos se definen en un solo lugar y se consumen con el hook `usePermissions()`.

### Cómo agregar un permiso nuevo

#### 1. Definir el permiso — `src/utils/permissions.js`

En el objeto **`PERMISSIONS`**, añade una nueva clave con un identificador único:

```js
export const PERMISSIONS = {
  ACCESS_SETTINGS: 'access_settings',
  DELETE_CLIENT: 'delete_client',
  EDIT_CLIENT: 'edit_client',   // ← nuevo
};
```

#### 2. Asignar el permiso a roles — `src/utils/permissions.js`

En el objeto **`ROLE_PERMISSIONS`**, añade el permiso al array del rol que debe tenerlo:

```js
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [PERMISSIONS.ACCESS_SETTINGS, PERMISSIONS.DELETE_CLIENT, PERMISSIONS.EDIT_CLIENT],
  [ROLES.USUARIO]: [PERMISSIONS.EDIT_CLIENT],  // ejemplo: usuario puede editar
  user: [],
  [ROLES.CLIENTE]: [],
  [ROLES.INVITADO]: [],
};
```

#### 3. (Opcional) Exponer un atajo en el hook — `src/hooks/usePermissions.js`

Si quieres un booleano tipo `canEditClient` en lugar de usar siempre `hasPermission()`, añádelo en el `return` del hook:

```js
return {
  isAdmin: admin,
  canAccessSettings: checkHasPermission(role, PERMISSIONS.ACCESS_SETTINGS),
  canDeleteClient: checkHasPermission(role, PERMISSIONS.DELETE_CLIENT),
  canEditClient: checkHasPermission(role, PERMISSIONS.EDIT_CLIENT),  // ← opcional
  hasPermission: (permission) => checkHasPermission(role, permission),
  role,
};
```

#### 4. Usar el permiso en la UI

En el componente:

- **Con atajo (si lo definiste en el paso 3):**
  ```js
  const { canEditClient } = usePermissions();
  if (canEditClient) { ... }
  ```
- **Sin atajo (solo con `PERMISSIONS` y el hook):**
  ```js
  import { PERMISSIONS } from '../utils/permissions';
  const { hasPermission } = usePermissions();
  if (hasPermission(PERMISSIONS.EDIT_CLIENT)) { ... }
  ```

### Resumen rápido

| Paso | Archivo | Acción |
|------|---------|--------|
| 1 | `src/utils/permissions.js` | Añadir clave en `PERMISSIONS`. |
| 2 | `src/utils/permissions.js` | Añadir permiso al rol en `ROLE_PERMISSIONS`. |
| 3 (opcional) | `src/hooks/usePermissions.js` | Añadir booleano `canXxx` en el return. |
| 4 | Tu componente | Usar `usePermissions()` y el atajo o `hasPermission(PERMISSIONS.xxx)`. |

El rol del usuario viene del **AuthContext** (campo `perfil` / `role` del endpoint `/me` del backend).
