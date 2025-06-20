import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  RefreshCw, Users, ShoppingCart, DollarSign, Filter, Eye,
} from "lucide-react";
import {
  Card, CardContent,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Button, Input
} from "@/components/ui"; // Update these paths as needed
import { containerVariants, itemVariants } from "@/lib/animations";
import useDashboardData from "@/hooks/useDashboardData";

export default function Dashboard() {
  const {
    stats,
    orders,
    statsLoading,
    ordersLoading,
    searchFilter,
    statusFilter,
    setSearchFilter,
    setStatusFilter,
    refreshData,
    updateOrderStatusMutation,
  } = useDashboardData();

  if (statsLoading || ordersLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = stats?.ordersPerDay.map((value, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    orders: value || 0
  })) || [];

  const salesData = stats?.salesTrend.map((value, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
    sales: value || 0
  })) || [];

  const filteredOrders = orders?.filter(order => {
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter || order.paymentStatus === statusFilter;
    const matchesSearch = searchFilter === "" ||
      order.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.orderNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.items.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <motion.div
      className="p-4 md:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Telegram Bot Dashboard</h1>
          <p className="text-muted-foreground">Monitor your bot orders, revenue and customer interactions</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="glass rounded-xl px-4 py-2">
            <span className="text-sm text-muted-foreground">Today:</span>
            <span className="ml-2 font-semibold">{stats?.todayOrders} Orders</span>
          </div>
          <Button onClick={refreshData} className="bg-primary hover:bg-primary/90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0 stat-glow">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<Users className="w-5 h-5 text-orange-400" />} label="Pending Users" value={stats?.pendingUsers} color="bg-orange-500/20" />
              <StatCard icon={<ShoppingCart className="w-5 h-5 text-yellow-400" />} label="Pending Orders" value={stats?.pendingOrders} color="bg-yellow-500/20" />
              <StatCard icon={<ShoppingCart className="w-5 h-5 text-primary" />} label="Total Orders" value={stats?.totalOrders} color="bg-primary/20" />
              <StatCard icon={<DollarSign className="w-5 h-5 text-green-400" />} label="Revenue" value={stats?.revenue} color="bg-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0 card-glow">
          <CardContent className="p-6">
            <OrderFilters
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              count={filteredOrders.length}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    {['Order No', 'Telegram User', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map((title) => (
                      <th key={title} className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {filteredOrders?.map(order => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-3 px-3"><span className="font-mono text-xs">{order.orderNo}</span></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary to-[hsl(280,89%,68%)] rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">{order.customerInitials}</span>
                          </div>
                          <span className="text-xs truncate max-w-24">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3"><span className="text-xs truncate max-w-32 block">{order.items}</span></td>
                      <td className="py-3 px-3"><span className="text-xs font-medium">${order.amount || order.total || '0.00'}</span></td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Select
                          value={order.orderStatus}
                          onValueChange={(value) =>
                            updateOrderStatusMutation.mutate({ orderId: order.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-24 h-7 text-xs bg-card border-muted">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="enroute">En Route</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0 card-glow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Orders per Day</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0 card-glow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
              <div className="space-y-4">
                {stats?.topCategories.map(category => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                      <span>{category.name}</span>
                    </div>
                    <span className="font-semibold">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales Analytics */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0 card-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sales Analytics</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs">7D</Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-primary/20 text-primary">30D</Button>
                  <Button variant="ghost" size="sm" className="text-xs">90D</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatBox title="Total Revenue" value="$12,847" color="text-green-400" note="+23.5% vs last month" />
                <StatBox title="Avg Order Value" value="$68.20" color="text-blue-400" note="+12.1% vs last month" />
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.2} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--primary))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px hsla(258, 90%, 66%, 0.2)"
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      stroke: "hsl(var(--primary))",
                      strokeWidth: 3,
                      fill: "hsl(var(--background))"
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ⬇️ Subcomponents
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function OrderFilters({ searchFilter, setSearchFilter, statusFilter, setStatusFilter, count }: any) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
      <h3 className="text-lg font-semibold">Recent Orders ({count})</h3>
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <Input
            placeholder="Search orders..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-48 h-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-sm bg-card border-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="enroute">En Route</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StatBox({ title, value, color, note }: any) {
  return (
    <div className="bg-card/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className={`text-xs ${color}`}>{note}</p>
    </div>
  );
}
