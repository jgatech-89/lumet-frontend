import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
} from '@mui/material';

const NewClientPage = () => {
  const navigate = useNavigate();
  const [tipoCliente, setTipoCliente] = useState('Empresa');
  const [empresa, setEmpresa] = useState('Naturgy');
  const [formData, setFormData] = useState({
    cupsLuz: '',
    comercializadoraLuz: '',
    tarifaLuz: '',
    mantenimientoLuz: '',
    cupsGas: '',
    comercializadoraGas: '',
    mantenimientoGas: '',
  });

  const handleLimpiar = () => {
    setTipoCliente('Empresa');
    setEmpresa('Naturgy');
    setFormData({
      cupsLuz: '',
      comercializadoraLuz: '',
      tarifaLuz: '',
      mantenimientoLuz: '',
      cupsGas: '',
      comercializadoraGas: '',
      mantenimientoGas: '',
    });
  };

  const handleGuardar = () => {
  };

  const selectFieldSx = {
    minWidth: 220,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        <Box sx={{ mb: 3, flexShrink: 0 }}>
          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Nuevo cliente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Completa la información del cliente
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.06)',
            bgcolor: 'background.paper',
            flex: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
            Datos Comerciales
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
            <FormControl size="small" sx={selectFieldSx} required>
              <InputLabel id="tipo-cliente-label">Tipo de cliente</InputLabel>
              <Select
                labelId="tipo-cliente-label"
                value={tipoCliente}
                label="Tipo de cliente *"
                onChange={(e) => setTipoCliente(e.target.value)}
              >
                <MenuItem value="Empresa">Empresa</MenuItem>
                <MenuItem value="Particular">Particular</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={selectFieldSx} required>
              <InputLabel id="empresa-label">Empresa</InputLabel>
              <Select
                labelId="empresa-label"
                value={empresa}
                label="Empresa *"
                onChange={(e) => setEmpresa(e.target.value)}
              >
                <MenuItem value="Naturgy">Naturgy</MenuItem>
                <MenuItem value="Iberdrola">Iberdrola</MenuItem>
                <MenuItem value="Endesa">Endesa</MenuItem>
                <MenuItem value="Repsol">Repsol</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
            {empresa}
          </Typography>
          <Stack spacing={3} sx={{ maxWidth: 480 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                CUPS luz
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="cups-luz-label">Seleccionar</InputLabel>
                <Select
                  labelId="cups-luz-label"
                  value={formData.cupsLuz}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, cupsLuz: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                Comercializadora actual luz
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="comercializadora-luz-label">Seleccionar</InputLabel>
                <Select
                  labelId="comercializadora-luz-label"
                  value={formData.comercializadoraLuz}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, comercializadoraLuz: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                Tarifa luz
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="tarifa-luz-label">Seleccionar</InputLabel>
                <Select
                  labelId="tarifa-luz-label"
                  value={formData.tarifaLuz}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, tarifaLuz: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                Mantenimiento luz
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="mantenimiento-luz-label">Seleccionar</InputLabel>
                <Select
                  labelId="mantenimiento-luz-label"
                  value={formData.mantenimientoLuz}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, mantenimientoLuz: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                CUPS gas
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="cups-gas-label">Seleccionar</InputLabel>
                <Select
                  labelId="cups-gas-label"
                  value={formData.cupsGas}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, cupsGas: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                Comercializadora actual gas
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="comercializadora-gas-label">Seleccionar</InputLabel>
                <Select
                  labelId="comercializadora-gas-label"
                  value={formData.comercializadoraGas}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, comercializadoraGas: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
                Mantenimiento gas
              </Typography>
              <FormControl size="small" sx={{ flex: 1, maxWidth: 220 }}>
                <InputLabel id="mantenimiento-gas-label">Seleccionar</InputLabel>
                <Select
                  labelId="mantenimiento-gas-label"
                  value={formData.mantenimientoGas}
                  label="Seleccionar"
                  onChange={(e) => setFormData((p) => ({ ...p, mantenimientoGas: e.target.value }))}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  <MenuItem value="opcion1">Opción 1</MenuItem>
                  <MenuItem value="opcion2">Opción 2</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            justifyContent="flex-end"
            gap={2}
            sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'rgba(0,0,0,0.12)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.25)',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Atrás
            </Button>
            <Button
              variant="outlined"
              onClick={handleLimpiar}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                },
              }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              onClick={handleGuardar}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                boxShadow: '0 1px 3px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
                },
              }}
            >
              Guardar cliente
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Paper>
  );
};

export default NewClientPage;
