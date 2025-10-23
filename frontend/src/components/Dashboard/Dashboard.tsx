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
  getDashboardMetrics,
  getRealTimeMetrics,
  getRevenueTrends,
  getTopOutlets,
  getTopCategories,
} from '../../store/slices/analyticsSlice';
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
    dashboardMetrics,
    realTimeMetrics,
    revenueTrends,
    topOutlets,
    topCategories,
  } = useSelector((state: RootState) => state.analytics);
  const { loading } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(getDashboardMetrics({}));
    dispatch(getRealTimeMetrics({}));
    dispatch(getRevenueTrends({ days: 30 }));
    dispatch(getTopOutlets({ limit: 5 }));
    dispatch(getTopCategories({ limit: 5 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getDashboardMetrics({}));
    dispatch(getRealTimeMetrics({}));
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
                    {formatCurrency(dashboardMetrics?.revenue.total || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {realTimeMetrics?.growth.revenue &&
                    realTimeMetrics.growth.revenue > 0 ? (
                      <TrendingUpIcon color='success' fontSize='small' />
                    ) : (
                      <TrendingDownIcon color='error' fontSize='small' />
                    )}
                    <Typography
                      variant='body2'
                      color={
                        realTimeMetrics?.growth.revenue &&
                        realTimeMetrics.growth.revenue > 0
                          ? 'success.main'
                          : 'error.main'
                      }
                      sx={{ ml: 0.5 }}
                    >
                      {realTimeMetrics?.growth.revenue
                        ? `${Math.abs(realTimeMetrics.growth.revenue).toFixed(
                            1
                          )}%`
                        : '0%'}
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
                    {formatNumber(
                      dashboardMetrics?.overview.totalInvoices || 0
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      {dashboardMetrics?.overview.successRate.toFixed(1)}%
                      success rate
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
                    {realTimeMetrics?.today.activeTerminals || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      Online now
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
                    {realTimeMetrics?.today.pendingPayouts || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant='body2' color='textSecondary'>
                      Awaiting processing
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
                <LineChart data={revenueTrends?.daily || []}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Line
                    type='monotone'
                    dataKey='total'
                    stroke='#8884d8'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='paid'
                    stroke='#82ca9d'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='pending'
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
              Revenue by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={(revenueTrends?.byCategory || []).map(
                      (item: any) => ({
                        name: item.name,
                        value: item.total,
                        ...item,
                      })
                    )}
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
                    {(revenueTrends?.byCategory || []).map((entry, index) => (
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
              {topOutlets.map((outlet, index) => (
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
                      {outlet.city}, {outlet.state}
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                      {outlet.invoiceCount} invoices
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(outlet.totalRevenue)}
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
              Top Categories
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {topCategories.map((category, index) => (
                <Box
                  key={category.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor:
                          category.color || COLORS[index % COLORS.length],
                        mr: 2,
                      }}
                    />
                    <Box>
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {category.name}
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        {category.invoiceCount} invoices
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(category.totalRevenue)}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;
