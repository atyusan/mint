import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/api';

interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  taxId?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    lastLoginAt?: string;
  };
  outlets: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  _count: {
    outlets: number;
    payouts: number;
  };
}

interface MerchantStats {
  totalOutlets: number;
  activeOutlets: number;
  totalTerminals: number;
  activeTerminals: number;
  totalInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
  successRate: number;
}

interface MerchantFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  businessType?: string;
}

interface MerchantState {
  merchants: Merchant[];
  currentMerchant: Merchant | null;
  merchantStats: MerchantStats | null;
  loading: boolean;
  error: string | null;
  filters: MerchantFilters;
  total: number;
  page: number;
  limit: number;
}

const initialState: MerchantState = {
  merchants: [],
  currentMerchant: null,
  merchantStats: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  total: 0,
  page: 1,
  limit: 10,
};

// Async thunks
export const getMerchants = createAsyncThunk(
  'merchants/getMerchants',
  async (filters: MerchantFilters = {}) => {
    const response = await api.get('/merchants', { params: filters });
    return response.data;
  }
);

export const getMerchantById = createAsyncThunk(
  'merchants/getMerchantById',
  async (id: string) => {
    const response = await api.get(`/merchants/${id}`);
    return response.data;
  }
);

export const getMyMerchant = createAsyncThunk(
  'merchants/getMyMerchant',
  async () => {
    const response = await api.get('/merchants/my-merchant');
    return response.data;
  }
);

export const getMerchantStats = createAsyncThunk(
  'merchants/getMerchantStats',
  async (id?: string) => {
    const endpoint = id
      ? `/merchants/${id}/stats`
      : '/merchants/my-merchant/stats';
    const response = await api.get(endpoint);
    return response.data;
  }
);

export const createMerchant = createAsyncThunk(
  'merchants/createMerchant',
  async (merchantData: any) => {
    const response = await api.post('/merchants', merchantData);
    return response.data;
  }
);

export const updateMerchant = createAsyncThunk(
  'merchants/updateMerchant',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await api.put(`/merchants/${id}`, data);
    return response.data;
  }
);

export const deleteMerchant = createAsyncThunk(
  'merchants/deleteMerchant',
  async (id: string) => {
    const response = await api.delete(`/merchants/${id}`);
    return response.data;
  }
);

export const onboardMerchant = createAsyncThunk(
  'merchants/onboardMerchant',
  async (onboardingData: any) => {
    const response = await api.post('/merchants/onboard', onboardingData);
    return response.data;
  }
);

export const searchMerchants = createAsyncThunk(
  'merchants/searchMerchants',
  async ({ query, limit = 10 }: { query: string; limit?: number }) => {
    const response = await api.get('/merchants/search', {
      params: { q: query, limit },
    });
    return response.data;
  }
);

// Slice
const merchantSlice = createSlice({
  name: 'merchants',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MerchantFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetMerchants: (state) => initialState,
    setCurrentMerchant: (state, action: PayloadAction<Merchant | null>) => {
      state.currentMerchant = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get merchants
      .addCase(getMerchants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchants.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getMerchants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch merchants';
      })
      // Get merchant by ID
      .addCase(getMerchantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
      })
      .addCase(getMerchantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch merchant';
      })
      // Get my merchant
      .addCase(getMyMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
      })
      .addCase(getMyMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch merchant';
      })
      // Get merchant stats
      .addCase(getMerchantStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantStats.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantStats = action.payload;
      })
      .addCase(getMerchantStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch merchant stats';
      })
      // Create merchant
      .addCase(createMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants.unshift(action.payload);
      })
      .addCase(createMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create merchant';
      })
      // Update merchant
      .addCase(updateMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.merchants.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.merchants[index] = action.payload;
        }
        if (state.currentMerchant?.id === action.payload.id) {
          state.currentMerchant = action.payload;
        }
      })
      .addCase(updateMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update merchant';
      })
      // Delete merchant
      .addCase(deleteMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = state.merchants.filter(
          (m) => m.id !== action.meta.arg
        );
      })
      .addCase(deleteMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete merchant';
      })
      // Onboard merchant
      .addCase(onboardMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(onboardMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
      })
      .addCase(onboardMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to onboard merchant';
      })
      // Search merchants
      .addCase(searchMerchants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMerchants.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = action.payload;
      })
      .addCase(searchMerchants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search merchants';
      });
  },
});

export const { setFilters, clearError, resetMerchants, setCurrentMerchant } =
  merchantSlice.actions;
export default merchantSlice.reducer;
