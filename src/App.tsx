import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@context/AuthContext"
import { CartProvider } from "@context/CartContext"
import { WishlistProvider } from "@context/WishlistContext"
import { OrdersProvider } from "@context/OrdersContext"
import { AppToastProvider } from "@context/ToastContext"
import { RequireAuth } from "@components/shared/RequireAuth"

// Customer Layout & Pages
import { CustomerLayout } from "@components/layout/CustomerLayout"
import { HomePage } from "@pages/customer/HomePage"
import { ShopPage } from "@pages/customer/ShopPage"
import { CategoriesPage } from "@pages/customer/CategoriesPage"
import { CategoryPage } from "@pages/customer/CategoryPage"
import { DealsPage } from "@pages/customer/DealsPage"
import { ProductPage } from "@pages/customer/ProductPage"
import { CartPage } from "@pages/customer/CartPage"
import { CheckoutPage } from "@pages/customer/CheckoutPage"
import { OrdersPage } from "@pages/customer/OrdersPage"
import { OrderDetailPage } from "@pages/customer/OrderDetailPage"
import { WishlistPage } from "@pages/customer/WishlistPage"
import { NotificationsPage } from "@pages/customer/NotificationsPage"
import { AccountPage } from "@pages/customer/AccountPage"
import { SignInPage } from "@pages/auth/SignInPage"
import { SignUpPage } from "@pages/auth/SignUpPage"
import { ForgotPasswordPage } from "@pages/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "@pages/auth/ResetPasswordPage"
import { VerifyEmailPage } from "@pages/auth/VerifyEmailPage"

// Staff Layout & Pages
import { StaffLayout } from "@components/layout/StaffLayout"
import { StaffDashboardPage } from "@pages/staff/StaffDashboardPage"
import { StaffOrdersPage } from "@pages/staff/StaffOrdersPage"
import { StaffOrderDetailPage } from "@pages/staff/StaffOrderDetailPage"
import { StaffInventoryPage } from "@pages/staff/StaffInventoryPage"
import { StaffProfilePage } from "@pages/staff/StaffProfilePage"

// Rider Layout & Pages
import { RiderLayout } from "@components/layout/RiderLayout"
import { RiderDashboardPage } from "@pages/rider/RiderDashboardPage"
import { RiderDeliveriesPage } from "@pages/rider/RiderDeliveriesPage"
import { RiderDeliveryDetailPage } from "@pages/rider/RiderDeliveryDetailPage"
import { RiderHistoryPage } from "@pages/rider/RiderHistoryPage"
import { RiderEarningsPage } from "@pages/rider/RiderEarningsPage"
import { RiderProfilePage } from "@pages/rider/RiderProfilePage"

// Admin Layout & Pages
import { AdminLayout } from "@components/layout/AdminLayout"
import { AdminDashboardPage } from "@pages/admin/AdminDashboardPage"
import { AdminOrdersPage } from "@pages/admin/AdminOrdersPage"
import { AdminProductsPage } from "@pages/admin/AdminProductsPage"
import { AdminCategoriesPage } from "@pages/admin/AdminCategoriesPage"
import { AdminBrandsPage } from "@pages/admin/AdminBrandsPage"
import { AdminInventoryPage } from "@pages/admin/AdminInventoryPage"
import { AdminCustomersPage } from "@pages/admin/AdminCustomersPage"
import { AdminCustomerDetailPage } from "@pages/admin/AdminCustomerDetailPage"
import { AdminStaffPage } from "@pages/admin/AdminStaffPage"
import { AdminRidersPage } from "@pages/admin/AdminRidersPage"
import { AdminDeliveriesPage } from "@pages/admin/AdminDeliveriesPage"
import { AdminCouponsPage } from "@pages/admin/AdminCouponsPage"
import { AdminPromotionsPage } from "@pages/admin/AdminPromotionsPage"
import { AdminReviewsPage } from "@pages/admin/AdminReviewsPage"
import { AdminSupportPage } from "@pages/admin/AdminSupportPage"
import { AdminReportsPage } from "@pages/admin/AdminReportsPage"
import { AdminNotificationsPage } from "@pages/admin/AdminNotificationsPage"
import { AdminSettingsPage } from "@pages/admin/AdminSettingsPage"

