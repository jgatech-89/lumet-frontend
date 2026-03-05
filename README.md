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
