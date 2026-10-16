
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Welcome from './ pages/Welcome';
import Register from './ pages/Register';
import Login from './ pages/Login';
import Dashboard from './ pages/Dashboard';
import Savings from './ pages/Savings';
import Loans from './ pages/Loans';
import VAT from './ pages/Vat';

// Protect all authenticated pages
function ProtectedRoute() {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
    console.warn(
      'Access denied: No authentication token found.'
    );

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/levels/savings" element={<Savings />} />
          <Route path="/levels/loans" element={<Loans />} />
          <Route path="/levels/vat" element={<VAT />} />
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
