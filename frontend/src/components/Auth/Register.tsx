import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { register, clearError } from '../../store/slices/authSlice';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'MERCHANT',
    businessName: '',
    businessType: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Join Mint Platform
            </Typography>
            <Typography variant='body1' color='textSecondary'>
              Create your account to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label='First Name'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label='Last Name'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              fullWidth
              label='Email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              margin='normal'
              required
            />

            <TextField
              fullWidth
              label='Password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              margin='normal'
              required
            />

            <FormControl fullWidth margin='normal'>
              <InputLabel>Account Type</InputLabel>
              <Select
                name='userType'
                value={formData.userType}
                onChange={handleSelectChange}
                label='Account Type'
              >
                <MenuItem value='MERCHANT'>Merchant</MenuItem>
                <MenuItem value='INDIVIDUAL'>Individual</MenuItem>
              </Select>
            </FormControl>

            {formData.userType === 'MERCHANT' && (
              <>
                <TextField
                  fullWidth
                  label='Business Name'
                  name='businessName'
                  value={formData.businessName}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
                <TextField
                  fullWidth
                  label='Business Type'
                  name='businessType'
                  value={formData.businessType}
                  onChange={handleChange}
                  margin='normal'
                  required
                />
              </>
            )}

            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body2'>
                Already have an account?{' '}
                <Link component={RouterLink} to='/login'>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
