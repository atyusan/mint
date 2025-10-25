import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Power as PowerIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getTerminals,
  createTerminal,
  updateTerminal,
} from '../store/slices/terminalSlice';

interface TerminalFormData {
  serialNumber: string;
  model: string;
  outletId: string;
  location: string;
}

const TerminalsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { terminals, loading, error } = useSelector(
    (state: RootState) => state.terminal
  );
  const { outlets } = useSelector((state: RootState) => state.merchant);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<any>(null);
  const [formData, setFormData] = useState<TerminalFormData>({
    serialNumber: '',
    model: '',
    outletId: '',
    location: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(getTerminals({}));
  }, [dispatch]);

  const handleOpenDialog = (terminal?: any) => {
    if (terminal) {
      setEditingTerminal(terminal);
      setFormData({
        serialNumber: terminal.serialNumber,
        model: terminal.model,
        outletId: terminal.outletId,
        location: terminal.location || '',
      });
    } else {
      setEditingTerminal(null);
      setFormData({
        serialNumber: '',
        model: '',
        outletId: '',
        location: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTerminal(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTerminal) {
        await dispatch(
          updateTerminal({ id: editingTerminal.id, ...formData })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Terminal updated successfully',
          severity: 'success',
        });
      } else {
        await dispatch(createTerminal(formData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Terminal created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this terminal?')) {
      try {
        // Note: deleteTerminal doesn't exist in the slice, using updateTerminal to set status to INACTIVE
        await dispatch(updateTerminal({ id, status: 'INACTIVE' })).unwrap();
        setSnackbar({
          open: true,
          message: 'Terminal deactivated successfully',
          severity: 'success',
        });
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || 'An error occurred',
          severity: 'error',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'MAINTENANCE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredTerminals = terminals.filter((terminal) => {
    const matchesSearch =
      terminal.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || terminal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineTerminals = filteredTerminals.filter(
    (terminal) => terminal.isOnline
  ).length;
  const activeTerminals = filteredTerminals.filter(
    (terminal) => terminal.status === 'ACTIVE'
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Terminal Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Total Terminals
              </Typography>
              <Typography variant='h4'>{filteredTerminals.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Online Terminals
              </Typography>
              <Typography variant='h4' color='success.main'>
                {onlineTerminals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Active Terminals
              </Typography>
              <Typography variant='h4' color='primary.main'>
                {activeTerminals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Offline Terminals
              </Typography>
              <Typography variant='h4' color='error.main'>
                {filteredTerminals.length - onlineTerminals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label='Search terminals'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label='Status Filter'
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Status</MenuItem>
                  <MenuItem value='ACTIVE'>Active</MenuItem>
                  <MenuItem value='INACTIVE'>Inactive</MenuItem>
                  <MenuItem value='MAINTENANCE'>Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant='outlined'
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Terminals Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Online</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Outlet</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredTerminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No terminals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTerminals.map((terminal) => (
                    <TableRow key={terminal.id}>
                      <TableCell>{terminal.serialNumber}</TableCell>
                      <TableCell>{terminal.model}</TableCell>
                      <TableCell>
                        <Chip
                          label={terminal.status}
                          color={getStatusColor(terminal.status)}
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
                      <TableCell>{terminal.location || 'N/A'}</TableCell>
                      <TableCell>{terminal.outlet.name}</TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenDialog(terminal)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(terminal.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Terminal Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {editingTerminal ? 'Edit Terminal' : 'Create New Terminal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Serial Number'
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Model'
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Location'
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Outlet</InputLabel>
                <Select
                  value={formData.outletId}
                  label='Outlet'
                  onChange={(e) =>
                    setFormData({ ...formData, outletId: e.target.value })
                  }
                >
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained'>
            {editingTerminal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color='primary'
        aria-label='add terminal'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TerminalsPage;
