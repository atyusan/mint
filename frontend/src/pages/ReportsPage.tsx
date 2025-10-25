import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  getSummaryReport,
  getTransactionReports,
  getOutletPerformance,
  getTerminalUsage,
  getRevenueAnalysis,
  exportReport,
  setFilters,
  clearError,
} from '../store/slices/reportsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    summaryData,
    transactionReports,
    outletPerformance,
    terminalUsage,
    revenueAnalysis,
    loading,
    error,
    filters,
  } = useSelector((state: RootState) => state.reports);

  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('summary');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      await Promise.all([
        dispatch(getSummaryReport(filters)).unwrap(),
        dispatch(getTransactionReports(filters)).unwrap(),
        dispatch(getOutletPerformance(filters)).unwrap(),
        dispatch(getTerminalUsage(filters)).unwrap(),
        dispatch(getRevenueAnalysis(filters)).unwrap(),
      ]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load reports',
        severity: 'error',
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportReport = async () => {
    try {
      await dispatch(
        exportReport({
          type: reportType,
          format: 'pdf',
          filters,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: 'Report exported successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to export report',
        severity: 'error',
      });
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleRefreshReport = () => {
    loadReports();
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;

    switch (range) {
      case '7':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        break;
      case '30':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        break;
      case '90':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        break;
      case '365':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        break;
      default:
        startDate = filters.startDate || endDate;
    }

    dispatch(setFilters({ startDate, endDate }));
  };

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
          Financial Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={handleRefreshReport}
          >
            Refresh
          </Button>
          <Button
            variant='outlined'
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
          >
            Print
          </Button>
          <Button
            variant='contained'
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Report Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label='Date Range'
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                >
                  <MenuItem value='7'>Last 7 days</MenuItem>
                  <MenuItem value='30'>Last 30 days</MenuItem>
                  <MenuItem value='90'>Last 3 months</MenuItem>
                  <MenuItem value='365'>Last year</MenuItem>
                  <MenuItem value='custom'>Custom range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label='Report Type'
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value='summary'>Summary Report</MenuItem>
                  <MenuItem value='detailed'>Detailed Report</MenuItem>
                  <MenuItem value='outlet'>Outlet Performance</MenuItem>
                  <MenuItem value='terminal'>Terminal Usage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label='Start Date'
                type='date'
                value={filters.startDate || ''}
                onChange={(e) =>
                  dispatch(setFilters({ startDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label='End Date'
                type='date'
                value={filters.endDate || ''}
                onChange={(e) =>
                  dispatch(setFilters({ endDate: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalanceIcon
                color='primary'
                sx={{ fontSize: 40, mb: 1 }}
              />
              <Typography color='textSecondary' gutterBottom>
                Total Revenue
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5'>
                  ₦
                  {summaryData
                    ? (summaryData.totalRevenue / 1000000).toFixed(1)
                    : '0.0'}
                  M
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReceiptIcon color='success' sx={{ fontSize: 40, mb: 1 }} />
              <Typography color='textSecondary' gutterBottom>
                Transactions
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5'>
                  {summaryData
                    ? summaryData.totalTransactions.toLocaleString()
                    : '0'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PaymentIcon color='info' sx={{ fontSize: 40, mb: 1 }} />
              <Typography color='textSecondary' gutterBottom>
                Avg Transaction
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5'>
                  ₦
                  {summaryData
                    ? summaryData.averageTransaction.toLocaleString()
                    : '0'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color='warning' sx={{ fontSize: 40, mb: 1 }} />
              <Typography color='textSecondary' gutterBottom>
                Success Rate
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5'>
                  {summaryData ? summaryData.successRate.toFixed(1) : '0.0'}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color='textSecondary' gutterBottom>
                Total Fees
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5' color='error'>
                  ₦
                  {summaryData
                    ? (summaryData.totalFees / 1000).toFixed(0)
                    : '0'}
                  K
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color='textSecondary' gutterBottom>
                Net Revenue
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant='h5' color='success.main'>
                  ₦
                  {summaryData
                    ? (summaryData.netRevenue / 1000000).toFixed(1)
                    : '0.0'}
                  M
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='reports tabs'
          >
            <Tab label='Transaction History' />
            <Tab label='Outlet Performance' />
            <Tab label='Terminal Usage' />
            <Tab label='Revenue Analysis' />
          </Tabs>
        </Box>

        <CustomTabPanel value={tabValue} index={0}>
          <Typography variant='h6' gutterBottom>
            Transaction History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Terminal</TableCell>
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
                ) : transactionReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No transaction data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionReports.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        ₦{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={
                            transaction.status === 'completed'
                              ? 'success'
                              : transaction.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell>{transaction.terminal}</TableCell>
                      <TableCell>
                        <IconButton size='small'>
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={1}>
          <Typography variant='h6' gutterBottom>
            Outlet Performance
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Outlet Name</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Transactions</TableCell>
                  <TableCell>Success Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : outletPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      <Typography variant='body2' color='textSecondary'>
                        No outlet data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  outletPerformance.map((outlet, index) => (
                    <TableRow key={index}>
                      <TableCell>{outlet.name}</TableCell>
                      <TableCell>₦{outlet.revenue.toLocaleString()}</TableCell>
                      <TableCell>{outlet.transactions}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${outlet.successRate}%`}
                          color='success'
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={2}>
          <Typography variant='h6' gutterBottom>
            Terminal Usage Report
          </Typography>
          <Alert severity='info'>
            Terminal usage reports will show detailed analytics for each POS
            terminal including transaction volume, uptime, and performance
            metrics.
          </Alert>
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={3}>
          <Typography variant='h6' gutterBottom>
            Revenue Analysis
          </Typography>
          <Alert severity='info'>
            Revenue analysis reports will provide insights into revenue trends,
            payment method preferences, and seasonal patterns.
          </Alert>
        </CustomTabPanel>
      </Card>

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

export default ReportsPage;
