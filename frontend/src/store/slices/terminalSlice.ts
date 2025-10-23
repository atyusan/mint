import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Terminal {
  id: string;
  outletId: string;
  serialNumber: string;
  model: string;
  status: string;
  location?: string;
  lastSeenAt?: string;
  firmwareVersion?: string;
  batteryLevel?: number;
  isOnline: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  outlet: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

interface TerminalState {
  terminals: Terminal[];
  currentTerminal: Terminal | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: TerminalState = {
  terminals: [],
  currentTerminal: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export const getTerminals = createAsyncThunk(
  'terminal/getTerminals',
  async (
    params: {
      page?: number;
      limit?: number;
      outletId?: string;
      status?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/terminals', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get terminals'
      );
    }
  }
);

export const getTerminalById = createAsyncThunk(
  'terminal/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/terminals/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get terminal'
      );
    }
  }
);

export const createTerminal = createAsyncThunk(
  'terminal/create',
  async (
    terminalData: {
      outletId: string;
      serialNumber: string;
      model: string;
      location?: string;
      metadata?: any;
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
  'terminal/update',
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

export const updateTerminalStatus = createAsyncThunk(
  'terminal/updateStatus',
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/terminals/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update terminal status'
      );
    }
  }
);

export const assignTerminal = createAsyncThunk(
  'terminal/assign',
  async (
    { id, outletId }: { id: string; outletId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/terminals/${id}/assign`, { outletId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign terminal'
      );
    }
  }
);

export const getTerminalStats = createAsyncThunk(
  'terminal/getStats',
  async (terminalId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/terminals/${terminalId}/stats`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get terminal stats'
      );
    }
  }
);

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTerminal: (state, action: PayloadAction<Terminal | null>) => {
      state.currentTerminal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Terminals
      .addCase(getTerminals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminals.fulfilled, (state, action) => {
        state.loading = false;
        state.terminals = action.payload.terminals;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTerminals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Terminal By ID
      .addCase(getTerminalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTerminalById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTerminal = action.payload;
      })
      .addCase(getTerminalById.rejected, (state, action) => {
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
        state.terminals.unshift(action.payload);
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
        if (state.currentTerminal?.id === action.payload.id) {
          state.currentTerminal = action.payload;
        }
      })
      // Update Terminal Status
      .addCase(updateTerminalStatus.fulfilled, (state, action) => {
        const index = state.terminals.findIndex(
          (terminal) => terminal.id === action.payload.id
        );
        if (index !== -1) {
          state.terminals[index] = action.payload;
        }
        if (state.currentTerminal?.id === action.payload.id) {
          state.currentTerminal = action.payload;
        }
      })
      // Assign Terminal
      .addCase(assignTerminal.fulfilled, (state, action) => {
        const index = state.terminals.findIndex(
          (terminal) => terminal.id === action.payload.id
        );
        if (index !== -1) {
          state.terminals[index] = action.payload;
        }
        if (state.currentTerminal?.id === action.payload.id) {
          state.currentTerminal = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentTerminal } = terminalSlice.actions;
export default terminalSlice.reducer;
