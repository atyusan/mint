import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Store as StoreIcon,
  AddCard as AddCardIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';
import api from '@/api/api';

interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  merchant: {
    id: string;
    businessName: string;
  };
  _count?: {
    terminals: number;
    invoices: number;
  };
}

const TERMINAL_MODELS = [
  'Paystack Terminal Pro',
  'Paystack Terminal Lite',
  'Paystack Terminal Mini',
  'Pro 2',
] as const;

const OutletsPage: React.FC = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [terminalRequestDialogOpen, setTerminalRequestDialogOpen] =
    useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    phone: '',
    email: '',
    merchantId: '',
  });

  const [terminalRequestData, setTerminalRequestData] = useState({
    model: '',
    location: '',
    quantity: '1',
  });

  const [filterState, setFilterState] = useState({
    search: '',
    city: '',
    state: '',
    isActive: '',
  });

  const [merchants, setMerchants] = useState<any[]>([]);
  const [outletTerminals, setOutletTerminals] = useState<any[]>([]);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [terminalRequests, setTerminalRequests] = useState<any[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    loadOutlets();
    loadMerchants();
  }, [filterState]);

  const loadOutlets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterState.search) params.append('search', filterState.search);
      if (filterState.city) params.append('city', filterState.city);
      if (filterState.state) params.append('state', filterState.state);
      if (filterState.isActive) params.append('isActive', filterState.isActive);

      const response = await api.get(`/outlets?${params.toString()}`);
      console.log('Outlets response:', response.data);
      // Backend returns { outlets: [...], total, page, limit }
      setOutlets(response.data.outlets || []);
    } catch (error: any) {
      console.error('Failed to load outlets:', error);
      showSnackbar('Failed to load outlets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    try {
      const response = await api.get('/merchants?page=1&limit=100');
      setMerchants(response.data.data || []);
    } catch (error) {
      console.error('Failed to load merchants:', error);
    }
  };

  const handleAddOutlet = () => {
    setSelectedOutlet(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      phone: '',
      email: '',
      merchantId: '',
    });
    setDialogOpen(true);
  };

  const handleEditOutlet = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      city: outlet.city,
      state: outlet.state,
      country: outlet.country,
      phone: outlet.phone || '',
      email: outlet.email || '',
      merchantId: outlet.merchant.id,
    });
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteOutlet = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleViewDetails = async () => {
    setViewDetailsDialogOpen(true);
    setAnchorEl(null);

    if (selectedOutlet) {
      await Promise.all([
        loadOutletTerminals(selectedOutlet.id),
        loadTerminalRequests(selectedOutlet.id),
      ]);
    }
  };

  const loadOutletTerminals = async (outletId: string) => {
    setLoadingTerminals(true);
    try {
      const response = await api.get(`/terminals?outletId=${outletId}`);
      setOutletTerminals(response.data.terminals || []);
    } catch (error) {
      console.error('Failed to load terminals:', error);
      setOutletTerminals([]);
    } finally {
      setLoadingTerminals(false);
    }
  };

  const loadTerminalRequests = async (outletId: string) => {
    try {
      const response = await api.get(`/terminal-requests?outletId=${outletId}`);
      const requests = response.data.terminalRequests || [];

      setTerminalRequests(requests);
    } catch (error) {
      console.error('Failed to load terminal requests:', error);
      setTerminalRequests([]);
    }
  };

  const handleRequestTerminal = () => {
    setTerminalRequestDialogOpen(true);
    setAnchorEl(null);
  };

  const handleTerminalRequestSubmit = async () => {
    if (!selectedOutlet) return;

    setSubmittingRequest(true);
    try {
      // Create a terminal request
      await api.post('/terminal-requests', {
        outletId: selectedOutlet.id,
        merchantId: selectedOutlet.merchant.id,
        quantity: parseInt(terminalRequestData.quantity),
        model: terminalRequestData.model,
        location: terminalRequestData.location || undefined,
      });

      showSnackbar(
        `Successfully requested ${terminalRequestData.quantity} terminal(s). Awaiting approval.`,
        'success'
      );
      setTerminalRequestDialogOpen(false);
      setTerminalRequestData({ model: '', location: '', quantity: '1' });

      // Reload terminal requests if view details dialog is open
      if (viewDetailsDialogOpen) {
        await loadTerminalRequests(selectedOutlet.id);
      }
    } catch (error: any) {
      console.error('Failed to request terminal:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to request terminal',
        'error'
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const confirmDeleteOutlet = async () => {
    if (!selectedOutlet) return;

    try {
      await api.delete(`/outlets/${selectedOutlet.id}`);
      showSnackbar('Outlet deleted successfully', 'success');
      loadOutlets();
      setDeleteDialogOpen(false);
      setSelectedOutlet(null);
    } catch (error: any) {
      console.error('Failed to delete outlet:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to delete outlet',
        'error'
      );
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedOutlet) {
        await api.put(`/outlets/${selectedOutlet.id}`, formData);
        showSnackbar('Outlet updated successfully', 'success');
      } else {
        await api.post('/outlets', formData);
        showSnackbar('Outlet created successfully', 'success');
      }
      setDialogOpen(false);
      loadOutlets();
    } catch (error: any) {
      console.error('Failed to save outlet:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to save outlet',
        'error'
      );
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    outlet: Outlet
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOutlet(outlet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StoreIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h4'>Outlets Management</Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAddOutlet}
        >
          Add Outlet
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label='Search'
            size='small'
            value={filterState.search}
            onChange={(e) =>
              setFilterState({ ...filterState, search: e.target.value })
            }
            sx={{ minWidth: 200 }}
          />
          <TextField
            label='City'
            size='small'
            value={filterState.city}
            onChange={(e) =>
              setFilterState({ ...filterState, city: e.target.value })
            }
          />
          <TextField
            label='State'
            size='small'
            value={filterState.state}
            onChange={(e) =>
              setFilterState({ ...filterState, state: e.target.value })
            }
          />
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterState.isActive}
              label='Status'
              onChange={(e) =>
                setFilterState({ ...filterState, isActive: e.target.value })
              }
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='true'>Active</MenuItem>
              <MenuItem value='false'>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Outlets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City, State</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Terminals</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : outlets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  No outlets found
                </TableCell>
              </TableRow>
            ) : (
              outlets.map((outlet) => (
                <TableRow key={outlet.id}>
                  <TableCell>{outlet.name}</TableCell>
                  <TableCell>{outlet.address}</TableCell>
                  <TableCell>
                    {outlet.city}, {outlet.state}
                  </TableCell>
                  <TableCell>
                    {outlet.phone && <div>📞 {outlet.phone}</div>}
                    {outlet.email && <div>✉️ {outlet.email}</div>}
                  </TableCell>
                  <TableCell>{outlet.merchant.businessName}</TableCell>
                  <TableCell>{outlet._count?.terminals || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={outlet.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(outlet.isActive)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      size='small'
                      onClick={(e) => handleMenuClick(e, outlet)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {selectedOutlet ? 'Edit Outlet' : 'Add New Outlet'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Outlet Name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label='Address'
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              fullWidth
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='City'
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label='State'
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
                fullWidth
              />
            </Box>
            <TextField
              label='Country'
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label='Phone'
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              fullWidth
            />
            <TextField
              label='Email'
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Merchant</InputLabel>
              <Select
                value={formData.merchantId}
                label='Merchant'
                onChange={(e) =>
                  setFormData({ ...formData, merchantId: e.target.value })
                }
                required
              >
                {merchants.map((merchant) => (
                  <MenuItem key={merchant.id} value={merchant.id}>
                    {merchant.businessName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={
              !formData.name ||
              !formData.address ||
              !formData.city ||
              !formData.state ||
              !formData.country ||
              !formData.merchantId
            }
          >
            {selectedOutlet ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Outlet</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedOutlet?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteOutlet}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsDialogOpen}
        onClose={() => setViewDetailsDialogOpen(false)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StoreIcon color='primary' />
            <Typography variant='h6'>{selectedOutlet?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOutlet && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
                Outlet Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Name
                  </Typography>
                  <Typography variant='body1'>{selectedOutlet.name}</Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Address
                  </Typography>
                  <Typography variant='body1'>
                    {selectedOutlet.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      City
                    </Typography>
                    <Typography variant='body1'>
                      {selectedOutlet.city}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      State
                    </Typography>
                    <Typography variant='body1'>
                      {selectedOutlet.state}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Country
                    </Typography>
                    <Typography variant='body1'>
                      {selectedOutlet.country}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Contact Information
                  </Typography>
                  {selectedOutlet.phone && (
                    <Typography variant='body1'>
                      📞 {selectedOutlet.phone}
                    </Typography>
                  )}
                  {selectedOutlet.email && (
                    <Typography variant='body1'>
                      ✉️ {selectedOutlet.email}
                    </Typography>
                  )}
                  {!selectedOutlet.phone && !selectedOutlet.email && (
                    <Typography variant='body2' color='textSecondary'>
                      No contact information
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Merchant
                  </Typography>
                  <Typography variant='body1'>
                    {selectedOutlet.merchant.businessName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Status
                  </Typography>
                  <Chip
                    label={selectedOutlet.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(selectedOutlet.isActive)}
                    size='small'
                  />
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='textSecondary'>
                    Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Paper sx={{ p: 2, flex: 1 }}>
                      <Typography variant='h6'>
                        {selectedOutlet._count?.terminals || 0}
                      </Typography>
                      <Typography variant='caption' color='textSecondary'>
                        Terminals
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, flex: 1 }}>
                      <Typography variant='h6'>
                        {selectedOutlet._count?.invoices || 0}
                      </Typography>
                      <Typography variant='caption' color='textSecondary'>
                        Invoices
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* Terminals Section */}
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ mb: 2, color: 'primary.main' }}
                  >
                    <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Terminals ({outletTerminals.length})
                  </Typography>
                  {loadingTerminals ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', p: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : outletTerminals.length === 0 ? (
                    <Typography variant='body2' color='textSecondary'>
                      No terminals assigned to this outlet
                    </Typography>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Serial Number</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Online</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {outletTerminals.map((terminal: any) => (
                            <TableRow key={terminal.id}>
                              <TableCell>
                                <Typography
                                  variant='body2'
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {terminal.serialNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {terminal.model}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {terminal.location || 'Not specified'}
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
                                    terminal.isOnline ? 'Online' : 'Offline'
                                  }
                                  color={
                                    terminal.isOnline ? 'success' : 'error'
                                  }
                                  size='small'
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

                {/* Terminal Requests Section */}
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ mb: 2, color: 'primary.main' }}
                  >
                    <AddCardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Terminal Requests ({terminalRequests.length})
                  </Typography>
                  {terminalRequests.length === 0 ? (
                    <Typography variant='body2' color='textSecondary'>
                      No terminal requests found for this outlet
                    </Typography>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Model</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Requested</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {terminalRequests.map((request: any) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <Typography
                                  variant='body2'
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {request.model}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {request.quantity}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {request.location || 'Not specified'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={request.status}
                                  color={
                                    request.status === 'FULFILLED'
                                      ? 'success'
                                      : request.status === 'REJECTED'
                                      ? 'error'
                                      : request.status === 'APPROVED'
                                      ? 'info'
                                      : 'warning'
                                  }
                                  size='small'
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='textSecondary'
                                >
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Terminal Request Dialog */}
      <Dialog
        open={terminalRequestDialogOpen}
        onClose={() => setTerminalRequestDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Request Terminal for {selectedOutlet?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Terminal Model</InputLabel>
              <Select
                value={terminalRequestData.model}
                label='Terminal Model'
                onChange={(e) =>
                  setTerminalRequestData({
                    ...terminalRequestData,
                    model: e.target.value,
                  })
                }
                required
              >
                {TERMINAL_MODELS.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label='Location'
              value={terminalRequestData.location}
              onChange={(e) =>
                setTerminalRequestData({
                  ...terminalRequestData,
                  location: e.target.value,
                })
              }
              placeholder='e.g., Main Counter, Entrance, etc.'
              fullWidth
            />
            <TextField
              label='Quantity'
              type='number'
              value={terminalRequestData.quantity}
              onChange={(e) =>
                setTerminalRequestData({
                  ...terminalRequestData,
                  quantity: e.target.value,
                })
              }
              inputProps={{ min: 1, max: 10 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminalRequestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTerminalRequestSubmit}
            variant='contained'
            disabled={!terminalRequestData.model || submittingRequest}
            startIcon={
              submittingRequest ? <CircularProgress size={20} /> : null
            }
          >
            {submittingRequest ? 'Submitting...' : 'Request Terminal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditOutlet(selectedOutlet!)}>
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRequestTerminal}>
          <ListItemIcon>
            <AddCardIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Request Terminal</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteOutlet}>
          <ListItemIcon>
            <DeleteIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OutletsPage;