// Super Admin Layout & Pages
import { SuperAdminLayout } from "@components/layout/SuperAdminLayout"
import { SuperAdminDashboardPage } from "@pages/super-admin/SuperAdminDashboardPage"
import { SuperAdminAdminsPage } from "@pages/super-admin/SuperAdminAdminsPage"
import { SuperAdminPermissionsPage } from "@pages/super-admin/SuperAdminPermissionsPage"
import { SuperAdminSecurityPage } from "@pages/super-admin/SuperAdminSecurityPage"
import { SuperAdminAuditLogsPage } from "@pages/super-admin/SuperAdminAuditLogsPage"
import { SuperAdminSystemSettingsPage } from "@pages/super-admin/SuperAdminSystemSettingsPage"

// Error Pages
import { NotFoundPage, ForbiddenPage, ServerErrorPage, OfflinePage } from "@pages/ErrorPages"

export default function App() {
  return (
    <AuthProvider>
      <AppToastProvider>
        <CartProvider>
          <WishlistProvider>
            <OrdersProvider>
              <Routes>
                {/* Customer Public & Protected Routes */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:category" element={<CategoryPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/products/:product" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* Customer Authenticated Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <RequireAuth>
                        <CheckoutPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <RequireAuth>
                        <OrdersPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <RequireAuth>
                        <OrderDetailPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <RequireAuth>
                        <NotificationsPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <RequireAuth>
                        <AccountPage />
                      </RequireAuth>
                    }
                  />
                </Route>

                {/* Auth Routes */}
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Staff Protected Routes */}
                <Route
                  element={
                    <RequireAuth roles={["staff", "admin", "super-admin"]}>
                      <StaffLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/staff" element={<StaffDashboardPage />} />
                  <Route path="/staff/orders" element={<StaffOrdersPage />} />
                  <Route path="/staff/orders/:id" element={<StaffOrderDetailPage />} />
                  <Route path="/staff/inventory" element={<StaffInventoryPage />} />
                  <Route path="/staff/profile" element={<StaffProfilePage />} />
                </Route>

                {/* Rider Protected Routes */}
                <Route
                  element={
                    <RequireAuth roles={["rider", "admin", "super-admin"]}>
                      <RiderLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/rider" element={<RiderDashboardPage />} />
                  <Route path="/rider/deliveries" element={<RiderDeliveriesPage />} />
                  <Route path="/rider/deliveries/:id" element={<RiderDeliveryDetailPage />} />
                  <Route path="/rider/history" element={<RiderHistoryPage />} />
                  <Route path="/rider/earnings" element={<RiderEarningsPage />} />
                  <Route path="/rider/profile" element={<RiderProfilePage />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route
                  element={
                    <RequireAuth roles={["admin", "super-admin"]}>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/brands" element={<AdminBrandsPage />} />
                  <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                  <Route path="/admin/customers" element={<AdminCustomersPage />} />
                  <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
                  <Route path="/admin/staff" element={<AdminStaffPage />} />
                  <Route path="/admin/riders" element={<AdminRidersPage />} />
                  <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
                  <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                  <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
                  <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                  <Route path="/admin/support" element={<AdminSupportPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                  <Route path="/admin/settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Super Admin Protected Routes */}
                <Route
                  element={
                    <RequireAuth roles={["super-admin"]}>
                      <SuperAdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
                  <Route path="/super-admin/admins" element={<SuperAdminAdminsPage />} />
                  <Route path="/super-admin/permissions" element={<SuperAdminPermissionsPage />} />
                  <Route path="/super-admin/security" element={<SuperAdminSecurityPage />} />
                  <Route path="/super-admin/audit-logs" element={<SuperAdminAuditLogsPage />} />
                  <Route path="/super-admin/system-settings" element={<SuperAdminSystemSettingsPage />} />
                </Route>

                {/* Error Pages */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="/offline" element={<OfflinePage />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </OrdersProvider>
          </WishlistProvider>
        </CartProvider>
      </AppToastProvider>
    </AuthProvider>
  )
}
