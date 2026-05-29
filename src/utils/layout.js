/** Altura fija del AppBar (debe coincidir con AppNavbar) */
export const APP_BAR_HEIGHT = 64;

/** Altura aproximada del footer "Powered by" en el dashboard */
export const DASHBOARD_FOOTER_HEIGHT = 28;

/** Área útil bajo el navbar fijo */
export const DASHBOARD_BODY_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT}px)`;
export const DASHBOARD_BODY_HEIGHT_DVH = `calc(100dvh - ${APP_BAR_HEIGHT}px)`;

/**
 * Altura del slot de página dentro del main.
 * @param {number} mainPaddingY - padding vertical del main en px (theme spacing * 8)
 */
export function getDashboardPageHeight(mainPaddingY = 24) {
  const verticalPadding = mainPaddingY * 2;
  return `calc(100vh - ${APP_BAR_HEIGHT}px - ${DASHBOARD_FOOTER_HEIGHT}px - ${verticalPadding}px)`;
}
