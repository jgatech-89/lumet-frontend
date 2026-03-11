import { COMPACT_MEDIA } from '../../utils/theme';

export const actionBtnBase = {
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  padding: 0,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid transparent',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  [COMPACT_MEDIA]: { width: 28, height: 28, minWidth: 28, minHeight: 28 },
};

export const getActionBtnBlue = (isDark) => ({
  ...actionBtnBase,
  bgcolor: isDark ? 'rgba(33, 150, 243, 0.22)' : 'rgba(33, 150, 243, 0.1)',
  color: 'primary.main',
  '&:hover': { bgcolor: isDark ? 'rgba(33, 150, 243, 0.35)' : 'rgba(33, 150, 243, 0.18)' },
});

export const getActionBtnRed = (isDark) => ({
  ...actionBtnBase,
  bgcolor: isDark ? 'rgba(244, 67, 54, 0.22)' : 'rgba(244, 67, 54, 0.1)',
  color: 'error.main',
  '&:hover': { bgcolor: isDark ? 'rgba(244, 67, 54, 0.35)' : 'rgba(244, 67, 54, 0.18)' },
});

export const getActionBtnGray = (isDark) => ({
  ...actionBtnBase,
  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
  color: 'text.secondary',
  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.1)' },
});

export const compactCellSx = { py: 1.5, [COMPACT_MEDIA]: { py: 1, fontSize: '0.8125rem' } };
export const compactChipSx = { [COMPACT_MEDIA]: { fontSize: '0.6875rem', px: 0.75, height: 20 } };
