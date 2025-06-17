import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Square,
  Settings,
  Database,
  Globe,
  Zap,
  Monitor,
  Terminal,
  ChevronRight,
  Link
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { SystemStatus } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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

export default function System() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [diagnosticOutput, setDiagnosticOutput] = useState<string>("");

  const { data: systemStatus, isLoading } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
  });

  const restartBotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bot/restart", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/status"] });
      toast({
        title: "Bot Restart Initiated",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restart bot.",
        variant: "destructive",
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/webhook/update", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Webhook Updated",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update webhook.",
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bot/stop", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/status"] });
      toast({
        title: "Bot Stopped",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to stop bot.",
        variant: "destructive",
      });
    },
  });

  const runDiagnosticMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await apiRequest("POST", "/api/system/diagnostics", { command });
      return response.json();
    },
    onSuccess: (data) => {
      setDiagnosticOutput(prev => prev + "\n" + data.output);
      toast({
        title: "Diagnostic Complete",
        description: "System diagnostic has been completed.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to run diagnostic.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'active':
      case 'connected':
        return 'text-green-400';
      case 'monitoring':
        return 'text-yellow-400';
      case 'offline':
      case 'inactive':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'active':
      case 'connected':
        return 'bg-green-500';
      case 'monitoring':
        return 'bg-yellow-500';
      case 'offline':
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sampleLogs = [
    {
      timestamp: "2024-01-15 14:32:15",
      level: "INFO",
      message: "Bot webhook received new message from user @john_doe",
      levelColor: "bg-green-500/20 text-green-400"
    },
    {
      timestamp: "2024-01-15 14:32:10",
      level: "DEBUG",
      message: "Processing order status update for #ORD-001",
      levelColor: "bg-blue-500/20 text-blue-400"
    },
    {
      timestamp: "2024-01-15 14:31:58",
      level: "WARN",
      message: "Rate limit approaching for Xendit API calls",
      levelColor: "bg-yellow-500/20 text-yellow-400"
    },
  ];

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
          <h1 className="text-3xl font-bold mb-2">System Maintenance</h1>
          <p className="text-muted-foreground">Monitor and control your telegram bot system</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="glass rounded-xl px-4 py-2">
            <span className="text-sm text-muted-foreground">Uptime:</span>
            <span className="ml-2 font-semibold text-green-400">{systemStatus?.uptime}</span>
          </div>
        </div>
      </motion.div>

      {/* System Status Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bot Status</h3>
                <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusDot(systemStatus?.botStatus || '')}`} />
              </div>
              <p className={`text-2xl font-bold mb-2 ${getStatusColor(systemStatus?.botStatus || '')}`}>
                {systemStatus?.botStatus || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">Last response: 2s ago</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Webhook</h3>
                <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusDot(systemStatus?.webhookStatus || '')}`} />
              </div>
              <p className={`text-2xl font-bold mb-2 ${getStatusColor(systemStatus?.webhookStatus || '')}`}>
                {systemStatus?.webhookStatus || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">Connected to Telegram</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Database</h3>
                <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusDot(systemStatus?.dbStatus || '')}`} />
              </div>
              <p className={`text-2xl font-bold mb-2 ${getStatusColor(systemStatus?.dbStatus || '')}`}>
                {systemStatus?.dbStatus || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">Response: 15ms</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">API Endpoints</h3>
                <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusDot(systemStatus?.apiStatus || '')}`} />
              </div>
              <p className={`text-2xl font-bold mb-2 ${getStatusColor(systemStatus?.apiStatus || '')}`}>
                {systemStatus?.apiStatus || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">3/4 healthy</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Diagnostic Tools */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>System Diagnostics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => runDiagnosticMutation.mutate("network")}
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={runDiagnosticMutation.isPending}
              >
                <Wifi className="w-4 h-4" />
                <span>Network</span>
              </Button>
              <Button 
                onClick={() => runDiagnosticMutation.mutate("database")}
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={runDiagnosticMutation.isPending}
              >
                <Database className="w-4 h-4" />
                <span>Database</span>
              </Button>
              <Button 
                onClick={() => runDiagnosticMutation.mutate("bot")}
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={runDiagnosticMutation.isPending}
              >
                <Zap className="w-4 h-4" />
                <span>Bot Health</span>
              </Button>
              <Button 
                onClick={() => runDiagnosticMutation.mutate("system")}
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={runDiagnosticMutation.isPending}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </Button>
            </div>
            {diagnosticOutput && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Diagnostic Output</span>
                  <Button 
                    onClick={() => setDiagnosticOutput("")}
                    variant="ghost" 
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                <Textarea 
                  value={diagnosticOutput}
                  readOnly
                  className="font-mono text-xs bg-muted/50 min-h-[200px]"
                  placeholder="Diagnostic output will appear here..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Controls and Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bot Controls */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bot Controls</h3>
              <div className="space-y-4">
                <Button
                  onClick={() => restartBotMutation.mutate()}
                  disabled={restartBotMutation.isPending}
                  className="w-full flex items-center justify-between p-4 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw className={`w-5 h-5 ${restartBotMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>Restart Bot</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={() => updateWebhookMutation.mutate()}
                  disabled={updateWebhookMutation.isPending}
                  className="w-full flex items-center justify-between p-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <Link className="w-5 h-5" />
                    <span>Update Webhook</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={() => stopBotMutation.mutate()}
                  disabled={stopBotMutation.isPending}
                  className="w-full flex items-center justify-between p-4 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <Square className="w-5 h-5" />
                    <span>Stop Bot</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Information */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">{systemStatus?.version}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Build</span>
                  <span className="font-mono">{systemStatus?.build}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    {systemStatus?.environment}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Server</span>
                  <span>{systemStatus?.server}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Region</span>
                  <span>{systemStatus?.region}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Deploy</span>
                  <span>{systemStatus?.lastDeploy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="font-semibold">{systemStatus?.cpuUsage}%</span>
                </div>
                <Progress value={systemStatus?.cpuUsage} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-semibold">{systemStatus?.memoryUsage}%</span>
                </div>
                <Progress value={systemStatus?.memoryUsage} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Disk Usage</span>
                  <span className="font-semibold">{systemStatus?.diskUsage}%</span>
                </div>
                <Progress value={systemStatus?.diskUsage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Logs */}
      <motion.div variants={itemVariants}>
        <Card className="glass border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent System Logs</h3>
            <div className="bg-card rounded-xl p-4 font-mono text-sm space-y-2 max-h-64 overflow-y-auto">
              {sampleLogs.map((log, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <span className="text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${log.levelColor}`}>
                    {log.level}
                  </span>
                  <span className="text-foreground">{log.message}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}