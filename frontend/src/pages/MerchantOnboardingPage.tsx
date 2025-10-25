import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { onboardMerchant, clearError } from '../store/slices/merchantSlice';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Business Information',
  'Business Details',
  'Contact Information',
  'Review & Submit',
];

const businessTypes = [
  'Retail',
  'Restaurant',
  'Healthcare',
  'Education',
  'Professional Services',
  'E-commerce',
  'Other',
];

const MerchantOnboardingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, currentMerchant } = useSelector(
    (state: RootState) => state.merchants
  );

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    website: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (currentMerchant) {
      navigate('/dashboard');
    }
  }, [currentMerchant, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await dispatch(onboardMerchant(formData)).unwrap();
      setSnackbar({
        open: true,
        message: 'Merchant onboarding completed successfully!',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to complete onboarding',
        severity: 'error',
      });
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.businessName && formData.businessType;
      case 1:
        return formData.address && formData.city && formData.state;
      case 2:
        return true; // Optional fields
      case 3:
        return isStepValid(0) && isStepValid(1);
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Business Name'
                value={formData.businessName}
                onChange={(e) =>
                  handleInputChange('businessName', e.target.value)
                }
                required
                helperText='Enter your official business name'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={formData.businessType}
                  label='Business Type'
                  onChange={(e) =>
                    handleInputChange('businessType', e.target.value)
                  }
                >
                  {businessTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Registration Number'
                value={formData.registrationNumber}
                onChange={(e) =>
                  handleInputChange('registrationNumber', e.target.value)
                }
                helperText='CAC registration number (optional)'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Tax ID'
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                helperText='Tax identification number (optional)'
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Business Address'
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                multiline
                rows={2}
                helperText='Enter your complete business address'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  label='Country'
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <MenuItem value='Nigeria'>Nigeria</MenuItem>
                  <MenuItem value='Ghana'>Ghana</MenuItem>
                  <MenuItem value='Kenya'>Kenya</MenuItem>
                  <MenuItem value='South Africa'>South Africa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Website'
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                helperText='Your business website (optional)'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Business Description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                multiline
                rows={4}
                helperText='Describe your business and services (optional)'
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Review Your Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Business Name
                </Typography>
                <Typography variant='body1'>{formData.businessName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Business Type
                </Typography>
                <Typography variant='body1'>{formData.businessType}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Address
                </Typography>
                <Typography variant='body1'>
                  {formData.address}, {formData.city}, {formData.state},{' '}
                  {formData.country}
                </Typography>
              </Grid>
              {formData.website && (
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Website
                  </Typography>
                  <Typography variant='body1'>{formData.website}</Typography>
                </Grid>
              )}
              {formData.description && (
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Description
                  </Typography>
                  <Typography variant='body1'>
                    {formData.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant='h4' gutterBottom align='center'>
        Merchant Onboarding
      </Typography>
      <Typography
        variant='body1'
        color='textSecondary'
        align='center'
        sx={{ mb: 4 }}
      >
        Complete your merchant profile to start accepting payments
      </Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation='vertical'>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <div>
                      <Button
                        variant='contained'
                        onClick={
                          index === steps.length - 1 ? handleSubmit : handleNext
                        }
                        disabled={!isStepValid(index) || loading}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : index === steps.length - 1 ? (
                          'Complete Onboarding'
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MerchantOnboardingPage;
