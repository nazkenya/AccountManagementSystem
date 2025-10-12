// Declare known roles in one place.
// Add your new role here, e.g., 'manager' or 'bud' — keep it consistent across config.
export const ROLES = {
  admin: 'admin',
  sales: 'sales',
  viewer: 'viewer',
  // Add your new role key:
  manager: 'manager',
}

// Flat list of all role values for dropdowns and validation
export const ALL_ROLES = Object.values(ROLES)