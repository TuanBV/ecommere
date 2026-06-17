export const tokenKey = 'core_admin_access_token';
export const refreshKey = 'core_admin_refresh_token';
export const userKey = 'core_admin_user';

export function roleLabel(role?: number | null) {
  if (role === 0) return 'Admin';
  if (role === 1) return 'Nhân viên';
  return 'Khách hàng';
}
