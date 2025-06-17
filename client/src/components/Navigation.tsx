import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageCircle, 
  CreditCard, 
  Settings, 
  Bot,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { path: "/messages", icon: MessageCircle, label: "Chat Console", page: "messages" },
  { path: "/xendit", icon: CreditCard, label: "Xendit Panel", page: "xendit" },
  { path: "/system", icon: Settings, label: "Maintenance", page: "system" },
];

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass rounded-t-3xl px-6 py-4">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.button
                  className={cn(
                    "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                    isActive && "text-primary"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs">{item.label.split(' ')[0]}</span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 z-40 hidden md:block">
      <div className="glass h-full p-6">
        <motion.div 
          className="flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-[hsl(280,89%,68%)] rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TeleBot Admin</h1>
            <p className="text-sm text-gray-400">v2.1.0</p>
          </div>
        </motion.div>

        <nav className="space-y-3">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.button
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group",
                    isActive && "bg-primary bg-opacity-20 text-primary"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  <div className={cn(
                    "ml-auto w-2 h-2 bg-primary rounded-full transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )} />
                </motion.button>
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <motion.div 
          className="mt-auto pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium">System Online</p>
                <p className="text-xs text-gray-400">Last check: 2s ago</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

export function FloatingOrbs() {
  return (
    <div className="floating-orbs">
      <div className="floating-orb" />
      <div className="floating-orb" />
      <div className="floating-orb" />
    </div>
  );
}
