import { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Pagination,
} from '@mui/material';
import { useThemeMode } from '../../../context/ThemeContext';
import { CampoRow } from './CampoRow';
import { CampoModals } from './CampoModals';
import { RelacionModal } from '../../../components/configuracion/RelacionModal';
import { CampoDetalleModal } from '../../../components/configuracion/campos/CampoDetalleModal';
import { CONFIG_FILAS_POR_PAGINA } from '../logic/constants';
import { COMPACT_MEDIA } from '../../../utils/theme';

const COLUMNS = ['Campo', 'Tipo de campo', 'Estado', 'Opciones'];

export function CamposConfigSection({ campos, pagina, setPagina }) {
  const { isDark } = useThemeMode();
  const [rowForRelacion, setRowForRelacion] = useState(null);
  const [rowForDetalle, setRowForDetalle] = useState(null);
  const totalItems = campos.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / CONFIG_FILAS_POR_PAGINA));
  const filasPagina = campos.campos ?? [];
  const inicio = totalItems === 0 ? 0 : (pagina - 1) * CONFIG_FILAS_POR_PAGINA + 1;
  const fin = totalItems === 0 ? 0 : Math.min(pagina * CONFIG_FILAS_POR_PAGINA, totalItems);
  const handleChangePagina = (_, value) => setPagina(value);

  return (
    <>
      <TableContainer
        sx={{
          flexShrink: 0,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          [COMPACT_MEDIA]: { borderRadius: 1 },
        }}
      >
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.8125rem',
                    py: 1.5,
                    [COMPACT_MEDIA]: { fontSize: '0.75rem', py: 1 },
                    ...(col === 'Opciones' && { align: 'center' }),
                  }}
                  align={col === 'Opciones' ? 'center' : 'left'}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filasPagina.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <CampoRow
                  row={row}
                  onEdit={campos.handleAbrirEditar}
                  onDelete={campos.handleAbrirEliminar}
                  onRelacionar={setRowForRelacion}
                  onVerDetalles={setRowForDetalle}
                  getTipoLabel={campos.getTipoLabel}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ flex: 1, minHeight: 0 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexWrap: 'wrap',
          gap: 1.5,
          borderRadius: '0 0 12px 12px',
          [COMPACT_MEDIA]: { py: 1, px: 1.5, gap: 1 },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, [COMPACT_MEDIA]: { fontSize: '0.75rem' } }}>
          Mostrando {inicio}–{fin} de {totalItems} campos
        </Typography>
        <Pagination
          count={totalPages}
          page={pagina}
          onChange={handleChangePagina}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          sx={{
            flexShrink: 0,
            '& .MuiPagination-ul': { flexWrap: 'wrap', justifyContent: 'center' },
            [COMPACT_MEDIA]: { '& .MuiPaginationItem-root': { minWidth: 28, height: 28, fontSize: '0.75rem' } },
          }}
        />
      </Stack>

      <CampoModals
        tipoCampoOptions={campos.tipoCampoOptions}
        seccionOptions={campos.seccionOptions}
        empresasParaSelect={campos.empresasParaSelect}
        serviciosFiltrados={campos.serviciosFiltrados}
        handleChangeEmpresa={campos.handleChangeEmpresa}
        cargandoServicios={campos.cargandoServicios}
        modalNueva={campos.modalNueva}
        modalEditar={campos.modalEditar}
        modalEliminar={campos.modalEliminar}
        nombre={campos.nombre}
        setNombre={campos.setNombre}
        empresaId={campos.empresaId}
        setEmpresaId={campos.setEmpresaId}
        servicioId={campos.servicioId}
        setServicioId={campos.setServicioId}
        tipoCampo={campos.tipoCampo}
        setTipoCampo={campos.setTipoCampo}
        entidad={campos.entidad}
        setEntidad={campos.setEntidad}
        entidadOptions={campos.entidadOptions}
        depende_de_id={campos.depende_de_id}
        setDepende_de_id={campos.setDepende_de_id}
        camposMismaSeccion={campos.camposMismaSeccion}
        seccion={campos.seccion}
        setSeccion={campos.setSeccion}
        orden={campos.orden}
        setOrden={campos.setOrden}
        activo={campos.activo}
        setActivo={campos.setActivo}
        requerido={campos.requerido}
        setRequerido={campos.setRequerido}
        placeholder={campos.placeholder}
        setPlaceholder={campos.setPlaceholder}
        visible_si={campos.visible_si}
        setVisible_si={campos.setVisible_si}
        productoId={campos.productoId}
        setProductoId={campos.setProductoId}
        opcionesProducto={campos.opcionesProducto}
        opciones={campos.opciones}
        opcionInput={campos.opcionInput}
        setOpcionInput={campos.setOpcionInput}
        aplicarTodosServicios={campos.aplicarTodosServicios}
        setAplicarTodosServicios={campos.setAplicarTodosServicios}
        aplicarTodosEmpresas={campos.aplicarTodosEmpresas}
        setAplicarTodosEmpresas={campos.setAplicarTodosEmpresas}
        aplicarTodosProductos={campos.aplicarTodosProductos}
        setAplicarTodosProductos={campos.setAplicarTodosProductos}
        aEliminar={campos.aEliminar}
        errors={campos.errors}
        canSave={campos.canSave}
        guardandoNueva={campos.guardandoNueva}
        guardandoEditar={campos.guardandoEditar}
        eliminando={campos.eliminando}
        handleCerrarNueva={campos.handleCerrarNueva}
        handleGuardarNueva={campos.handleGuardarNueva}
        handleAñadirOpcion={campos.handleAñadirOpcion}
        handleQuitarOpcion={campos.handleQuitarOpcion}
        handleCerrarEditar={campos.handleCerrarEditar}
        handleGuardarEditar={campos.handleGuardarEditar}
        handleCerrarEliminar={campos.handleCerrarEliminar}
        handleConfirmarEliminar={campos.handleConfirmarEliminar}
      />
      <RelacionModal
        open={Boolean(rowForRelacion)}
        onClose={() => setRowForRelacion(null)}
        origen_tipo="campo"
        origen_id={rowForRelacion?.id}
        nombre_entidad="Campo"
      />
      <CampoDetalleModal
        open={Boolean(rowForDetalle)}
        onClose={() => setRowForDetalle(null)}
        campo={rowForDetalle}
        getTipoLabel={campos.getTipoLabel}
        getSeccionLabel={campos.getSeccionLabel}
      />
    </>
  );
}
