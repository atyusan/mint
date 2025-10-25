import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Devices as DevicesIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  getSummaryReport,
  getTransactionReports,
  getOutletPerformance,
  getRevenueAnalysis,
} from '../../store/slices/reportsSlice';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    summaryData,
    transactionReports,
    outletPerformance,
    revenueAnalysis,
    loading,
  } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    dispatch(getSummaryReport({}));
    dispatch(getTransactionReports({}));
    dispatch(getOutletPerformance({}));
    dispatch(getRevenueAnalysis({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getSummaryReport({}));
    dispatch(getTransactionReports({}));
    dispatch(getOutletPerformance({}));
    dispatch(getRevenueAnalysis({}));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Tooltip title='Refresh Data'>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                    variant='body2'
                  >
                    Total Revenue
                  </Typography>
                  <Typography variant='h4' component='div'>
                    {formatCurrency(summaryData?.totalRevenue || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color='success' fontSize='small' />
                    <Typography
                      variant='body2'
                      color='success.main'
                      sx={{ ml: 0.5 }}
                    >
                      {summaryData?.successRate
                        ? `${summaryData.successRate.toFixed(1)}%`
                        : '0%'}{' '}
                      success rate
                    </Typography>
                  </Box>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                    variant='body2'
                  >
                    Total Invoices
                  </Typography>
                  <Typography variant='h4' component='div'>
                    {formatNumber(summaryData?.totalTransactions || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      {summaryData?.averageTransaction
                        ? `₦${summaryData.averageTransaction.toLocaleString()}`
                        : '₦0'}{' '}
                      avg
                    </Typography>
                  </Box>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                    variant='body2'
                  >
                    Active Terminals
                  </Typography>
                  <Typography variant='h4' component='div'>
                    {outletPerformance?.length || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      Active outlets
                    </Typography>
                  </Box>
                </Box>
                <DevicesIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    color='textSecondary'
                    gutterBottom
                    variant='body2'
                  >
                    Pending Payouts
                  </Typography>
                  <Typography variant='h4' component='div'>
                    {summaryData?.totalFees
                      ? `₦${(summaryData.totalFees / 1000).toFixed(0)}K`
                      : '₦0'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      Platform fees
                    </Typography>
                  </Box>
                </Box>
                <AccountBalanceIcon
                  sx={{ fontSize: 40, color: 'warning.main' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Revenue Trends (Last 30 Days)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={revenueAnalysis || []}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#8884d8'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='netRevenue'
                    stroke='#82ca9d'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='fees'
                    stroke='#ffc658'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Revenue by Outlet
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={(outletPerformance || []).map((item: any) => ({
                      name: item.name,
                      value: item.revenue,
                      ...item,
                    }))}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {(outletPerformance || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performers Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Top Performing Outlets
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(outletPerformance || []).map((outlet, index) => (
                <Box
                  key={outlet.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Box>
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {outlet.name}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      {outlet.transactions} transactions
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      {outlet.successRate.toFixed(1)}% success rate
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(outlet.revenue)}
                    </Typography>
                    <Chip
                      label={`#${index + 1}`}
                      size='small'
                      color='primary'
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Recent Transactions
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(transactionReports || [])
                .slice(0, 5)
                .map((transaction, index) => (
                  <Box
                    key={transaction.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Box>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {transaction.method}
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {transaction.date}
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        Terminal: {transaction.terminal}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant='h6' color='primary'>
                        {formatCurrency(transaction.amount)}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size='small'
                        color={
                          transaction.status === 'completed'
                            ? 'success'
                            : 'warning'
                        }
                      />
                    </Box>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
