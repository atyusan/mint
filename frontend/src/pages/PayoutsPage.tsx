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
  Tab,
  Tabs,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getPayouts,
  getPayoutMethods,
  createPayout,
  createPayoutMethod,
  updatePayoutMethod,
  deletePayoutMethod,
} from '../store/slices/payoutSlice';

interface PayoutMethodFormData {
  methodType: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  isDefault: boolean;
}

interface PayoutFormData {
  amount: number;
  payoutMethodId: string;
  frequency: string;
  scheduledFor?: string;
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PayoutsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payouts, payoutMethods, loading, error } = useSelector(
    (state: RootState) => state.payout
  );

  const [tabValue, setTabValue] = useState(0);
  const [openMethodDialog, setOpenMethodDialog] = useState(false);
  const [openPayoutDialog, setOpenPayoutDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [methodFormData, setMethodFormData] = useState<PayoutMethodFormData>({
    methodType: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    isDefault: false,
  });
  const [payoutFormData, setPayoutFormData] = useState<PayoutFormData>({
    amount: 0,
    payoutMethodId: '',
    frequency: 'immediate',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    dispatch(getPayouts());
    dispatch(getPayoutMethods());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenMethodDialog = (method?: any) => {
    if (method) {
      setEditingMethod(method);
      setMethodFormData({
        methodType: method.methodType,
        accountName: method.accountName,
        accountNumber: method.accountNumber,
        bankName: method.bankName,
        bankCode: method.bankCode,
        isDefault: method.isDefault,
      });
    } else {
      setEditingMethod(null);
      setMethodFormData({
        methodType: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        bankCode: '',
        isDefault: false,
      });
    }
    setOpenMethodDialog(true);
  };

  const handleCloseMethodDialog = () => {
    setOpenMethodDialog(false);
    setEditingMethod(null);
  };

  const handleOpenPayoutDialog = () => {
    setPayoutFormData({
      amount: 0,
      payoutMethodId: '',
      frequency: 'immediate',
    });
    setOpenPayoutDialog(true);
  };

  const handleClosePayoutDialog = () => {
    setOpenPayoutDialog(false);
  };

  const handleSubmitMethod = async () => {
    try {
      if (editingMethod) {
        await dispatch(
          updatePayoutMethod({ id: editingMethod.id, ...methodFormData })
        ).unwrap();
        setSnackbar({
          open: true,
          message: 'Payout method updated successfully',
          severity: 'success',
        });
      } else {
        await dispatch(createPayoutMethod(methodFormData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Payout method created successfully',
          severity: 'success',
        });
      }
      handleCloseMethodDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleSubmitPayout = async () => {
    try {
      await dispatch(createPayout(payoutFormData)).unwrap();
      setSnackbar({
        open: true,
        message: 'Payout created successfully',
        severity: 'success',
      });
      handleClosePayoutDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payout method?')) {
      try {
        await dispatch(deletePayoutMethod(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Payout method deleted successfully',
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
      case 'PROCESSING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const totalPayouts = payouts.reduce(
    (sum, payout) => sum + Number(payout.amount),
    0
  );
  const pendingPayouts = payouts.filter(
    (payout) => payout.status === 'PENDING'
  ).length;
  const completedPayouts = payouts.filter(
    (payout) => payout.status === 'COMPLETED'
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Payout Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Total Payouts
              </Typography>
              <Typography variant='h4'>{payouts.length}</Typography>
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
                ₦{totalPayouts.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Pending Payouts
              </Typography>
              <Typography variant='h4' color='warning.main'>
                {pendingPayouts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Completed Payouts
              </Typography>
              <Typography variant='h4' color='success.main'>
                {completedPayouts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='payout tabs'
          >
            <Tab label='Payout Methods' />
            <Tab label='Payout History' />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Payout Methods */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => handleOpenMethodDialog()}
            >
              Add Payout Method
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Account Number</TableCell>
                  <TableCell>Bank Name</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : payoutMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No payout methods found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>{method.methodType}</TableCell>
                      <TableCell>{method.accountName}</TableCell>
                      <TableCell>{method.accountNumber}</TableCell>
                      <TableCell>{method.bankName}</TableCell>
                      <TableCell>
                        {method.isDefault && (
                          <Chip label='Default' color='primary' size='small' />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenMethodDialog(method)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDeleteMethod(method.id)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Payout History */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleOpenPayoutDialog}
            >
              Create Payout
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Processed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No payouts found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        ₦{Number(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payout.status}
                          color={getStatusColor(payout.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {payoutMethods.find(
                          (method) => method.id === payout.payoutMethodId
                        )?.accountName || 'N/A'}
                      </TableCell>
                      <TableCell>{payout.reference}</TableCell>
                      <TableCell>
                        {payout.createdAt
                          ? new Date(payout.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payout.processedAt
                          ? new Date(payout.processedAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Create Payout Method Dialog */}
      <Dialog
        open={openMethodDialog}
        onClose={handleCloseMethodDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {editingMethod ? 'Edit Payout Method' : 'Add Payout Method'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={methodFormData.methodType}
                  label='Type'
                  onChange={(e) =>
                    setMethodFormData({
                      ...methodFormData,
                      methodType: e.target.value,
                    })
                  }
                >
                  <MenuItem value='bank'>Bank Account</MenuItem>
                  <MenuItem value='mobile_money'>Mobile Money</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Account Name'
                value={methodFormData.accountName}
                onChange={(e) =>
                  setMethodFormData({
                    ...methodFormData,
                    accountName: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Account Number'
                value={methodFormData.accountNumber}
                onChange={(e) =>
                  setMethodFormData({
                    ...methodFormData,
                    accountNumber: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Bank Name'
                value={methodFormData.bankName}
                onChange={(e) =>
                  setMethodFormData({
                    ...methodFormData,
                    bankName: e.target.value,
                  })
                }
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMethodDialog}>Cancel</Button>
          <Button onClick={handleSubmitMethod} variant='contained'>
            {editingMethod ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Payout Dialog */}
      <Dialog
        open={openPayoutDialog}
        onClose={handleClosePayoutDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Create Payout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Amount'
                type='number'
                value={payoutFormData.amount}
                onChange={(e) =>
                  setPayoutFormData({
                    ...payoutFormData,
                    amount: Number(e.target.value),
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payout Method</InputLabel>
                <Select
                  value={payoutFormData.payoutMethodId}
                  label='Payout Method'
                  onChange={(e) =>
                    setPayoutFormData({
                      ...payoutFormData,
                      payoutMethodId: e.target.value,
                    })
                  }
                >
                  {payoutMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.accountName} - {method.accountNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={payoutFormData.frequency}
                  label='Frequency'
                  onChange={(e) =>
                    setPayoutFormData({
                      ...payoutFormData,
                      frequency: e.target.value,
                    })
                  }
                >
                  <MenuItem value='immediate'>Immediate</MenuItem>
                  <MenuItem value='daily'>Daily</MenuItem>
                  <MenuItem value='weekly'>Weekly</MenuItem>
                  <MenuItem value='monthly'>Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePayoutDialog}>Cancel</Button>
          <Button onClick={handleSubmitPayout} variant='contained'>
            Create Payout
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
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PayoutsPage;
