import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Payment {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  reference: string;
  status: string;
  processedAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  amount: number;
  fee: number;
  totalAmount: number;
  currency: string;
  status: string;
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  outlet: {
    id: string;
    name: string;
  };
  terminal?: {
    id: string;
    serialNumber: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  payments: Payment[];
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export const getInvoices = createAsyncThunk(
  'invoice/getInvoices',
  async (
    params: {
      page?: number;
      limit?: number;
      outletId?: string;
      status?: string;
      categoryId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get invoices'
      );
    }
  }
);

export const getInvoiceById = createAsyncThunk(
  'invoice/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get invoice'
      );
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoice/create',
  async (
    invoiceData: {
      outletId: string;
      terminalId?: string;
      categoryId?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
      amount: number;
      description?: string;
      dueDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create invoice'
      );
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoice/update',
  async (
    { id, ...updateData }: { id: string } & Partial<Invoice>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/invoices/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update invoice'
      );
    }
  }
);

export const cancelInvoice = createAsyncThunk(
  'invoice/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoices/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel invoice'
      );
    }
  }
);

export const getInvoiceStats = createAsyncThunk(
  'invoice/getStats',
  async (
    params: {
      outletId?: string;
      categoryId?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/invoices/stats', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get invoice stats'
      );
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.currentInvoice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Invoices
      .addCase(getInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Invoice By ID
      .addCase(getInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.currentInvoice?.id === action.payload.id) {
          state.currentInvoice = action.payload;
        }
      })
      // Cancel Invoice
      .addCase(cancelInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(
          (invoice) => invoice.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.currentInvoice?.id === action.payload.id) {
          state.currentInvoice = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
