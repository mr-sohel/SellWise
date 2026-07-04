import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { ProductListPage } from './features/products/ProductListPage'
import { CreateProductPage } from './features/products/CreateProductPage'
import { BulkImportPage } from './features/products/BulkImportPage'
import { OrderListPage } from './features/orders/OrderListPage'
import { CreateOrderPage } from './features/orders/CreateOrderPage'
import { CustomerListPage } from './features/customers/CustomerListPage'
import { ExpenseListPage } from './features/expenses/ExpenseListPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ReportGeneratorPage } from './features/reports/ReportGeneratorPage'
import { SettingsLayout } from './features/settings/SettingsLayout'
import { StaffManagementPage } from './features/settings/StaffManagementPage'
import { ProfileSettingsPage } from './features/settings/ProfileSettingsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes Wrapper */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<CreateProductPage />} />
            <Route path="/products/import" element={<BulkImportPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/expenses" element={<ExpenseListPage />} />
            <Route path="/reports" element={<ReportGeneratorPage />} />

            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/profile" replace />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
              <Route path="staff" element={<StaffManagementPage />} />
            </Route>
          </Route>

          {/* Redirect to login by default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App