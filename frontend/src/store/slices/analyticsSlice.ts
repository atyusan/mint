import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface DashboardMetrics {
  overview: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    cancelledInvoices: number;
    successRate: number;
    averageInvoiceValue: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
    fees: number;
    net: number;
  };
}

interface RevenueTrend {
  date: string;
  total: number;
  paid: number;
  pending: number;
  fees: number;
}

interface CategoryRevenue {
  name: string;
  color?: string;
  total: number;
  paid: number;
  pending: number;
}

interface TopOutlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
}

interface TopCategory {
  id: string;
  name: string;
  color?: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
}

interface PaymentMethodAnalytics {
  method: string;
  count: number;
  totalAmount: number;
  netAmount: number;
}

interface TerminalPerformance {
  id: string;
  serialNumber: string;
  model: string;
  status: string;
  location?: string;
  outlet: {
    name: string;
    address: string;
  };
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  lastSeenAt?: string;
  isOnline: boolean;
}

interface RealTimeMetrics {
  today: {
    invoices: number;
    revenue: number;
    activeTerminals: number;
    pendingPayouts: number;
  };
  growth: {
    invoices: number;
    revenue: number;
  };
}

interface AnalyticsState {
  dashboardMetrics: DashboardMetrics | null;
  revenueTrends: {
    daily: RevenueTrend[];
    byCategory: CategoryRevenue[];
  } | null;
  topOutlets: TopOutlet[];
  topCategories: TopCategory[];
  paymentMethodAnalytics: PaymentMethodAnalytics[];
  terminalPerformance: TerminalPerformance[];
  realTimeMetrics: RealTimeMetrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardMetrics: null,
  revenueTrends: null,
  topOutlets: [],
  topCategories: [],
  paymentMethodAnalytics: [],
  terminalPerformance: [],
  realTimeMetrics: null,
  loading: false,
  error: null,
};

export const getDashboardMetrics = createAsyncThunk(
  'analytics/getDashboardMetrics',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
      categoryId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/dashboard', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard metrics'
      );
    }
  }
);

export const getRevenueTrends = createAsyncThunk(
  'analytics/getRevenueTrends',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
      categoryId?: string;
      days?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/revenue-trends', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get revenue trends'
      );
    }
  }
);

export const getTopOutlets = createAsyncThunk(
  'analytics/getTopOutlets',
  async (
    params: {
      merchantId?: string;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/top-outlets', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get top outlets'
      );
    }
  }
);

export const getTopCategories = createAsyncThunk(
  'analytics/getTopCategories',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/top-categories', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get top categories'
      );
    }
  }
);

export const getPaymentMethodAnalytics = createAsyncThunk(
  'analytics/getPaymentMethodAnalytics',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/payment-methods', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to get payment method analytics'
      );
    }
  }
);

export const getTerminalPerformance = createAsyncThunk(
  'analytics/getTerminalPerformance',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/terminal-performance', {
        params,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get terminal performance'
      );
    }
  }
);

export const getRealTimeMetrics = createAsyncThunk(
  'analytics/getRealTimeMetrics',
  async (
    params: {
      merchantId?: string;
      outletId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/analytics/real-time', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get real-time metrics'
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard Metrics
      .addCase(getDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardMetrics = action.payload;
      })
      .addCase(getDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Revenue Trends
      .addCase(getRevenueTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenueTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueTrends = action.payload;
      })
      .addCase(getRevenueTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Top Outlets
      .addCase(getTopOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.topOutlets = action.payload;
      })
      .addCase(getTopOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Top Categories
      .addCase(getTopCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.topCategories = action.payload;
      })
      .addCase(getTopCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Payment Method Analytics
      .addCase(getPaymentMethodAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethodAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethodAnalytics = action.payload;
      })
      .addCase(getPaymentMethodAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Terminal Performance
      .addCase(getTerminalPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminalPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.terminalPerformance = action.payload;
      })
      .addCase(getTerminalPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Real Time Metrics
      .addCase(getRealTimeMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRealTimeMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.realTimeMetrics = action.payload;
      })
      .addCase(getRealTimeMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
