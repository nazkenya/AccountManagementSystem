import React from 'react'
import CustomersPage from '../pages/CustomersPage'
import CustomerDetail from '../pages/CustomerDetail'
import Dashboard from '../pages/Dashboard'
import NotAuthorized from '../pages/NotAuthorized'
import Login from '../pages/Login'
import EcrmWorkspace from '../pages/EcrmWorkspace'
import ValidationPage from '../pages/ValidationPage'
import AccountProfile from '../pages/AccountProfile'
import { ROLES } from '../auth/roles'

// Define routes and which roles can access them.
// Add your new role to the arrays below as needed.
export const routes = [
  { path: '/login', element: <Login />, public: true },
  { path: '/403', element: <NotAuthorized />, public: true },

  // Protected routes
  { path: '/', element: <Dashboard />, roles: [ROLES.admin, ROLES.sales, ROLES.viewer, ROLES.manager] },
  { path: '/customers', element: <CustomersPage />, roles: [ROLES.admin, ROLES.sales, ROLES.manager] },
  { path: '/customers/:id', element: <CustomerDetail />, roles: [ROLES.sales] },
  { path: '/customers/:id/account-profile', element: <AccountProfile />, roles: [ROLES.sales] },
  { path: '/ecrm-workspace', element: <EcrmWorkspace />, roles: [ROLES.manager] },
  { path: '/ecrm-workspace/validation', element: <ValidationPage />, roles: [ROLES.manager] },
  // Examples for future pages:
  // { path: '/produk', element: <ProdukPage />, roles: [ROLES.admin, ROLES.manager] },
  // { path: '/monitoring', element: <MonitoringPage />, roles: [ROLES.admin, ROLES.manager] },
  // { path: '/sales-funnel', element: <SalesFunnelPage />, roles: [ROLES.admin, ROLES.sales] },
]