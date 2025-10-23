import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface PayoutMethod {
  id: string;
  methodType: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  bankName?: string;
  isDefault: boolean;
  isActive: boolean;
  metadata?: any;
}

interface Payout {
  id: string;
  merchantId: string;
  payoutMethodId: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  status: string;
  frequency: string;
  reference: string;
  processedAt?: string;
  scheduledFor?: string;
  metadata?: any;
  createdAt: string;
  payoutMethod: PayoutMethod;
}

interface PayoutState {
  payouts: Payout[];
  payoutMethods: PayoutMethod[];
  currentPayout: Payout | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    summary: {
      totalPayouts: number;
      completedPayouts: number;
      pendingPayouts: number;
      failedPayouts: number;
      successRate: number;
    };
    amounts: {
      total: number;
      completed: number;
      pending: number;
      available: number;
    };
  } | null;
}

const initialState: PayoutState = {
  payouts: [],
  payoutMethods: [],
  currentPayout: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  stats: null,
};

export const getPayouts = createAsyncThunk(
  'payout/getPayouts',
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      frequency?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/payouts', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get payouts'
      );
    }
  }
);

export const getPayoutMethods = createAsyncThunk(
  'payout/getPayoutMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payouts/methods');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get payout methods'
      );
    }
  }
);

export const createPayoutMethod = createAsyncThunk(
  'payout/createPayoutMethod',
  async (
    methodData: {
      methodType: string;
      accountName: string;
      accountNumber: string;
      bankCode?: string;
      bankName?: string;
      isDefault?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/payouts/methods', methodData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create payout method'
      );
    }
  }
);

export const updatePayoutMethod = createAsyncThunk(
  'payout/updatePayoutMethod',
  async (
    { id, ...updateData }: { id: string } & Partial<PayoutMethod>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/payouts/methods/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update payout method'
      );
    }
  }
);

export const deletePayoutMethod = createAsyncThunk(
  'payout/deletePayoutMethod',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/payouts/methods/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete payout method'
      );
    }
  }
);

export const createPayout = createAsyncThunk(
  'payout/createPayout',
  async (
    payoutData: {
      payoutMethodId: string;
      amount: number;
      frequency: string;
      scheduledFor?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/payouts', payoutData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create payout'
      );
    }
  }
);

export const getPayoutStats = createAsyncThunk(
  'payout/getPayoutStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payouts/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get payout stats'
      );
    }
  }
);

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPayout: (state, action: PayloadAction<Payout | null>) => {
      state.currentPayout = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Payouts
      .addCase(getPayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = action.payload.payouts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Payout Methods
      .addCase(getPayoutMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayoutMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.payoutMethods = action.payload;
      })
      .addCase(getPayoutMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Payout Method
      .addCase(createPayoutMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayoutMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.payoutMethods.push(action.payload);
      })
      .addCase(createPayoutMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Payout Method
      .addCase(updatePayoutMethod.fulfilled, (state, action) => {
        const index = state.payoutMethods.findIndex(
          (method) => method.id === action.payload.id
        );
        if (index !== -1) {
          state.payoutMethods[index] = action.payload;
        }
      })
      // Delete Payout Method
      .addCase(deletePayoutMethod.fulfilled, (state, action) => {
        state.payoutMethods = state.payoutMethods.filter(
          (method) => method.id !== action.payload
        );
      })
      // Create Payout
      .addCase(createPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayout.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts.unshift(action.payload);
      })
      .addCase(createPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Payout Stats
      .addCase(getPayoutStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayoutStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getPayoutStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPayout } = payoutSlice.actions;
export default payoutSlice.reducer;
