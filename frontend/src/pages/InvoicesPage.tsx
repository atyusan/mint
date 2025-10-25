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
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  cancelInvoice,
} from '../store/slices/invoiceSlice';

interface InvoiceFormData {
  amount: number;
  description: string;
  dueDate: string;
  outletId: string;
  terminalId: string;
  categoryId: string;
}

const InvoicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { invoices, loading, error } = useSelector(
    (state: RootState) => state.invoice
  );
  const { outlets } = useSelector((state: RootState) => state.merchant);
  const { terminals } = useSelector((state: RootState) => state.terminal);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    amount: 0,
    description: '',
    dueDate: '',
    outletId: '',
    terminalId: '',
    categoryId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(getInvoices({}));
  }, [dispatch]);

  const handleOpenDialog = (invoice?: any) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        amount: invoice.amount,
        description: invoice.description,
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().split('T')[0]
          : '',
        outletId: invoice.outlet.id,
        terminalId: invoice.terminal?.id || '',
        categoryId: invoice.category?.id || '',
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        amount: 0,
        description: '',
        dueDate: '',
        outletId: '',
        terminalId: '',
        categoryId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInvoice(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingInvoice) {
        await dispatch(
          updateInvoice({ id: editingInvoice.id, ...formData })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Invoice updated successfully',
          severity: 'success',
        });
      } else {
        await dispatch(createInvoice(formData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Invoice created successfully',
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
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      try {
        await dispatch(cancelInvoice(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Invoice cancelled successfully',
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
      case 'PENDING':
        return 'warning';
      case 'PAID':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount),
    0
  );
  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.status === 'PENDING')
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Invoice Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant='h4'>{filteredInvoices.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Total Amount
              </Typography>
              <Typography variant='h4'>
                ₦{totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant='h4' color='warning.main'>
                ₦{pendingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Success Rate
              </Typography>
              <Typography variant='h4' color='success.main'>
                {filteredInvoices.length > 0
                  ? Math.round(
                      (filteredInvoices.filter((i) => i.status === 'PAID')
                        .length /
                        filteredInvoices.length) *
                        100
                    )
                  : 0}
                %
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
                label='Search invoices'
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
                  <MenuItem value='PENDING'>Pending</MenuItem>
                  <MenuItem value='PAID'>Paid</MenuItem>
                  <MenuItem value='CANCELLED'>Cancelled</MenuItem>
                  <MenuItem value='OVERDUE'>Overdue</MenuItem>
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

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Outlet</TableCell>
                  <TableCell>Terminal</TableCell>
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
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No invoices found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>
                        ₦{Number(invoice.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          color={getStatusColor(invoice.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{invoice.outlet.name}</TableCell>
                      <TableCell>
                        {invoice.terminal?.serialNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenDialog(invoice)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(invoice.id)}
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

      {/* Create Invoice Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Amount'
                type='number'
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Due Date'
                type='date'
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Terminal</InputLabel>
                <Select
                  value={formData.terminalId}
                  label='Terminal'
                  onChange={(e) =>
                    setFormData({ ...formData, terminalId: e.target.value })
                  }
                >
                  <MenuItem value=''>
                    <em>No Terminal</em>
                  </MenuItem>
                  {terminals.map((terminal) => (
                    <MenuItem key={terminal.id} value={terminal.id}>
                      {terminal.serialNumber}
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
            {editingInvoice ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color='primary'
        aria-label='add invoice'
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

export default InvoicesPage;
