import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import { LoadingButton } from '../loading';

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
  </svg>
);

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // defaultValues: {
    //   email: 'demo@minimals.cc',
    //   password: '@2Minimal',
    // },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 1.5,
          whiteSpace: 'nowrap',
          fontSize: { xs: '1.35rem', sm: '1.7rem' },
        }}
      >
        Iniciar sesión en tu cuenta
      </Typography>

      <Box
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: '#d3eafd',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: '#2196f3',
          }}
        />
        <Typography
          variant="body2"
          sx={{ color: 'rgba(0, 0, 0, 0.8)' }}
        >
          Recuerda que para autenticarte debes ingresar con el correo electrónico.
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Correo electrónico"
        type="email"
        margin="normal"
        size="medium"
        defaultValue=""
        {...register('email', {
          required: 'El correo es obligatorio',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo no válido',
          },
        })}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        inputProps={{ 'aria-label': 'Correo electrónico' }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: '#ffffff',
            minHeight: 60,
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2196f3',
                borderWidth: 2,
              },
              boxShadow: '0 0 0 3px rgba(33,150,243,0.15)',
            },
          },
        }}
      />

      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          size="medium"
          defaultValue=""
          {...register('password', { required: 'La contraseña es obligatoria' })}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          inputProps={{ 'aria-label': 'Contraseña' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((p) => !p)}
                  edge="end"
                  size="small"
                  sx={{ color: '#2196f3' }}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#ffffff',
              minHeight: 60,
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196f3',
                  borderWidth: 2,
                },
                boxShadow: '0 0 0 3px rgba(33,150,243,0.15)',
              },
            },
          }}
        />
      </Box>

      <Link
        href="#"
        variant="body2"
        sx={{
          display: 'block',
          mt: 2.5,
          mb: 2,
          color: 'text.secondary',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline', color: '#4dabf5' },
        }}
      >
        ¿Olvidaste tu contraseña?
      </Link>

      <LoadingButton
        type="submit"
        fullWidth
        variant="contained"
        loading={isLoading}
        loadingText="Entrando..."
        sx={{
          mt: 2.5,
          height: 60,
          borderRadius: 2,
          bgcolor: '#2196f3',
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover:not(.Mui-disabled)': {
            bgcolor: '#4dabf5',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.35)',
          },
        }}
      >
        Iniciar sesión
      </LoadingButton>
    </Box>
  );
};

export default LoginForm;
