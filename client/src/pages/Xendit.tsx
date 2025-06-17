import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  ArrowDownCircle,
  CreditCard,
  Smartphone,
  Building,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { Transaction } from "@shared/schema";
import type { XenditBalance } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function Xendit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: balance, isLoading: balanceLoading } = useQuery<XenditBalance>({
    queryKey: ["/api/xendit/balance"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const refreshBalanceMutation = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/xendit/balance"] });
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Balance Refreshed",
        description: "Xendit balance has been refreshed successfully.",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest("POST", "/api/xendit/withdraw", { amount });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/xendit/balance"] });
      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawal of ${data.amount} has been initiated. Transaction ID: ${data.transactionId}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate withdrawal.",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    // In a real app, this would open a withdrawal modal
    withdrawMutation.mutate("1000.00");
  };

  const transactionChartData = [
    { day: "1", amount: 1200 },
    { day: "2", amount: 1950 },
    { day: "3", amount: 1400 },
    { day: "4", amount: 2200 },
    { day: "5", amount: 1800 },
    { day: "6", amount: 1600 },
    { day: "7", amount: 2400 },
  ];

  if (balanceLoading || transactionsLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">Xendit Payment Panel</h1>
          <p className="text-muted-foreground">Monitor your balance and transaction analytics</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Button 
            onClick={() => refreshBalanceMutation.mutate()}
            disabled={refreshBalanceMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshBalanceMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Balance
          </Button>
        </div>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
          <Card className="glass border-0 relative overflow-hidden animate-pulse-glow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(190,100%,50%)] to-transparent opacity-20 rounded-full transform translate-x-16 -translate-y-16" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Balance</h3>
                <Wallet className="w-6 h-6 text-[hsl(190,100%,50%)]" />
              </div>
              <p className="text-4xl font-bold mb-2">{balance?.balance}</p>
              <p className="text-green-400 text-sm mb-6">+$2,450 this week</p>
              
              <Button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-primary hover:from-primary hover:to-[hsl(190,100%,50%)]"
              >
                <ArrowDownCircle className="w-5 h-5 mr-2" />
                {withdrawMutation.isPending ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Balance */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending</h3>
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold mb-2">{balance?.pending}</p>
              <p className="text-yellow-400 text-sm">Processing 12 transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Volume */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Volume</h3>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold mb-2">{balance?.monthlyVolume}</p>
              <p className="text-green-400 text-sm">+18% from last month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transaction Chart and Recent Transactions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Transaction Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Transactions</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={transactionChartData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(190, 100%, 50%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {transactions?.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-muted last:border-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        <ArrowDownRight className={`w-5 h-5 ${
                          transaction.type === 'credit' 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.transactionId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Connected Payment Methods</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Primary</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">E-Wallet</p>
                    <p className="text-sm text-muted-foreground">GoPay, OVO</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium">Retail Outlets</p>
                    <p className="text-sm text-muted-foreground">Alfamart, Indomaret</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
