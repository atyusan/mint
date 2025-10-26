import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { initializeAuth } from './store/slices/authSlice';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import {
  DashboardPage,
  InvoicesPage,
  TerminalsPage,
  ReportsPage,
  PayoutsPage,
  MerchantsPage,
  MerchantProfilePage,
  MerchantOnboardingPage,
  OutletsPage,
} from './pages';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppRoutes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Initialize authentication on app startup
    dispatch(initializeAuth());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/invoices' element={<InvoicesPage />} />
        <Route path='/terminals' element={<TerminalsPage />} />
        <Route path='/reports' element={<ReportsPage />} />
        <Route path='/payouts' element={<PayoutsPage />} />
        <Route path='/merchants' element={<MerchantsPage />} />
        <Route path='/outlets' element={<OutletsPage />} />
        <Route path='/merchant-profile' element={<MerchantProfilePage />} />
        <Route
          path='/merchant-onboarding'
          element={<MerchantOnboardingPage />}
        />
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
