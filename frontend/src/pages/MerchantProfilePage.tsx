import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
  Description as DescriptionIcon,
  Store as StoreIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getMyMerchant,
  getMerchantStats,
  updateMerchant,
  clearError,
} from '../store/slices/merchantSlice';

const MerchantProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentMerchant, merchantStats, loading, error } = useSelector(
    (state: RootState) => state.merchants
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    country: '',
    website: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadMerchantData();
  }, []);

  const loadMerchantData = async () => {
    try {
      await Promise.all([
        dispatch(getMyMerchant()).unwrap(),
        dispatch(getMerchantStats()).unwrap(),
      ]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load merchant data',
        severity: 'error',
      });
    }
  };

  const handleEdit = () => {
    if (currentMerchant) {
      setEditData({
        businessName: currentMerchant.businessName,
        businessType: currentMerchant.businessType,
        registrationNumber: currentMerchant.registrationNumber || '',
        taxId: currentMerchant.taxId || '',
        address: currentMerchant.address,
        city: currentMerchant.city,
        state: currentMerchant.state,
        country: currentMerchant.country,
        website: currentMerchant.website || '',
        description: currentMerchant.description || '',
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      businessName: '',
      businessType: '',
      registrationNumber: '',
      taxId: '',
      address: '',
      city: '',
      state: '',
      country: '',
      website: '',
      description: '',
    });
  };

  const handleSave = async () => {
    if (!currentMerchant) return;

    try {
      await dispatch(
        updateMerchant({
          id: currentMerchant.id,
          data: editData,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Merchant profile updated successfully',
        severity: 'success',
      });
      setIsEditing(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update merchant profile',
        severity: 'error',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (!currentMerchant) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' gutterBottom>
          Merchant Profile
        </Typography>
        <Button
          variant={isEditing ? 'outlined' : 'contained'}
          startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
          onClick={isEditing ? handleCancel : handleEdit}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Business Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Business Name'
                    value={
                      isEditing
                        ? editData.businessName
                        : currentMerchant.businessName
                    }
                    onChange={(e) =>
                      handleInputChange('businessName', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Business Type'
                    value={
                      isEditing
                        ? editData.businessType
                        : currentMerchant.businessType
                    }
                    onChange={(e) =>
                      handleInputChange('businessType', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Registration Number'
                    value={
                      isEditing
                        ? editData.registrationNumber
                        : currentMerchant.registrationNumber || ''
                    }
                    onChange={(e) =>
                      handleInputChange('registrationNumber', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Tax ID'
                    value={
                      isEditing ? editData.taxId : currentMerchant.taxId || ''
                    }
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Business Address'
                    value={
                      isEditing ? editData.address : currentMerchant.address
                    }
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    disabled={!isEditing}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='City'
                    value={isEditing ? editData.city : currentMerchant.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='State'
                    value={isEditing ? editData.state : currentMerchant.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Country'
                    value={
                      isEditing ? editData.country : currentMerchant.country
                    }
                    onChange={(e) =>
                      handleInputChange('country', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Website'
                    value={
                      isEditing
                        ? editData.website
                        : currentMerchant.website || ''
                    }
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Business Description'
                    value={
                      isEditing
                        ? editData.description
                        : currentMerchant.description || ''
                    }
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    disabled={!isEditing}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant='contained'
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats and Info */}
        <Grid item xs={12} md={4}>
          {/* Account Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Account Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {currentMerchant.businessName}
                  </Typography>
                  <Chip
                    label={currentMerchant.user.status}
                    color={
                      currentMerchant.user.status === 'ACTIVE'
                        ? 'success'
                        : 'warning'
                    }
                    size='small'
                  />
                </Box>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary='Email'
                    secondary={currentMerchant.user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary='Location'
                    secondary={`${currentMerchant.city}, ${currentMerchant.state}`}
                  />
                </ListItem>
                {currentMerchant.website && (
                  <ListItem>
                    <ListItemIcon>
                      <WebIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Website'
                      secondary={currentMerchant.website}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Business Stats */}
          {merchantStats && (
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Business Statistics
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <StoreIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Total Outlets'
                      secondary={`${merchantStats.totalOutlets} (${merchantStats.activeOutlets} active)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Total Terminals'
                      secondary={`${merchantStats.totalTerminals} (${merchantStats.activeTerminals} active)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Total Invoices'
                      secondary={`${merchantStats.totalInvoices} (${merchantStats.paidInvoices} paid)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Total Revenue'
                      secondary={formatCurrency(merchantStats.totalRevenue)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary='Success Rate'
                      secondary={`${merchantStats.successRate.toFixed(1)}%`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Outlets Section */}
          {currentMerchant && currentMerchant.outlets && (
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  My Outlets ({currentMerchant.outlets.length})
                </Typography>
                {currentMerchant.outlets.length > 0 ? (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {currentMerchant.outlets.map((outlet: any) => (
                      <Box
                        key={outlet.id}
                        sx={{
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant='subtitle1'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {outlet.name}
                          </Typography>
                          <Chip
                            label={outlet.isActive ? 'Active' : 'Inactive'}
                            color={outlet.isActive ? 'success' : 'default'}
                            size='small'
                          />
                        </Box>
                        <Typography
                          variant='body2'
                          color='textSecondary'
                          sx={{ mb: 1 }}
                        >
                          {outlet.address}, {outlet.city}, {outlet.state}
                        </Typography>
                        {outlet.phone && (
                          <Typography variant='body2' color='textSecondary'>
                            Phone: {outlet.phone}
                          </Typography>
                        )}
                        {outlet.email && (
                          <Typography variant='body2' color='textSecondary'>
                            Email: {outlet.email}
                          </Typography>
                        )}
                        {outlet.terminals && outlet.terminals.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant='body2' color='textSecondary'>
                              Terminals: {outlet.terminals.length}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant='body2' color='textSecondary'>
                    No outlets created yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Terminals Section */}
          {currentMerchant &&
            currentMerchant.outlets &&
            currentMerchant.outlets.some(
              (outlet: any) => outlet.terminals && outlet.terminals.length > 0
            ) && (
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    My Terminals
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {currentMerchant.outlets.map(
                      (outlet: any) =>
                        outlet.terminals &&
                        outlet.terminals.map((terminal: any) => (
                          <Box
                            key={terminal.id}
                            sx={{
                              p: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant='subtitle1'
                                sx={{ fontWeight: 'bold' }}
                              >
                                {terminal.serialNumber}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={terminal.status}
                                  color={
                                    terminal.status === 'ACTIVE'
                                      ? 'success'
                                      : 'default'
                                  }
                                  size='small'
                                />
                                <Chip
                                  label={
                                    terminal.isOnline ? 'Online' : 'Offline'
                                  }
                                  color={
                                    terminal.isOnline ? 'success' : 'error'
                                  }
                                  size='small'
                                />
                              </Box>
                            </Box>
                            <Typography variant='body2' color='textSecondary'>
                              Outlet: {outlet.name}
                            </Typography>
                            {terminal.location && (
                              <Typography variant='body2' color='textSecondary'>
                                Location: {terminal.location}
                              </Typography>
                            )}
                          </Box>
                        ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
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

export default MerchantProfilePage;
