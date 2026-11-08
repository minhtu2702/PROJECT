import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import RoomList from './pages/rooms/RoomList';
import RoomDetail from './pages/rooms/RoomDetail';
import RoomForm from './pages/rooms/RoomForm';
import TenantList from './pages/tenants/TenantList';
import TenantDetail from './pages/tenants/TenantDetail';
import TenantForm from './pages/tenants/TenantForm';
import ContractList from './pages/contracts/ContractList';
import ContractForm from './pages/contracts/ContractForm';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import ServiceList from './pages/services/ServiceList';
import TenantPortal from './pages/tenant/TenantPortal';

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <Routes>
            {/* Dashboard: Admin & Manager */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Quản lý phòng: Admin & Manager */}
            <Route
              path="/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <RoomList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoomForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <RoomDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <RoomForm />
                </ProtectedRoute>
              }
            />

            {/* Quản lý người thuê: Admin & Manager */}
            <Route
              path="/tenants"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TenantList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TenantForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TenantDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TenantForm />
                </ProtectedRoute>
              }
            />

            {/* Quản lý hợp đồng */}
            <Route
              path="/contracts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ContractList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ContractForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ContractForm />
                </ProtectedRoute>
              }
            />

            {/* Quản lý hóa đơn: Admin & Manager */}
            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <InvoiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />

            {/* Bảng giá dịch vụ: Tất cả các vai trò đều có thể xem */}
            <Route
              path="/services"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'tenant']}>
                  <ServiceList />
                </ProtectedRoute>
              }
            />

            {/* Cổng thông tin cho Khách thuê (Tenant) */}
            <Route
              path="/my-room"
              element={
                <ProtectedRoute allowedRoles={['tenant', 'admin']}>
                  <TenantPortal />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route
              path="*"
              element={
                user?.role === 'tenant' ? (
                  <Navigate to="/my-room" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* All other routes protected inside layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
