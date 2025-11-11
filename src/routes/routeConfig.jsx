import React from 'react'
import CustomersPage from '../pages/CustomersPage'
import CustomerDetail from '../pages/CustomerDetail'
import Dashboard from '../pages/Dashboard'
import NotAuthorized from '../pages/NotAuthorized'
import Login from '../pages/Login'
import EcrmWorkspace from '../pages/EcrmWorkspace'
import ValidationPage from '../pages/ValidationPage'
import AccountProfile from '../pages/AccountProfile'
import AmProfile from '../pages/Profile/AmProfile' 
import { ROLES } from '../auth/roles'

export const routes = [
  { path: '/login', element: <Login />, public: true },
  { path: '/403', element: <NotAuthorized />, public: true },

  { path: '/', element: <Dashboard />, roles: [ROLES.admin, ROLES.sales, ROLES.viewer, ROLES.manager] },
  { path: '/customers', element: <CustomersPage />, roles: [ROLES.admin, ROLES.sales, ROLES.manager] },
  { path: '/customers/:id', element: <CustomerDetail />, roles: [ROLES.sales] },
  { path: '/customers/:id/account-profile', element: <AccountProfile />, roles: [ROLES.sales] },
  { path: '/ecrm-workspace', element: <EcrmWorkspace />, roles: [ROLES.manager, ROLES.admin] },
  { path: '/ecrm-workspace/validation', element: <ValidationPage />, roles: [ROLES.manager, ROLES.admin] },
  { path: '/profile/am', element: <AmProfile />, roles: [ROLES.manager, ROLES.admin] },
]