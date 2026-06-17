export type ApiResponse<T> = { data: T };

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  role?: number | null;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type Dashboard = {
  revenue: string | number;
  orderCount: number;
  newOrders: number;
  lowStock: { id: string; title: string; stockQty: number }[];
  topProducts: { id: string; title: string; soldCount: number }[];
};

export type AdminUser = SessionUser & {
  phone?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
};

export type Setting = {
  id: string;
  paramKey: string;
  paramValue: string;
  paramName: string;
  groupCode?: string | null;
  description?: string | null;
};

export type OptionItem = { id: string; title: string };

export type AdminProduct = {
  id: string;
  title: string;
  sku: string;
  slug?: string | null;
  categoryId: string;
  brandId: string;
  price: string;
  salePrice: string;
  stockQty: number;
  status?: number | null;
  image?: string | null;
  description?: string | null;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: string | number;
  status?: string | null;
  adminNote?: string | null;
  createdDate?: string | null;
};

export type AdminContact = {
  id: string;
  fullName: string;
  phone: string;
  serviceType?: string | null;
  message?: string | null;
  status?: string | null;
  note?: string | null;
};

export type Tab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'banners'
  | 'sliders'
  | 'news'
  | 'contacts'
  | 'users'
  | 'settings';
