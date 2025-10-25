import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/api';

// Types
interface ReportFilters {
  startDate?: string;
  endDate?: string;
  outletId?: string;
  terminalId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface SummaryData {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  successRate: number;
  totalFees: number;
  netRevenue: number;
  period: string;
}

interface TransactionReport {
  id: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  terminal: string;
  outlet: string;
  customerEmail?: string;
  reference: string;
}

interface OutletPerformance {
  id: string;
  name: string;
  revenue: number;
  transactions: number;
  successRate: number;
  averageTransaction: number;
  period: string;
}

interface TerminalUsage {
  id: string;
  serialNumber: string;
  outlet: string;
  totalTransactions: number;
  totalRevenue: number;
  uptime: number;
  averageTransactionTime: number;
  lastUsed: string;
}

interface RevenueAnalysis {
  date: string;
  revenue: number;
  transactions: number;
  fees: number;
  netRevenue: number;
}

interface ReportsState {
  summaryData: SummaryData | null;
  transactionReports: TransactionReport[];
  outletPerformance: OutletPerformance[];
  terminalUsage: TerminalUsage[];
  revenueAnalysis: RevenueAnalysis[];
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
}

const initialState: ReportsState = {
  summaryData: null,
  transactionReports: [],
  outletPerformance: [],
  terminalUsage: [],
  revenueAnalysis: [],
  loading: false,
  error: null,
  filters: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    page: 1,
    limit: 10,
  },
};

// Async thunks
export const getSummaryReport = createAsyncThunk(
  'reports/getSummaryReport',
  async (filters: ReportFilters = {}) => {
    const response = await api.get('/analytics/dashboard', { params: filters });
    return response.data;
  }
);

export const getTransactionReports = createAsyncThunk(
  'reports/getTransactionReports',
  async (filters: ReportFilters = {}) => {
    // Use invoices endpoint for transaction data
    const response = await api.get('/invoices', { params: filters });
    // Handle invoices response structure
    return response.data.data || [];
  }
);

export const getOutletPerformance = createAsyncThunk(
  'reports/getOutletPerformance',
  async (filters: ReportFilters = {}) => {
    const response = await api.get('/analytics/top-outlets', {
      params: filters,
    });
    // Handle both direct array and wrapped response
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }
);

export const getTerminalUsage = createAsyncThunk(
  'reports/getTerminalUsage',
  async (filters: ReportFilters = {}) => {
    const response = await api.get('/analytics/terminal-performance', {
      params: filters,
    });
    // Handle both direct array and wrapped response
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }
);

export const getRevenueAnalysis = createAsyncThunk(
  'reports/getRevenueAnalysis',
  async (filters: ReportFilters = {}) => {
    const response = await api.get('/analytics/revenue-trends', {
      params: filters,
    });
    // Handle both direct array and wrapped response
    return Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
  }
);

export const exportReport = createAsyncThunk(
  'reports/exportReport',
  async (params: { type: string; format: string; filters: ReportFilters }) => {
    // For now, we'll use the analytics dashboard endpoint as a fallback
    // In the future, you can implement a proper export endpoint
    const response = await api.get('/analytics/dashboard', {
      params: { ...params.filters, format: params.format },
    });
    return response.data;
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ReportFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetReports: (state) => {
      state.summaryData = null;
      state.transactionReports = [];
      state.outletPerformance = [];
      state.terminalUsage = [];
      state.revenueAnalysis = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Summary Report
    builder
      .addCase(getSummaryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSummaryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.summaryData = action.payload;
      })
      .addCase(getSummaryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch summary report';
      });

    // Transaction Reports
    builder
      .addCase(getTransactionReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionReports.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionReports = action.payload;
      })
      .addCase(getTransactionReports.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch transaction reports';
      });

    // Outlet Performance
    builder
      .addCase(getOutletPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOutletPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.outletPerformance = action.payload;
      })
      .addCase(getOutletPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch outlet performance';
      });

    // Terminal Usage
    builder
      .addCase(getTerminalUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminalUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.terminalUsage = action.payload;
      })
      .addCase(getTerminalUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch terminal usage';
      });

    // Revenue Analysis
    builder
      .addCase(getRevenueAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenueAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueAnalysis = action.payload;
      })
      .addCase(getRevenueAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch revenue analysis';
      });

    // Export Report
    builder
      .addCase(exportReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export report';
      });
  },
});

export const { setFilters, clearError, resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;
