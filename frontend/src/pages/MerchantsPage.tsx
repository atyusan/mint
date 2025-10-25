import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar,
  Tooltip,
  Pagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Store as StoreIcon,
  PointOfSale as TerminalIcon,
  AddBusiness as AddBusinessIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { api } from '../api/api';
import {
  getMerchants,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  setFilters,
  clearError,
} from '../store/slices/merchantSlice';

const MerchantsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { merchants, loading, error, filters, total, page, limit } =
    useSelector((state: RootState) => state.merchants);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [outletDialog, setOutletDialog] = useState(false);
  const [terminalDialog, setTerminalDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [actionMenu, setActionMenu] = useState<{
    anchorEl: HTMLElement | null;
    merchant: any | null;
  }>({ anchorEl: null, merchant: null });
  const [merchantDialogTab, setMerchantDialogTab] = useState(0);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Add merchant form state
  const [addFormData, setAddFormData] = useState({
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
    // User data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Edit merchant form state
  const [editFormData, setEditFormData] = useState({
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

  // Outlet creation form state
  const [outletFormData, setOutletFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    description: '',
  });

  // Terminal allocation form state
  const [terminalFormData, setTerminalFormData] = useState({
    outletId: '',
    serialNumber: '',
    model: '',
    location: '',
  });

  // Invoice creation form state
  const [invoiceFormData, setInvoiceFormData] = useState({
    outletId: '',
    terminalId: '',
    amount: '',
    currency: 'NGN',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    loadMerchants();
  }, [filters]);

  const loadMerchants = async () => {
    try {
      await dispatch(getMerchants(filters)).unwrap();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to load merchants',
        severity: 'error',
      });
    }
  };

  const handleSearch = () => {
    dispatch(
      setFilters({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        businessType:
          businessTypeFilter !== 'all' ? businessTypeFilter : undefined,
        page: 1,
      })
    );
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    dispatch(setFilters({ page: value }));
  };

  const handleDeleteMerchant = async () => {
    if (!selectedMerchant) return;

    try {
      await dispatch(deleteMerchant(selectedMerchant.id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Merchant deleted successfully',
        severity: 'success',
      });
      setDeleteDialog(false);
      setSelectedMerchant(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete merchant',
        severity: 'error',
      });
    }
  };

  const handleAddMerchant = () => {
    setAddDialog(true);
  };

  const handleAddFormChange = (field: string, value: string) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewMerchant = (merchant: any) => {
    setSelectedMerchant(merchant);
    setViewDialog(true);
    setMerchantDialogTab(0); // Reset to outlets tab
    loadInvoices(merchant.id); // Load invoices for the merchant
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMerchantDialogTab(newValue);
  };

  const loadInvoices = async (merchantId: string) => {
    setInvoicesLoading(true);
    try {
      console.log('Loading invoices for merchant:', merchantId);

      // Try the merchantId approach first
      const response = await api.get(
        `/invoices?merchantId=${merchantId}&page=1&limit=50`
      );
      console.log('Invoices response:', response.data);

      if (response.data.invoices && response.data.invoices.length > 0) {
        console.log('Found invoices:', response.data.invoices.length);
        setInvoices(response.data.invoices);
      } else {
        console.log(
          'No invoices found with merchantId, trying outlets approach...'
        );

        // Get merchant details to access outlets
        const merchantResponse = await api.get(`/merchants/${merchantId}`);
        const merchant = merchantResponse.data;

        if (merchant.outlets && merchant.outlets.length > 0) {
          // Get outlet IDs
          const outletIds = merchant.outlets.map((outlet: any) => outlet.id);
          console.log('Found outlets:', outletIds);

          // Fetch invoices for all outlets
          const invoicesPromises = outletIds.map((outletId: string) =>
            api.get(`/invoices?outletId=${outletId}&page=1&limit=50`)
          );

          const responses = await Promise.all(invoicesPromises);
          console.log(
            'Outlet invoices responses:',
            responses.map((r) => r.data)
          );

          // Combine all invoices from all outlets
          const allInvoices = responses.flatMap(
            (response) => response.data.invoices || []
          );
          console.log('Combined invoices:', allInvoices);
          setInvoices(allInvoices);
        } else {
          console.log('No outlets found for merchant');
          setInvoices([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleEditMerchant = (merchant: any) => {
    setSelectedMerchant(merchant);
    setEditFormData({
      businessName: merchant.businessName || '',
      businessType: merchant.businessType || '',
      registrationNumber: merchant.registrationNumber || '',
      taxId: merchant.taxId || '',
      address: merchant.address || '',
      city: merchant.city || '',
      state: merchant.state || '',
      country: merchant.country || '',
      website: merchant.website || '',
      description: merchant.description || '',
    });
    setEditDialog(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateMerchant = async () => {
    if (!selectedMerchant) return;

    try {
      await dispatch(
        updateMerchant({ id: selectedMerchant.id, data: editFormData })
      ).unwrap();
      setEditDialog(false);
      setSelectedMerchant(null);
      setSnackbar({
        open: true,
        message: 'Merchant updated successfully',
        severity: 'success',
      });
      loadMerchants();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to update merchant',
        severity: 'error',
      });
    }
  };

  const handleCreateOutlet = () => {
    setOutletDialog(true);
  };

  const handleOutletFormChange = (field: string, value: string) => {
    setOutletFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateOutletSubmit = async () => {
    if (!selectedMerchant) return;

    try {
      // Filter out empty optional fields
      const outletData = {
        name: outletFormData.name,
        address: outletFormData.address,
        city: outletFormData.city,
        state: outletFormData.state,
        country: outletFormData.country,
        merchantId: selectedMerchant.id,
        ...(outletFormData.phone && { phone: outletFormData.phone }),
        ...(outletFormData.email && { email: outletFormData.email }),
        ...(outletFormData.description && {
          description: outletFormData.description,
        }),
      };

      await api.post('/outlets', outletData);

      setOutletDialog(false);
      setOutletFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        description: '',
      });
      setSnackbar({
        open: true,
        message: 'Outlet created successfully',
        severity: 'success',
      });
      loadMerchants();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to create outlet',
        severity: 'error',
      });
    }
  };

  const handleAllocateTerminal = () => {
    setTerminalDialog(true);
  };

  const handleTerminalFormChange = (field: string, value: string) => {
    setTerminalFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAllocateTerminalSubmit = async () => {
    if (!selectedMerchant) return;

    try {
      const terminalData = {
        outletId: terminalFormData.outletId,
        serialNumber: terminalFormData.serialNumber,
        model: terminalFormData.model,
        location: terminalFormData.location,
      };

      await api.post('/terminals', terminalData);

      setTerminalDialog(false);
      setTerminalFormData({
        outletId: '',
        serialNumber: '',
        model: '',
        location: '',
      });
      setSnackbar({
        open: true,
        message: 'Terminal allocated successfully',
        severity: 'success',
      });
      loadMerchants();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to allocate terminal',
        severity: 'error',
      });
    }
  };

  const handleCreateInvoice = () => {
    setInvoiceDialog(true);
  };

  const handleInvoiceFormChange = (field: string, value: string) => {
    setInvoiceFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateInvoiceSubmit = async () => {
    if (!selectedMerchant) return;

    try {
      const invoiceData = {
        outletId: invoiceFormData.outletId,
        terminalId: invoiceFormData.terminalId || null,
        amount: parseFloat(invoiceFormData.amount),
        currency: invoiceFormData.currency,
        description: invoiceFormData.description,
        dueDate: invoiceFormData.dueDate
          ? new Date(invoiceFormData.dueDate).toISOString()
          : null,
      };

      await api.post('/invoices', invoiceData);

      setInvoiceDialog(false);
      setInvoiceFormData({
        outletId: '',
        terminalId: '',
        amount: '',
        currency: 'NGN',
        description: '',
        dueDate: '',
      });
      setSnackbar({
        open: true,
        message: 'Invoice created successfully',
        severity: 'success',
      });
      loadMerchants();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to create invoice',
        severity: 'error',
      });
    }
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    merchant: any
  ) => {
    setActionMenu({
      anchorEl: event.currentTarget,
      merchant: merchant,
    });
  };

  const handleActionMenuClose = () => {
    setActionMenu({
      anchorEl: null,
      merchant: null,
    });
  };

  const handleMenuAction = (action: string, merchant: any) => {
    setSelectedMerchant(merchant);

    switch (action) {
      case 'view':
        handleViewMerchant(merchant);
        break;
      case 'edit':
        handleEditMerchant(merchant);
        break;
      case 'outlet':
        handleCreateOutlet();
        break;
      case 'terminal':
        handleAllocateTerminal();
        break;
      case 'invoice':
        handleCreateInvoice();
        break;
      case 'delete':
        setDeleteDialog(true);
        break;
    }

    handleActionMenuClose();
  };

  const handleCreateMerchant = async () => {
    try {
      // Create merchant with user data in a single API call
      const response = await api.post('/merchants/with-user', addFormData);

      setAddDialog(false);
      setAddFormData({
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
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
      setSnackbar({
        open: true,
        message: 'Merchant created successfully',
        severity: 'success',
      });
      loadMerchants();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to create merchant',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      case 'PENDING_VERIFICATION':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'EXPIRED':
        return 'error';
      case 'PARTIALLY_PAID':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const totalPages = Math.ceil(total / limit);

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
          Merchants Management
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAddMerchant}
        >
          Add Merchant
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <TextField
                fullWidth
                label='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Status</MenuItem>
                  <MenuItem value='ACTIVE'>Active</MenuItem>
                  <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  <MenuItem value='SUSPENDED'>Suspended</MenuItem>
                  <MenuItem value='PENDING_VERIFICATION'>Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Business Type</InputLabel>
                <Select
                  value={businessTypeFilter}
                  label='Business Type'
                  onChange={(e) => setBusinessTypeFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Types</MenuItem>
                  <MenuItem value='Retail'>Retail</MenuItem>
                  <MenuItem value='Restaurant'>Restaurant</MenuItem>
                  <MenuItem value='Healthcare'>Healthcare</MenuItem>
                  <MenuItem value='Education'>Education</MenuItem>
                  <MenuItem value='Professional Services'>
                    Professional Services
                  </MenuItem>
                  <MenuItem value='E-commerce'>E-commerce</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                variant='contained'
                onClick={handleSearch}
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Search'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Merchants Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Merchant</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Outlets</TableCell>
                <TableCell>Terminals</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : merchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    <Typography variant='body2' color='textSecondary'>
                      No merchants found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                merchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant='subtitle2' fontWeight='bold'>
                            {merchant.user.firstName} {merchant.user.lastName}
                          </Typography>
                          <Typography variant='body2' color='textSecondary'>
                            {merchant.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='subtitle2' fontWeight='bold'>
                          {merchant.businessName}
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                          {merchant.businessType}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5,
                          }}
                        >
                          <LocationIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant='caption' color='textSecondary'>
                            {merchant.city}, {merchant.state}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <EmailIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: 'text.secondary',
                            }}
                          />
                          <Typography variant='body2'>
                            {merchant.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={merchant.user.status}
                        color={getStatusColor(merchant.user.status) as any}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {merchant._count.outlets} outlets
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {merchant.outlets?.reduce(
                          (total, outlet) =>
                            total + ((outlet as any).terminals?.length || 0),
                          0
                        ) || 0}{' '}
                        terminals
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title='More Actions'>
                        <IconButton
                          size='small'
                          onClick={(e) => handleActionMenuOpen(e, merchant)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Merchant</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedMerchant?.businessName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteMerchant}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Merchant Dialog */}
      <Dialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Add New Merchant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Business Information */}
            <Typography variant='h6' sx={{ mb: 1 }}>
              Business Information
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Business Name'
                  value={addFormData.businessName}
                  onChange={(e) =>
                    handleAddFormChange('businessName', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={addFormData.businessType}
                    label='Business Type'
                    onChange={(e) =>
                      handleAddFormChange('businessType', e.target.value)
                    }
                  >
                    <MenuItem value='Retail'>Retail</MenuItem>
                    <MenuItem value='Restaurant'>Restaurant</MenuItem>
                    <MenuItem value='Healthcare'>Healthcare</MenuItem>
                    <MenuItem value='Education'>Education</MenuItem>
                    <MenuItem value='Professional Services'>
                      Professional Services
                    </MenuItem>
                    <MenuItem value='E-commerce'>E-commerce</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Registration Number'
                  value={addFormData.registrationNumber}
                  onChange={(e) =>
                    handleAddFormChange('registrationNumber', e.target.value)
                  }
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Tax ID'
                  value={addFormData.taxId}
                  onChange={(e) => handleAddFormChange('taxId', e.target.value)}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Address'
              value={addFormData.address}
              onChange={(e) => handleAddFormChange('address', e.target.value)}
              required
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='City'
                  value={addFormData.city}
                  onChange={(e) => handleAddFormChange('city', e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='State'
                  value={addFormData.state}
                  onChange={(e) => handleAddFormChange('state', e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Country'
                  value={addFormData.country}
                  onChange={(e) =>
                    handleAddFormChange('country', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Website'
                  value={addFormData.website}
                  onChange={(e) =>
                    handleAddFormChange('website', e.target.value)
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Description'
              value={addFormData.description}
              onChange={(e) =>
                handleAddFormChange('description', e.target.value)
              }
              multiline
              rows={3}
            />

            {/* User Information */}
            <Typography variant='h6' sx={{ mb: 1, mt: 2 }}>
              User Information
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='First Name'
                  value={addFormData.firstName}
                  onChange={(e) =>
                    handleAddFormChange('firstName', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Last Name'
                  value={addFormData.lastName}
                  onChange={(e) =>
                    handleAddFormChange('lastName', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={addFormData.email}
                  onChange={(e) => handleAddFormChange('email', e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  value={addFormData.password}
                  onChange={(e) =>
                    handleAddFormChange('password', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateMerchant}
            variant='contained'
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Merchant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Merchant Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon color='primary' />
            <Typography variant='h6'>
              {selectedMerchant?.businessName} - Merchant Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMerchant && (
            <Box sx={{ mt: 1 }}>
              {/* Overview Section - Always Visible */}
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}
              >
                {/* Business Information */}
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      Business Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Business Name
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.businessName}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Business Type
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.businessType}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Registration Number
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.registrationNumber ||
                            'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Tax ID
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.taxId || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Address
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.address}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          City
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.city}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          State
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.state}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Country
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.country}
                        </Typography>
                      </Box>
                      {selectedMerchant.website && (
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                          <Typography variant='subtitle2' color='textSecondary'>
                            Website
                          </Typography>
                          <Typography variant='body1'>
                            <a
                              href={selectedMerchant.website}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              {selectedMerchant.website}
                            </a>
                          </Typography>
                        </Box>
                      )}
                      {selectedMerchant.description && (
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                          <Typography variant='subtitle2' color='textSecondary'>
                            Description
                          </Typography>
                          <Typography variant='body1'>
                            {selectedMerchant.description}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      User Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Full Name
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.user.firstName}{' '}
                          {selectedMerchant.user.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Email
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Status
                        </Typography>
                        <Chip
                          label={selectedMerchant.user.status}
                          color={getStatusColor(selectedMerchant.user.status)}
                          size='small'
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Last Login
                        </Typography>
                        <Typography variant='body1'>
                          {selectedMerchant.user.lastLoginAt
                            ? new Date(
                                selectedMerchant.user.lastLoginAt
                              ).toLocaleDateString()
                            : 'Never'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Total Outlets
                        </Typography>
                        <Typography variant='h6'>
                          {selectedMerchant._count.outlets}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Total Terminals
                        </Typography>
                        <Typography variant='h6'>
                          {selectedMerchant.outlets?.reduce(
                            (total: number, outlet: any) =>
                              total + (outlet.terminals?.length || 0),
                            0
                          ) || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                        <Typography variant='subtitle2' color='textSecondary'>
                          Total Payouts
                        </Typography>
                        <Typography variant='h6'>
                          {selectedMerchant._count.payouts}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Tabs Section */}
              <Tabs
                value={merchantDialogTab}
                onChange={handleTabChange}
                aria-label='merchant details tabs'
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label={`Outlets (${selectedMerchant._count.outlets})`} />
                <Tab
                  label={`Terminals (${
                    selectedMerchant.outlets?.reduce(
                      (total: number, outlet: any) =>
                        total + (outlet.terminals?.length || 0),
                      0
                    ) || 0
                  })`}
                />
                <Tab label='Invoices' />
              </Tabs>

              {/* Outlets Tab */}
              {merchantDialogTab === 0 && (
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      Outlets ({selectedMerchant._count.outlets})
                    </Typography>
                    {selectedMerchant.outlets &&
                    selectedMerchant.outlets.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Address</TableCell>
                              <TableCell>Contact</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Terminals</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedMerchant.outlets.map((outlet: any) => (
                              <TableRow key={outlet.id}>
                                <TableCell>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {outlet.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2'>
                                    {outlet.address}, {outlet.city},{' '}
                                    {outlet.state}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5,
                                    }}
                                  >
                                    {outlet.phone && (
                                      <Typography
                                        variant='body2'
                                        color='textSecondary'
                                      >
                                        📞 {outlet.phone}
                                      </Typography>
                                    )}
                                    {outlet.email && (
                                      <Typography
                                        variant='body2'
                                        color='textSecondary'
                                      >
                                        ✉️ {outlet.email}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      outlet.isActive ? 'Active' : 'Inactive'
                                    }
                                    color={
                                      outlet.isActive ? 'success' : 'default'
                                    }
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2'>
                                    {outlet.terminals?.length || 0} terminals
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant='body2' color='textSecondary'>
                        No outlets created yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Terminals Tab */}
              {merchantDialogTab === 1 && (
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      Terminals (
                      {selectedMerchant.outlets?.reduce(
                        (total: number, outlet: any) =>
                          total + (outlet.terminals?.length || 0),
                        0
                      ) || 0}
                      )
                    </Typography>
                    {selectedMerchant.outlets &&
                    selectedMerchant.outlets.some(
                      (outlet: any) =>
                        outlet.terminals && outlet.terminals.length > 0
                    ) ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Serial Number</TableCell>
                              <TableCell>Outlet</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Online Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedMerchant.outlets.map(
                              (outlet: any) =>
                                outlet.terminals &&
                                outlet.terminals.map((terminal: any) => (
                                  <TableRow key={terminal.id}>
                                    <TableCell>
                                      <Typography
                                        variant='subtitle2'
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        {terminal.serialNumber}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant='body2'>
                                        {outlet.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant='body2'>
                                        {terminal.location ||
                                          'No location specified'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={terminal.status}
                                        color={
                                          terminal.status === 'ACTIVE'
                                            ? 'success'
                                            : 'default'
                                        }
                                        size='small'
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={
                                          terminal.isOnline
                                            ? 'Online'
                                            : 'Offline'
                                        }
                                        color={
                                          terminal.isOnline
                                            ? 'success'
                                            : 'error'
                                        }
                                        size='small'
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant='body2' color='textSecondary'>
                        No terminals allocated yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Invoices Tab */}
              {merchantDialogTab === 2 && (
                <Card>
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{ mb: 2, color: 'primary.main' }}
                    >
                      Invoices ({invoices.length})
                    </Typography>
                    {invoicesLoading ? (
                      <Box
                        sx={{ display: 'flex', justifyContent: 'center', p: 3 }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : invoices.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Invoice Number</TableCell>
                              <TableCell>Customer</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Outlet</TableCell>
                              <TableCell>Created</TableCell>
                              <TableCell>Due Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {invoices.map((invoice: any) => (
                              <TableRow key={invoice.id}>
                                <TableCell>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {invoice.invoiceNumber}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5,
                                    }}
                                  >
                                    {invoice.customerName && (
                                      <Typography
                                        variant='body2'
                                        sx={{ fontWeight: 'bold' }}
                                      >
                                        {invoice.customerName}
                                      </Typography>
                                    )}
                                    {invoice.customerEmail && (
                                      <Typography
                                        variant='body2'
                                        color='textSecondary'
                                      >
                                        ✉️ {invoice.customerEmail}
                                      </Typography>
                                    )}
                                    {invoice.customerPhone && (
                                      <Typography
                                        variant='body2'
                                        color='textSecondary'
                                      >
                                        📞 {invoice.customerPhone}
                                      </Typography>
                                    )}
                                    {!invoice.customerName &&
                                      !invoice.customerEmail &&
                                      !invoice.customerPhone && (
                                        <Typography
                                          variant='body2'
                                          color='textSecondary'
                                        >
                                          No customer info
                                        </Typography>
                                      )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant='body2'
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {formatCurrency(parseFloat(invoice.amount))}
                                  </Typography>
                                  {invoice.fee > 0 && (
                                    <Typography
                                      variant='caption'
                                      color='textSecondary'
                                    >
                                      Fee:{' '}
                                      {formatCurrency(parseFloat(invoice.fee))}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={invoice.status}
                                    color={getInvoiceStatusColor(
                                      invoice.status
                                    )}
                                    size='small'
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2'>
                                    {invoice.outlet?.name || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2'>
                                    {new Date(
                                      invoice.createdAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2'>
                                    {invoice.dueDate
                                      ? new Date(
                                          invoice.dueDate
                                        ).toLocaleDateString()
                                      : 'No due date'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant='body2' color='textSecondary'>
                        No invoices found for this merchant
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Merchant Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Edit Merchant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Business Name'
                  value={editFormData.businessName}
                  onChange={(e) =>
                    handleEditFormChange('businessName', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={editFormData.businessType}
                    label='Business Type'
                    onChange={(e) =>
                      handleEditFormChange('businessType', e.target.value)
                    }
                  >
                    <MenuItem value='Retail'>Retail</MenuItem>
                    <MenuItem value='Restaurant'>Restaurant</MenuItem>
                    <MenuItem value='Healthcare'>Healthcare</MenuItem>
                    <MenuItem value='Education'>Education</MenuItem>
                    <MenuItem value='Professional Services'>
                      Professional Services
                    </MenuItem>
                    <MenuItem value='E-commerce'>E-commerce</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Registration Number'
                  value={editFormData.registrationNumber}
                  onChange={(e) =>
                    handleEditFormChange('registrationNumber', e.target.value)
                  }
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Tax ID'
                  value={editFormData.taxId}
                  onChange={(e) =>
                    handleEditFormChange('taxId', e.target.value)
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Address'
              value={editFormData.address}
              onChange={(e) => handleEditFormChange('address', e.target.value)}
              required
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='City'
                  value={editFormData.city}
                  onChange={(e) => handleEditFormChange('city', e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='State'
                  value={editFormData.state}
                  onChange={(e) =>
                    handleEditFormChange('state', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Country'
                  value={editFormData.country}
                  onChange={(e) =>
                    handleEditFormChange('country', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Website'
                  value={editFormData.website}
                  onChange={(e) =>
                    handleEditFormChange('website', e.target.value)
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Description'
              value={editFormData.description}
              onChange={(e) =>
                handleEditFormChange('description', e.target.value)
              }
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateMerchant}
            variant='contained'
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Update Merchant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Outlet Dialog */}
      <Dialog
        open={outletDialog}
        onClose={() => setOutletDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Create New Outlet</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Outlet Name'
                  value={outletFormData.name}
                  onChange={(e) =>
                    handleOutletFormChange('name', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Phone'
                  value={outletFormData.phone}
                  onChange={(e) =>
                    handleOutletFormChange('phone', e.target.value)
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Address'
              value={outletFormData.address}
              onChange={(e) =>
                handleOutletFormChange('address', e.target.value)
              }
              required
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='City'
                  value={outletFormData.city}
                  onChange={(e) =>
                    handleOutletFormChange('city', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='State'
                  value={outletFormData.state}
                  onChange={(e) =>
                    handleOutletFormChange('state', e.target.value)
                  }
                  required
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Country'
                  value={outletFormData.country}
                  onChange={(e) =>
                    handleOutletFormChange('country', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={outletFormData.email}
                  onChange={(e) =>
                    handleOutletFormChange('email', e.target.value)
                  }
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label='Description'
              value={outletFormData.description}
              onChange={(e) =>
                handleOutletFormChange('description', e.target.value)
              }
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOutletDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateOutletSubmit}
            variant='contained'
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Outlet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Terminal Dialog */}
      <Dialog
        open={terminalDialog}
        onClose={() => setTerminalDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Allocate Terminal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Select Outlet</InputLabel>
                  <Select
                    value={terminalFormData.outletId}
                    label='Select Outlet'
                    onChange={(e) =>
                      handleTerminalFormChange('outletId', e.target.value)
                    }
                  >
                    {selectedMerchant?.outlets?.map((outlet: any) => (
                      <MenuItem key={outlet.id} value={outlet.id}>
                        {outlet.name} - {outlet.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Serial Number'
                  value={terminalFormData.serialNumber}
                  onChange={(e) =>
                    handleTerminalFormChange('serialNumber', e.target.value)
                  }
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Model'
                  value={terminalFormData.model}
                  onChange={(e) =>
                    handleTerminalFormChange('model', e.target.value)
                  }
                  required
                  placeholder='e.g., Paystack Terminal Pro'
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Location'
                  value={terminalFormData.location}
                  onChange={(e) =>
                    handleTerminalFormChange('location', e.target.value)
                  }
                  placeholder='e.g., Front Desk, Counter 1'
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminalDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAllocateTerminalSubmit}
            variant='contained'
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Allocate Terminal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog
        open={invoiceDialog}
        onClose={() => setInvoiceDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Select Outlet</InputLabel>
                  <Select
                    value={invoiceFormData.outletId}
                    label='Select Outlet'
                    onChange={(e) =>
                      handleInvoiceFormChange('outletId', e.target.value)
                    }
                  >
                    {selectedMerchant?.outlets?.map((outlet: any) => (
                      <MenuItem key={outlet.id} value={outlet.id}>
                        {outlet.name} - {outlet.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Select Terminal (Optional)</InputLabel>
                  <Select
                    value={invoiceFormData.terminalId}
                    label='Select Terminal (Optional)'
                    onChange={(e) =>
                      handleInvoiceFormChange('terminalId', e.target.value)
                    }
                  >
                    <MenuItem value=''>
                      <em>No Terminal Selected</em>
                    </MenuItem>
                    {selectedMerchant?.outlets
                      ?.find(
                        (outlet: any) => outlet.id === invoiceFormData.outletId
                      )
                      ?.terminals?.map((terminal: any) => (
                        <MenuItem key={terminal.id} value={terminal.id}>
                          {terminal.serialNumber} -{' '}
                          {terminal.location || 'No Location'}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Amount'
                  type='number'
                  value={invoiceFormData.amount}
                  onChange={(e) =>
                    handleInvoiceFormChange('amount', e.target.value)
                  }
                  required
                  placeholder='0.00'
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={invoiceFormData.currency}
                    label='Currency'
                    onChange={(e) =>
                      handleInvoiceFormChange('currency', e.target.value)
                    }
                  >
                    <MenuItem value='NGN'>NGN - Nigerian Naira</MenuItem>
                    <MenuItem value='USD'>USD - US Dollar</MenuItem>
                    <MenuItem value='EUR'>EUR - Euro</MenuItem>
                    <MenuItem value='GBP'>GBP - British Pound</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Description'
                  value={invoiceFormData.description}
                  onChange={(e) =>
                    handleInvoiceFormChange('description', e.target.value)
                  }
                  placeholder='Invoice description or notes'
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label='Due Date'
                  type='datetime-local'
                  value={invoiceFormData.dueDate}
                  onChange={(e) =>
                    handleInvoiceFormChange('dueDate', e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateInvoiceSubmit}
            variant='contained'
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view', actionMenu.merchant)}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit', actionMenu.merchant)}>
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit Merchant</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('outlet', actionMenu.merchant)}
        >
          <ListItemIcon>
            <AddBusinessIcon fontSize='small' color='primary' />
          </ListItemIcon>
          <ListItemText>Create Outlet</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('terminal', actionMenu.merchant)}
        >
          <ListItemIcon>
            <AssignmentIcon fontSize='small' color='secondary' />
          </ListItemIcon>
          <ListItemText>Allocate Terminal</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('invoice', actionMenu.merchant)}
        >
          <ListItemIcon>
            <ReceiptIcon fontSize='small' color='primary' />
          </ListItemIcon>
          <ListItemText>Create Invoice</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction('delete', actionMenu.merchant)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>Delete Merchant</ListItemText>
        </MenuItem>
      </Menu>

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

export default MerchantsPage;
