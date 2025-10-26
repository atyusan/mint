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
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Pending as PendingIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Power as PowerIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import api from '@/api/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`terminals-tabpanel-${index}`}
      aria-labelledby={`terminals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TerminalsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [terminalRequests, setTerminalRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [terminalModels, setTerminalModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterModel, setFilterModel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [terminalMenuAnchor, setTerminalMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [requestMenuAnchor, setRequestMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [inventoryMenuAnchor, setInventoryMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [modelMenuAnchor, setModelMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  // Terminal Request Dialog States
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    model: '',
    location: '',
    quantity: '1',
  });

  // Inventory Dialog States
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [isInventoryEditMode, setIsInventoryEditMode] = useState(false);
  const [inventoryFormData, setInventoryFormData] = useState({
    serialNumber: '',
    model: '',
    supplier: '',
    cost: '',
  });

  // Delete Confirmation Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Approval Confirmation Dialog State
  const [approvalConfirmOpen, setApprovalConfirmOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<any>(null);
  const [availableInventory, setAvailableInventory] = useState<any[]>([]);
  const [checkingInventory, setCheckingInventory] = useState(false);

  // Reject Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // View Details Dialog State
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [terminalDetails, setTerminalDetails] = useState<any>(null);
  const [viewTerminalDetailsOpen, setViewTerminalDetailsOpen] = useState(false);

  // Update Terminal Dialog State
  const [updateTerminalDialogOpen, setUpdateTerminalDialogOpen] =
    useState(false);
  const [editingTerminalId, setEditingTerminalId] = useState<string | null>(
    null
  );
  const [terminalFormData, setTerminalFormData] = useState({
    status: '',
    location: '',
    batteryLevel: '',
    firmwareVersion: '',
  });

  // Model Dialog States
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [isModelEditMode, setIsModelEditMode] = useState(false);
  const [modelFormData, setModelFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    loadData();
    loadTerminalModels(); // Load terminal models on mount
  }, [tabValue]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        await loadTerminals();
      } else if (tabValue === 1) {
        await loadTerminalRequests();
      } else if (tabValue === 2) {
        await loadInventory();
      } else if (tabValue === 3) {
        await loadTerminalModels();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTerminals = async () => {
    try {
      const response = await api.get('/terminals?page=1&limit=100');
      setTerminals(response.data.terminals || []);
    } catch (error) {
      console.error('Failed to load terminals:', error);
      showSnackbar('Failed to load terminals', 'error');
    }
  };

  const loadTerminalRequests = async () => {
    try {
      const response = await api.get('/terminal-requests?page=1&limit=100');
      setTerminalRequests(response.data.terminalRequests || []);
    } catch (error) {
      console.error('Failed to load terminal requests:', error);
      showSnackbar('Failed to load terminal requests', 'error');
    }
  };

  const loadInventory = async () => {
    try {
      const response = await api.get('/terminal-inventory?page=1&limit=100');
      setInventory(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      showSnackbar('Failed to load inventory', 'error');
    }
  };

  const loadTerminalModels = async () => {
    try {
      const response = await api.get('/terminal-models');
      setTerminalModels(response.data || []);
    } catch (error) {
      console.error('Failed to load terminal models:', error);
      showSnackbar('Failed to load terminal models', 'error');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRequestSubmit = async () => {
    try {
      // For now, just show a message
      showSnackbar('Please use the outlets page to request terminals', 'info');
      setRequestDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to submit request',
        'error'
      );
    }
  };

  const handleInventorySubmit = async () => {
    try {
      console.log('Submit mode:', isInventoryEditMode ? 'EDIT' : 'CREATE');
      console.log('Selected inventory:', selectedInventory);
      console.log('Form data:', inventoryFormData);

      if (isInventoryEditMode && selectedInventory) {
        // Update existing inventory - ONLY send supplier and cost
        const payload = {
          supplier: inventoryFormData.supplier,
          cost: inventoryFormData.cost
            ? parseFloat(inventoryFormData.cost)
            : undefined,
        };

        console.log('Updating inventory with payload:', payload);
        await api.patch(`/terminal-inventory/${selectedInventory.id}`, payload);
        showSnackbar('Inventory updated successfully', 'success');
      } else if (!isInventoryEditMode && !selectedInventory) {
        // Create new inventory
        const createPayload = {
          serialNumber: inventoryFormData.serialNumber,
          modelId: inventoryFormData.model,
          supplier: inventoryFormData.supplier,
          cost: inventoryFormData.cost
            ? parseFloat(inventoryFormData.cost)
            : undefined,
        };

        console.log('Creating inventory:', createPayload);
        await api.post('/terminal-inventory', createPayload);
        showSnackbar('Terminal added to inventory successfully', 'success');
      }

      setInventoryDialogOpen(false);
      setIsInventoryEditMode(false);
      setInventoryFormData({
        serialNumber: '',
        model: '',
        supplier: '',
        cost: '',
      });
      await loadInventory();
    } catch (error: any) {
      console.error('Failed to save inventory:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to save inventory',
        'error'
      );
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'FULFILLED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'APPROVED':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'success';
      case 'ALLOCATED':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'RETIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTerminalStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'MAINTENANCE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Terminal actions
  const handleTerminalMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    terminal: any
  ) => {
    event.stopPropagation();
    setTerminalMenuAnchor(event.currentTarget);
    setSelectedTerminal(terminal);
  };

  const handleTerminalMenuClose = () => {
    setTerminalMenuAnchor(null);
    setSelectedTerminal(null);
  };

  const handleViewTerminalDetails = async () => {
    if (!selectedTerminal) return;

    try {
      const response = await api.get(`/terminals/${selectedTerminal.id}`);
      setTerminalDetails(response.data);
      setViewTerminalDetailsOpen(true);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to load terminal details',
        'error'
      );
    }
    handleTerminalMenuClose();
  };

  const handleUpdateTerminal = () => {
    if (!selectedTerminal) return;

    // Save the terminal ID for later use
    const terminalId = selectedTerminal.id;

    // Set form data to selected terminal
    setTerminalFormData({
      status: selectedTerminal.status || '',
      location: selectedTerminal.location || '',
      batteryLevel: selectedTerminal.batteryLevel?.toString() || '',
      firmwareVersion: selectedTerminal.firmwareVersion || '',
    });

    // Store the terminal ID
    setEditingTerminalId(terminalId);

    // Close the menu
    handleTerminalMenuClose();

    // Open the dialog
    setUpdateTerminalDialogOpen(true);
  };

  const handleTerminalUpdateSubmit = async () => {
    if (!editingTerminalId) return;

    try {
      const payload: any = {};

      if (terminalFormData.status) payload.status = terminalFormData.status;
      if (terminalFormData.location)
        payload.location = terminalFormData.location;
      if (terminalFormData.batteryLevel)
        payload.batteryLevel = parseInt(terminalFormData.batteryLevel);
      if (terminalFormData.firmwareVersion)
        payload.firmwareVersion = terminalFormData.firmwareVersion;

      // Check if payload is empty
      if (Object.keys(payload).length === 0) {
        showSnackbar('Please update at least one field', 'warning');
        return;
      }

      console.log('Updating terminal with payload:', payload);
      await api.patch(`/terminals/${editingTerminalId}`, payload);
      showSnackbar('Terminal updated successfully', 'success');
      await loadTerminals();
      setUpdateTerminalDialogOpen(false);
      setEditingTerminalId(null);
      setTerminalFormData({
        status: '',
        location: '',
        batteryLevel: '',
        firmwareVersion: '',
      });
    } catch (error: any) {
      console.error('Failed to update terminal:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to update terminal',
        'error'
      );
    }
  };

  // Terminal Request actions
  const handleRequestMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    request: any
  ) => {
    event.stopPropagation();
    setRequestMenuAnchor(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleRequestMenuClose = () => {
    setRequestMenuAnchor(null);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setCheckingInventory(true);

    try {
      // Check inventory availability for the requested model
      const response = await api.get(
        `/terminal-inventory/available/${encodeURIComponent(
          selectedRequest.model
        )}`
      );

      const available = response.data.available || 0;

      if (available < selectedRequest.quantity) {
        showSnackbar(
          `Insufficient inventory. Available: ${available}, Requested: ${selectedRequest.quantity}`,
          'error'
        );
        handleRequestMenuClose();
        return;
      }

      // Get the actual inventory items for display
      const inventoryResponse = await api.get(
        `/terminal-inventory?model=${encodeURIComponent(
          selectedRequest.model
        )}&status=IN_STOCK&limit=${selectedRequest.quantity}`
      );

      setAvailableInventory(inventoryResponse.data.data || []);
      setRequestToApprove(selectedRequest);
      setApprovalConfirmOpen(true);
      handleRequestMenuClose();
    } catch (error: any) {
      console.error('Failed to check inventory:', error);
      showSnackbar(
        error.response?.data?.message ||
          'Failed to check inventory availability',
        'error'
      );
      handleRequestMenuClose();
    } finally {
      setCheckingInventory(false);
    }
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    setRequestToReject(selectedRequest);
    setRejectionReason('');
    setRejectDialogOpen(true);
    handleRequestMenuClose();
  };

  const confirmRejectRequest = async () => {
    if (!requestToReject) return;

    try {
      await api.post(`/terminal-requests/${requestToReject.id}/reject`, {
        reason: rejectionReason || 'Request rejected by admin',
      });
      showSnackbar('Request rejected successfully', 'success');
      await loadTerminalRequests();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to reject request',
        'error'
      );
    }
    setRejectDialogOpen(false);
    setRequestToReject(null);
    setRejectionReason('');
  };

  const handleViewRequestDetails = async () => {
    if (!selectedRequest) return;

    try {
      const response = await api.get(
        `/terminal-requests/${selectedRequest.id}`
      );
      setRequestDetails(response.data);
      setViewDetailsDialogOpen(true);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to load request details',
        'error'
      );
    }
    handleRequestMenuClose();
  };

  // Inventory actions
  const handleInventoryMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: any
  ) => {
    event.stopPropagation();
    setInventoryMenuAnchor(event.currentTarget);
    setSelectedInventory(item);
  };

  const handleInventoryMenuClose = () => {
    setInventoryMenuAnchor(null);
    setSelectedInventory(null);
  };

  const handleUpdateInventory = () => {
    if (!selectedInventory) return;
    // Set form data to selected inventory item
    setInventoryFormData({
      serialNumber: selectedInventory.serialNumber,
      model: selectedInventory.model,
      supplier: selectedInventory.supplier || '',
      cost: selectedInventory.cost ? selectedInventory.cost.toString() : '',
    });
    setIsInventoryEditMode(true);
    setInventoryDialogOpen(true);
    // Don't close menu yet - we need selectedInventory for submit
    setInventoryMenuAnchor(null);
  };

  const handleDeleteInventory = () => {
    if (!selectedInventory) return;

    // Prevent deletion of allocated terminals
    if (selectedInventory.status !== 'IN_STOCK') {
      showSnackbar(
        'Cannot delete allocated, in-maintenance, or retired terminals',
        'error'
      );
      handleInventoryMenuClose();
      return;
    }

    // Open delete confirmation dialog
    setItemToDelete(selectedInventory);
    setDeleteConfirmOpen(true);
    setInventoryMenuAnchor(null);
  };

  const confirmDeleteInventory = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/terminal-inventory/${itemToDelete.id}`);
      showSnackbar('Inventory item deleted successfully', 'success');
      await loadInventory();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to delete inventory',
        'error'
      );
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const confirmApproveRequest = async () => {
    if (!requestToApprove) return;

    try {
      await api.post(`/terminal-requests/${requestToApprove.id}/approve`);
      showSnackbar(
        'Request approved and terminals allocated successfully',
        'success'
      );
      await loadTerminalRequests();
      await loadTerminals(); // Refresh terminals list
      await loadInventory(); // Refresh inventory
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to approve request',
        'error'
      );
    }
    setApprovalConfirmOpen(false);
    setRequestToApprove(null);
    setAvailableInventory([]);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DevicesIcon color='primary' sx={{ fontSize: 40 }} />
          <Typography variant='h4'>Terminals Management</Typography>
        </Box>
        <Box>
          {tabValue === 1 && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setRequestDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Request Terminal
            </Button>
          )}
          {tabValue === 2 && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => {
                setIsInventoryEditMode(false);
                setInventoryFormData({
                  serialNumber: '',
                  model: '',
                  supplier: '',
                  cost: '',
                });
                setInventoryDialogOpen(true);
              }}
            >
              Add to Inventory
            </Button>
          )}
          {tabValue === 3 && (
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => {
                setIsModelEditMode(false);
                setModelFormData({
                  name: '',
                  code: '',
                  description: '',
                });
                setModelDialogOpen(true);
              }}
            >
              Add Model
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='terminals tabs'
        >
          <Tab icon={<DevicesIcon />} label='Terminals' iconPosition='start' />
          <Tab
            icon={<PendingIcon />}
            label='Terminal Requests'
            iconPosition='start'
          />
          <Tab
            icon={<InventoryIcon />}
            label='Inventory'
            iconPosition='start'
          />
          <Tab icon={<DevicesIcon />} label='Models' iconPosition='start' />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Terminals Tab */}
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              All Terminals ({terminals.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : terminals.length === 0 ? (
              <Typography variant='body2' color='textSecondary' align='center'>
                No terminals found
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Outlet</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Online</TableCell>
                      <TableCell>Battery</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {terminals.map((terminal: any) => (
                      <TableRow key={terminal.id}>
                        <TableCell>
                          <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {terminal.serialNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{terminal.model?.name || 'N/A'}</TableCell>
                        <TableCell>{terminal.outlet?.name || 'N/A'}</TableCell>
                        <TableCell>{terminal.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={terminal.status}
                            color={getTerminalStatusColor(terminal.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={terminal.isOnline ? 'Online' : 'Offline'}
                            color={terminal.isOnline ? 'success' : 'error'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          {terminal.batteryLevel !== null
                            ? `${terminal.batteryLevel}%`
                            : 'N/A'}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={(e) => handleTerminalMenuOpen(e, terminal)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Terminal Requests Tab */}
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Terminal Requests ({terminalRequests.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : terminalRequests.length === 0 ? (
              <Typography variant='body2' color='textSecondary' align='center'>
                No terminal requests found
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Outlet</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Merchant</TableCell>
                      <TableCell>Requested</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {terminalRequests.map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {request.model?.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell>{request.outlet?.name || 'N/A'}</TableCell>
                        <TableCell>{request.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getRequestStatusColor(request.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          {request.merchant?.businessName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={(e) => handleRequestMenuOpen(e, request)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Inventory Tab */}
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Terminal Inventory ({inventory.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : inventory.length === 0 ? (
              <Typography variant='body2' color='textSecondary' align='center'>
                No inventory items found
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Date Received</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {item.serialNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.model.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            color={getInventoryStatusColor(item.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{item.supplier || 'N/A'}</TableCell>
                        <TableCell>
                          {item.cost
                            ? `₦${parseFloat(item.cost).toLocaleString()}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.receivedDate
                            ? new Date(item.receivedDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={(e) => handleInventoryMenuOpen(e, item)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Models Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Terminal Models ({terminalModels.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : terminalModels.length === 0 ? (
              <Typography variant='body2' color='textSecondary' align='center'>
                No terminal models found
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align='center'>Terminals</TableCell>
                      <TableCell align='center'>Requests</TableCell>
                      <TableCell align='center'>Inventory</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {terminalModels.map((model: any) => (
                      <TableRow key={model.id}>
                        <TableCell>
                          <Typography
                            variant='subtitle2'
                            sx={{ fontWeight: 'bold' }}
                          >
                            {model.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{model.code || 'N/A'}</TableCell>
                        <TableCell>{model.description || 'N/A'}</TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={model._count?.terminals || 0}
                            color='primary'
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={model._count?.requests || 0}
                            color='warning'
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={model._count?.inventory || 0}
                            color='success'
                            size='small'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={model.isActive ? 'Active' : 'Inactive'}
                            color={model.isActive ? 'success' : 'error'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            onClick={(event) => {
                              event.stopPropagation();
                              setModelMenuAnchor(event.currentTarget);
                              setSelectedModel(model);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Model Actions Menu */}
      <Menu
        anchorEl={modelMenuAnchor}
        open={Boolean(modelMenuAnchor)}
        onClose={() => {
          setModelMenuAnchor(null);
          setSelectedModel(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (!selectedModel) return;
            setModelFormData({
              name: selectedModel.name,
              code: selectedModel.code || '',
              description: selectedModel.description || '',
            });
            setIsModelEditMode(true);
            setModelDialogOpen(true);
            setModelMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (!selectedModel) return;
            try {
              const newStatus = !selectedModel.isActive;
              await api.patch(`/terminal-models/${selectedModel.id}`, {
                isActive: newStatus,
              });
              showSnackbar(
                `Model ${newStatus ? 'activated' : 'deactivated'} successfully`,
                'success'
              );
              await loadTerminalModels();
            } catch (error: any) {
              showSnackbar(
                error.response?.data?.message || 'Failed to update model',
                'error'
              );
            }
            setModelMenuAnchor(null);
            setSelectedModel(null);
          }}
        >
          <ListItemIcon>
            <PowerIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>
            {selectedModel?.isActive ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Model Dialog */}
      <Dialog
        open={modelDialogOpen}
        onClose={() => {
          setModelDialogOpen(false);
          setIsModelEditMode(false);
          setSelectedModel(null);
          setModelFormData({
            name: '',
            code: '',
            description: '',
          });
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {isModelEditMode ? 'Edit Terminal Model' : 'Add Terminal Model'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Model Name'
              value={modelFormData.name}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label='Code (Optional)'
              value={modelFormData.code}
              onChange={(e) =>
                setModelFormData({ ...modelFormData, code: e.target.value })
              }
              fullWidth
              placeholder='e.g., PRO2'
            />
            <TextField
              label='Description (Optional)'
              value={modelFormData.description}
              onChange={(e) =>
                setModelFormData({
                  ...modelFormData,
                  description: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              placeholder='Enter model description...'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setModelDialogOpen(false);
              setIsModelEditMode(false);
              setSelectedModel(null);
              setModelFormData({
                name: '',
                code: '',
                description: '',
              });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (isModelEditMode && selectedModel) {
                  await api.patch(
                    `/terminal-models/${selectedModel.id}`,
                    modelFormData
                  );
                  showSnackbar('Model updated successfully', 'success');
                } else {
                  await api.post('/terminal-models', {
                    ...modelFormData,
                    isActive: true,
                  });
                  showSnackbar('Model created successfully', 'success');
                }
                setModelDialogOpen(false);
                setIsModelEditMode(false);
                setSelectedModel(null);
                setModelFormData({
                  name: '',
                  code: '',
                  description: '',
                });
                await loadTerminalModels();
              } catch (error: any) {
                showSnackbar(
                  error.response?.data?.message || 'Failed to save model',
                  'error'
                );
              }
            }}
            variant='contained'
            disabled={!modelFormData.name}
          >
            {isModelEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminal Request Dialog */}
      <Dialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Request Terminal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Terminal Model</InputLabel>
              <Select
                value={requestFormData.model}
                label='Terminal Model'
                onChange={(e) =>
                  setRequestFormData({
                    ...requestFormData,
                    model: e.target.value,
                  })
                }
                required
              >
                {terminalModels
                  .filter((model) => model.isActive)
                  .map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label='Location'
              value={requestFormData.location}
              onChange={(e) =>
                setRequestFormData({
                  ...requestFormData,
                  location: e.target.value,
                })
              }
              placeholder='e.g., Main Counter'
              fullWidth
            />
            <TextField
              label='Quantity'
              type='number'
              value={requestFormData.quantity}
              onChange={(e) =>
                setRequestFormData({
                  ...requestFormData,
                  quantity: e.target.value,
                })
              }
              inputProps={{ min: 1, max: 10 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRequestSubmit}
            variant='contained'
            disabled={!requestFormData.model}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Inventory Dialog */}
      <Dialog
        open={inventoryDialogOpen}
        onClose={() => {
          setInventoryDialogOpen(false);
          setIsInventoryEditMode(false);
          setSelectedInventory(null); // Clear selected inventory when closing
          setInventoryFormData({
            serialNumber: '',
            model: '',
            supplier: '',
            cost: '',
          });
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {isInventoryEditMode
            ? 'Update Inventory Item'
            : 'Add Terminal to Inventory'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label='Serial Number'
              value={inventoryFormData.serialNumber}
              onChange={(e) =>
                setInventoryFormData({
                  ...inventoryFormData,
                  serialNumber: e.target.value,
                })
              }
              required
              disabled={isInventoryEditMode}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={inventoryFormData.model}
                label='Model'
                onChange={(e) =>
                  setInventoryFormData({
                    ...inventoryFormData,
                    model: e.target.value,
                  })
                }
                required
                disabled={isInventoryEditMode}
              >
                {terminalModels
                  .filter((model) => model.isActive)
                  .map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label='Supplier'
              value={inventoryFormData.supplier}
              onChange={(e) =>
                setInventoryFormData({
                  ...inventoryFormData,
                  supplier: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label='Cost'
              type='number'
              value={inventoryFormData.cost}
              onChange={(e) =>
                setInventoryFormData({
                  ...inventoryFormData,
                  cost: e.target.value,
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInventorySubmit}
            variant='contained'
            disabled={
              !inventoryFormData.serialNumber || !inventoryFormData.model
            }
          >
            {isInventoryEditMode ? 'Update' : 'Add to Inventory'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminal Actions Menu */}
      <Menu
        anchorEl={terminalMenuAnchor}
        open={Boolean(terminalMenuAnchor)}
        onClose={handleTerminalMenuClose}
      >
        <MenuItem onClick={handleViewTerminalDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUpdateTerminal}>
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Update</ListItemText>
        </MenuItem>
      </Menu>

      {/* Terminal Request Actions Menu */}
      <Menu
        anchorEl={requestMenuAnchor}
        open={Boolean(requestMenuAnchor)}
        onClose={handleRequestMenuClose}
      >
        {/* View Details - Always available */}
        <MenuItem onClick={handleViewRequestDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {/* Approve - Only for PENDING requests */}
        {selectedRequest?.status === 'PENDING' && (
          <MenuItem onClick={handleApproveRequest} disabled={checkingInventory}>
            <ListItemIcon>
              {checkingInventory ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon fontSize='small' />
              )}
            </ListItemIcon>
            <ListItemText>
              {checkingInventory ? 'Checking Inventory...' : 'Approve'}
            </ListItemText>
          </MenuItem>
        )}

        {/* Reject - Only for PENDING requests */}
        {selectedRequest?.status === 'PENDING' && (
          <MenuItem onClick={handleRejectRequest}>
            <ListItemIcon>
              <CancelIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Reject</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Inventory Actions Menu */}
      <Menu
        anchorEl={inventoryMenuAnchor}
        open={Boolean(inventoryMenuAnchor)}
        onClose={handleInventoryMenuClose}
      >
        {selectedInventory?.status === 'IN_STOCK' && (
          <MenuItem onClick={handleUpdateInventory}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Update</ListItemText>
          </MenuItem>
        )}
        {selectedInventory?.status === 'IN_STOCK' && (
          <MenuItem onClick={handleDeleteInventory}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
        {selectedInventory?.status !== 'IN_STOCK' && (
          <MenuItem disabled>
            <ListItemIcon>
              <VisibilityIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>View Details (Allocated)</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRequestToReject(null);
          setRejectionReason('');
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Reject Terminal Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {requestToReject && (
              <>
                <Typography variant='body1' gutterBottom>
                  Are you sure you want to reject this terminal request?
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Request Details
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Model:</strong> {requestToReject.model}
                    <br />
                    <strong>Quantity:</strong> {requestToReject.quantity}
                    <br />
                    <strong>Outlet:</strong>{' '}
                    {requestToReject.outlet?.name || 'N/A'}
                    <br />
                    <strong>Merchant:</strong>{' '}
                    {requestToReject.merchant?.businessName || 'N/A'}
                  </Typography>
                </Box>
                <TextField
                  label='Rejection Reason (Optional)'
                  multiline
                  rows={3}
                  fullWidth
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{ mt: 3 }}
                  placeholder='Provide a reason for rejection...'
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRequestToReject(null);
              setRejectionReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRejectRequest}
            variant='contained'
            color='error'
            startIcon={<CancelIcon />}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsDialogOpen}
        onClose={() => {
          setViewDetailsDialogOpen(false);
          setRequestDetails(null);
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Terminal Request Details</DialogTitle>
        <DialogContent>
          {requestDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Request Information
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant='body2'>
                      <strong>Request ID:</strong> {requestDetails.id}
                      <br />
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={requestDetails.status}
                        color={getRequestStatusColor(requestDetails.status)}
                        size='small'
                        sx={{ mt: 0.5 }}
                      />
                      <br />
                      <strong>Quantity:</strong> {requestDetails.quantity}
                      <br />
                      <strong>Model:</strong> {requestDetails.model}
                      {requestDetails.location && (
                        <>
                          <br />
                          <strong>Location:</strong> {requestDetails.location}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Merchant & Outlet
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant='body2'>
                      <strong>Merchant:</strong>{' '}
                      {requestDetails.merchant?.businessName || 'N/A'}
                      <br />
                      <strong>Outlet:</strong>{' '}
                      {requestDetails.outlet?.name || 'N/A'}
                      <br />
                      <strong>Address:</strong>{' '}
                      {requestDetails.outlet?.address || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                {requestDetails.notes && (
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle2'
                      color='textSecondary'
                      gutterBottom
                    >
                      Notes
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant='body2'>
                        {requestDetails.notes}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {(requestDetails.approvedBy ||
                  requestDetails.rejectionReason) && (
                  <Grid item xs={12}>
                    <Typography
                      variant='subtitle2'
                      color='textSecondary'
                      gutterBottom
                    >
                      {requestDetails.status === 'REJECTED'
                        ? 'Rejection'
                        : 'Approval'}{' '}
                      Details
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant='body2'>
                        {requestDetails.approvedAt && (
                          <>
                            <strong>Date:</strong>{' '}
                            {new Date(
                              requestDetails.approvedAt
                            ).toLocaleString()}
                            <br />
                          </>
                        )}
                        {requestDetails.fulfilledAt && (
                          <>
                            <strong>Fulfilled:</strong>{' '}
                            {new Date(
                              requestDetails.fulfilledAt
                            ).toLocaleString()}
                            <br />
                          </>
                        )}
                        {requestDetails.rejectionReason && (
                          <>
                            <strong>Reason:</strong>{' '}
                            {requestDetails.rejectionReason}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {requestDetails.terminals &&
                  requestDetails.terminals.length > 0 && (
                    <Grid item xs={12}>
                      <Typography
                        variant='subtitle2'
                        color='textSecondary'
                        gutterBottom
                      >
                        Allocated Terminals ({requestDetails.terminals.length})
                      </Typography>
                      <TableContainer>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong>Serial Number</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Model</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Location</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Status</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {requestDetails.terminals.map((terminal: any) => (
                              <TableRow key={terminal.id}>
                                <TableCell>{terminal.serialNumber}</TableCell>
                                <TableCell>{terminal.model}</TableCell>
                                <TableCell>
                                  {terminal.location || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={terminal.status}
                                    color={getTerminalStatusColor(
                                      terminal.status
                                    )}
                                    size='small'
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDetailsDialogOpen(false);
              setRequestDetails(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalConfirmOpen}
        onClose={() => {
          setApprovalConfirmOpen(false);
          setRequestToApprove(null);
          setAvailableInventory([]);
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Approve Terminal Request</DialogTitle>
        <DialogContent>
          {requestToApprove && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body1' gutterBottom>
                You are about to approve this terminal request and allocate
                inventory:
              </Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Request Details
                </Typography>
                <Typography variant='body2'>
                  <strong>Model:</strong> {requestToApprove.model}
                  <br />
                  <strong>Quantity:</strong> {requestToApprove.quantity}
                  <br />
                  <strong>Outlet:</strong>{' '}
                  {requestToApprove.outlet?.name || 'N/A'}
                  <br />
                  <strong>Merchant:</strong>{' '}
                  {requestToApprove.merchant?.businessName || 'N/A'}
                  <br />
                  {requestToApprove.location && (
                    <>
                      <strong>Location:</strong> {requestToApprove.location}
                    </>
                  )}
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Inventory to be Allocated ({availableInventory.length} items)
                </Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Serial Number</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Model</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Supplier</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Cost</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableInventory.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.serialNumber}</TableCell>
                          <TableCell>{item.model}</TableCell>
                          <TableCell>{item.supplier || 'N/A'}</TableCell>
                          <TableCell>
                            {item.cost
                              ? `₦${parseFloat(item.cost).toLocaleString()}`
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant='body2' color='info.dark'>
                  <strong>Note:</strong> This action will create{' '}
                  {requestToApprove.quantity} terminal(s) assigned to the outlet
                  and mark the inventory items as ALLOCATED.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setApprovalConfirmOpen(false);
              setRequestToApprove(null);
              setAvailableInventory([]);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApproveRequest}
            variant='contained'
            color='success'
            startIcon={<CheckCircleIcon />}
          >
            Approve & Allocate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <DeleteIcon color='error' sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant='body1' gutterBottom>
                Are you sure you want to delete this terminal?
              </Typography>
              {itemToDelete && (
                <Typography variant='body2' color='textSecondary'>
                  <strong>Serial Number:</strong> {itemToDelete.serialNumber}
                  <br />
                  <strong>Model:</strong> {itemToDelete.model}
                </Typography>
              )}
              <Typography
                variant='body2'
                color='error'
                sx={{ mt: 1, fontWeight: 'bold' }}
              >
                This action cannot be undone.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteInventory}
            variant='contained'
            color='error'
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminal Details Dialog */}
      <Dialog
        open={viewTerminalDetailsOpen}
        onClose={() => {
          setViewTerminalDetailsOpen(false);
          setTerminalDetails(null);
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Terminal Details</DialogTitle>
        <DialogContent>
          {terminalDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Serial Number
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                    {terminalDetails.serialNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Model
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.model?.name || 'N/A'}
                    {terminalDetails.model?.code && (
                      <Chip
                        label={terminalDetails.model.code}
                        size='small'
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <Chip
                    label={terminalDetails.status}
                    color={getTerminalStatusColor(terminalDetails.status)}
                    size='small'
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Online Status
                  </Typography>
                  <Chip
                    label={terminalDetails.isOnline ? 'Online' : 'Offline'}
                    color={terminalDetails.isOnline ? 'success' : 'error'}
                    size='small'
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Outlet
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.outlet?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Merchant
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.outlet?.merchant?.businessName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Location
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.location || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Battery Level
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.batteryLevel !== null
                      ? `${terminalDetails.batteryLevel}%`
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Firmware Version
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.firmwareVersion || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Last Seen
                  </Typography>
                  <Typography variant='body1'>
                    {terminalDetails.lastSeenAt
                      ? new Date(terminalDetails.lastSeenAt).toLocaleString()
                      : 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Created At
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(terminalDetails.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    gutterBottom
                  >
                    Last Updated
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(terminalDetails.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewTerminalDetailsOpen(false);
              setTerminalDetails(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Terminal Dialog */}
      <Dialog
        open={updateTerminalDialogOpen}
        onClose={() => {
          setUpdateTerminalDialogOpen(false);
          setEditingTerminalId(null);
          setTerminalFormData({
            status: '',
            location: '',
            batteryLevel: '',
            firmwareVersion: '',
          });
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Update Terminal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={terminalFormData.status}
                label='Status'
                onChange={(e) =>
                  setTerminalFormData({
                    ...terminalFormData,
                    status: e.target.value,
                  })
                }
              >
                <MenuItem value='ACTIVE'>Active</MenuItem>
                <MenuItem value='MAINTENANCE'>Maintenance</MenuItem>
                <MenuItem value='INACTIVE'>Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label='Location'
              value={terminalFormData.location}
              onChange={(e) =>
                setTerminalFormData({
                  ...terminalFormData,
                  location: e.target.value,
                })
              }
              placeholder='e.g., Main Counter'
              fullWidth
            />
            <TextField
              label='Battery Level (%)'
              type='number'
              value={terminalFormData.batteryLevel}
              onChange={(e) =>
                setTerminalFormData({
                  ...terminalFormData,
                  batteryLevel: e.target.value,
                })
              }
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label='Firmware Version'
              value={terminalFormData.firmwareVersion}
              onChange={(e) =>
                setTerminalFormData({
                  ...terminalFormData,
                  firmwareVersion: e.target.value,
                })
              }
              placeholder='e.g., v2.1.0'
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpdateTerminalDialogOpen(false);
              setEditingTerminalId(null);
              setTerminalFormData({
                status: '',
                location: '',
                batteryLevel: '',
                firmwareVersion: '',
              });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleTerminalUpdateSubmit} variant='contained'>
            Update Terminal
          </Button>
        </DialogActions>
      </Dialog>

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

export default TerminalsPage;
