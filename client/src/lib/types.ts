export interface DashboardStats {
  totalOrders: number;
  revenue: string;
  pendingUsers: number;
  pendingOrders: number;
  todayOrders: number;
  ordersPerDay: number[];
  topCategories: { name: string; percentage: number; color: string }[];
  salesTrend: number[];
}

export interface XenditBalance {
  balance: string;
  pending: string;
  monthlyVolume: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}
