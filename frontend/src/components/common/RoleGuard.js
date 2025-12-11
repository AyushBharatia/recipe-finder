import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Component to conditionally render children based on user role and ownership
 *
 * @param {React.ReactNode} children - Content to render if conditions are met
 * @param {string[]} allowedRoles - Array of roles that can see the children (empty = any authenticated user)
 * @param {boolean} requireOwnership - If true, also check if user owns the resource
 * @param {string} ownerId - The owner's user ID (for ownership check)
 * @param {React.ReactNode} fallback - Optional content to render if conditions are not met
 *
 * @example
 * // Show only for admins
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Show for owner or admin
 * <RoleGuard allowedRoles={['admin', 'user']} requireOwnership={true} ownerId={recipe.createdBy}>
 *   <EditButton />
 * </RoleGuard>
 */
const RoleGuard = ({
  children,
  allowedRoles = [],
  requireOwnership = false,
  ownerId = null,
  fallback = null,
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Not authenticated - don't show anything
  if (!isAuthenticated) {
    return fallback;
  }

  // If no specific roles required, just need authentication
  if (allowedRoles.length === 0 && !requireOwnership) {
    return <>{children}</>;
  }

  // Check role permission (if roles are specified)
  const hasRolePermission =
    allowedRoles.length === 0 || allowedRoles.includes(user?.role);

  // Check ownership if required
  // Admin always has ownership permission
  const hasOwnership =
    !requireOwnership ||
    isAdmin() ||
    (ownerId && user?._id === ownerId);

  // Both conditions must be met
  if (hasRolePermission && hasOwnership) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
