import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  terminals: Terminal[];
}

interface Terminal {
  id: string;
  serialNumber: string;
  model: string;
  status: string;
  location?: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

interface Merchant {
  id: string;
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
  outlets: Outlet[];
}

interface MerchantState {
  merchant: Merchant | null;
  outlets: Outlet[];
  terminals: Terminal[];
  loading: boolean;
  error: string | null;
}

const initialState: MerchantState = {
  merchant: null,
  outlets: [],
  terminals: [],
  loading: false,
  error: null,
};

export const getMerchantProfile = createAsyncThunk(
  'merchant/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/merchants/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get merchant profile'
      );
    }
  }
);

export const getOutlets = createAsyncThunk(
  'merchant/getOutlets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/outlets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get outlets'
      );
    }
  }
);

export const createOutlet = createAsyncThunk(
  'merchant/createOutlet',
  async (
    outletData: {
      name: string;
      address: string;
      city: string;
      state: string;
      phone?: string;
      email?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/outlets', outletData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create outlet'
      );
    }
  }
);

export const updateOutlet = createAsyncThunk(
  'merchant/updateOutlet',
  async (
    { id, ...updateData }: { id: string } & Partial<Outlet>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/outlets/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update outlet'
      );
    }
  }
);

export const getTerminals = createAsyncThunk(
  'merchant/getTerminals',
  async (outletId: string | undefined, { rejectWithValue }) => {
    try {
      const url = outletId ? `/terminals?outletId=${outletId}` : '/terminals';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get terminals'
      );
    }
  }
);

export const createTerminal = createAsyncThunk(
  'merchant/createTerminal',
  async (
    terminalData: {
      outletId: string;
      serialNumber: string;
      model: string;
      location?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/terminals', terminalData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create terminal'
      );
    }
  }
);

export const updateTerminal = createAsyncThunk(
  'merchant/updateTerminal',
  async (
    { id, ...updateData }: { id: string } & Partial<Terminal>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/terminals/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update terminal'
      );
    }
  }
);

const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMerchant: (state, action: PayloadAction<Merchant>) => {
      state.merchant = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Merchant Profile
      .addCase(getMerchantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.merchant = action.payload;
      })
      .addCase(getMerchantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Outlets
      .addCase(getOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.outlets = action.payload;
      })
      .addCase(getOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Outlet
      .addCase(createOutlet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOutlet.fulfilled, (state, action) => {
        state.loading = false;
        state.outlets.push(action.payload);
      })
      .addCase(createOutlet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Outlet
      .addCase(updateOutlet.fulfilled, (state, action) => {
        const index = state.outlets.findIndex(
          (outlet) => outlet.id === action.payload.id
        );
        if (index !== -1) {
          state.outlets[index] = action.payload;
        }
      })
      // Get Terminals
      .addCase(getTerminals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminals.fulfilled, (state, action) => {
        state.loading = false;
        state.terminals = action.payload;
      })
      .addCase(getTerminals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Terminal
      .addCase(createTerminal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTerminal.fulfilled, (state, action) => {
        state.loading = false;
        state.terminals.push(action.payload);
      })
      .addCase(createTerminal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Terminal
      .addCase(updateTerminal.fulfilled, (state, action) => {
        const index = state.terminals.findIndex(
          (terminal) => terminal.id === action.payload.id
        );
        if (index !== -1) {
          state.terminals[index] = action.payload;
        }
      });
  },
});

export const { clearError, setMerchant } = merchantSlice.actions;
export default merchantSlice.reducer;
