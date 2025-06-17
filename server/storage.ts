import { mongodb } from "./db";
import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId;
  id?: number;
  orderNo: string;
  customerName: string;
  customerInitials: string;
  items: string;
  deliveryInfo: string | null;
  paymentStatus: string;
  orderStatus: string;
  amount: string;
  createdAt: Date;
}

export interface Conversation {
  _id?: ObjectId;
  id?: number;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  platform: string;
  createdAt: Date;
}

export interface Message {
  _id?: ObjectId;
  id?: number;
  conversationId: ObjectId | null;
  content: string;
  isFromBot: boolean;
  timestamp: string;
  createdAt: Date;
}

export interface Transaction {
  _id?: ObjectId;
  id?: number;
  transactionId: string;
  description: string;
  amount: string;
  type: string;
  time: string;
  createdAt: Date;
}

export interface SystemStatus {
  _id?: ObjectId;
  id?: number;
  botStatus: string;
  webhookStatus: string;
  dbStatus: string;
  apiStatus: string;
  uptime: string;
  version: string;
  build: string;
  environment: string;
  server: string;
  region: string;
  lastDeploy: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  updatedAt?: Date;
}

export interface IStorage {
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: Omit<Order, '_id' | 'id' | 'createdAt'>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: Omit<Conversation, '_id' | 'id' | 'createdAt'>): Promise<Conversation>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: Omit<Message, '_id' | 'id' | 'createdAt'>): Promise<Message>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, '_id' | 'id' | 'createdAt'>): Promise<Transaction>;

  // System Status
  getSystemStatus(): Promise<SystemStatus | undefined>;
  updateSystemStatus(status: Omit<SystemStatus, '_id' | 'id' | 'updatedAt'>): Promise<SystemStatus>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalOrders: number;
    revenue: string;
    activeUsers: number;
    conversion: string;
    todayOrders: number;
    ordersPerDay: number[];
    topCategories: { name: string; percentage: number; color: string }[];
    salesTrend: number[];
  }>;

  // Xendit Balance
  getXenditBalance(): Promise<{
    balance: string;
    pending: string;
    monthlyVolume: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getOrders(): Promise<Order[]> {
    const db = await mongodb();
    const orders = await db.collection<Order>('orders').find({}).toArray();
    return orders.map(order => ({ ...order, id: order._id?.toString() }));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const db = await mongodb();
    const order = await db.collection<Order>('orders').findOne({ _id: new ObjectId(id) });
    return order ? { ...order, id: order._id?.toString() } : undefined;
  }

  async createOrder(insertOrder: Omit<Order, '_id' | 'id' | 'createdAt'>): Promise<Order> {
    const db = await mongodb();
    const orderData = { ...insertOrder, createdAt: new Date() };
    const result = await db.collection<Order>('orders').insertOne(orderData);
    return { ...orderData, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const db = await mongodb();
    const result = await db.collection<Order>('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { orderStatus: status } },
      { returnDocument: 'after' }
    );
    return result ? { ...result, id: result._id?.toString() } : undefined;
  }

  async getConversations(): Promise<Conversation[]> {
    const db = await mongodb();
    const conversations = await db.collection<Conversation>('conversations').find({}).toArray();
    return conversations.map(conv => ({ ...conv, id: conv._id?.toString() }));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const db = await mongodb();
    const conversation = await db.collection<Conversation>('conversations').findOne({ _id: new ObjectId(id) });
    return conversation ? { ...conversation, id: conversation._id?.toString() } : undefined;
  }

  async createConversation(insertConversation: Omit<Conversation, '_id' | 'id' | 'createdAt'>): Promise<Conversation> {
    const db = await mongodb();
    const conversationData = { ...insertConversation, createdAt: new Date() };
    const result = await db.collection<Conversation>('conversations').insertOne(conversationData);
    return { ...conversationData, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const db = await mongodb();
    const messages = await db.collection<Message>('messages').find({ 
      conversationId: new ObjectId(conversationId) 
    }).toArray();
    return messages.map(msg => ({ ...msg, id: msg._id?.toString() }));
  }

  async createMessage(insertMessage: Omit<Message, '_id' | 'id' | 'createdAt'>): Promise<Message> {
    const db = await mongodb();
    const messageData = { 
      ...insertMessage, 
      conversationId: insertMessage.conversationId ? new ObjectId(insertMessage.conversationId as string) : null,
      createdAt: new Date() 
    };
    const result = await db.collection<Message>('messages').insertOne(messageData);
    return { ...messageData, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async getTransactions(): Promise<Transaction[]> {
    const db = await mongodb();
    const transactions = await db.collection<Transaction>('transactions').find({}).toArray();
    return transactions.map(txn => ({ ...txn, id: txn._id?.toString() }));
  }

  async createTransaction(insertTransaction: Omit<Transaction, '_id' | 'id' | 'createdAt'>): Promise<Transaction> {
    const db = await mongodb();
    const transactionData = { ...insertTransaction, createdAt: new Date() };
    const result = await db.collection<Transaction>('transactions').insertOne(transactionData);
    return { ...transactionData, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async getSystemStatus(): Promise<SystemStatus | undefined> {
    const db = await mongodb();
    const status = await db.collection<SystemStatus>('systemStatus').findOne({});
    return status ? { ...status, id: status._id?.toString() } : undefined;
  }

  async updateSystemStatus(status: Omit<SystemStatus, '_id' | 'id' | 'updatedAt'>): Promise<SystemStatus> {
    const db = await mongodb();
    const statusData = { ...status, updatedAt: new Date() };

    const result = await db.collection<SystemStatus>('systemStatus').findOneAndUpdate(
      {},
      { $set: statusData },
      { upsert: true, returnDocument: 'after' }
    );

    return { ...result!, id: result!._id?.toString() };
  }

  async getDashboardStats() {
    const db = await mongodb();
    const orders = await db.collection<Order>('orders').find({}).toArray();
    const totalOrders = orders.length;
    
    // Calculate revenue from both old format (amount) and new format (total)
    const revenue = orders.reduce((sum, order) => {
      if (order.total) {
        return sum + order.total;
      } else if (order.amount) {
        return sum + parseFloat(order.amount);
      }
      return sum;
    }, 0);

    // Get pending orders from pendingorderapprovals collection
    const pendingOrderApprovals = await db.collection('pendingorderapprovals').find({}).toArray();
    const pendingOrders = pendingOrderApprovals.length;

    // Get pending users from pendingapprovals collection
    const pendingApprovals = await db.collection('pendingapprovals').find({}).toArray();
    const pendingUsers = pendingApprovals.length;

    // Calculate today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    }).length;

    // Calculate orders per day for the last 7 days
    const ordersPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= day && orderDate < nextDay;
      }).length;
      
      ordersPerDay.push(dayOrders);
    }

    // Analyze order items to get categories
    const categoryCount = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemStr = typeof item === 'string' ? item : JSON.stringify(item);
          // Simple categorization based on keywords
          if (itemStr.toLowerCase().includes('phone') || itemStr.toLowerCase().includes('electronic')) {
            categoryCount['Electronics'] = (categoryCount['Electronics'] || 0) + 1;
          } else if (itemStr.toLowerCase().includes('food') || itemStr.toLowerCase().includes('drink')) {
            categoryCount['Food'] = (categoryCount['Food'] || 0) + 1;
          } else if (itemStr.toLowerCase().includes('cloth') || itemStr.toLowerCase().includes('shirt')) {
            categoryCount['Clothing'] = (categoryCount['Clothing'] || 0) + 1;
          } else {
            categoryCount['Other'] = (categoryCount['Other'] || 0) + 1;
          }
        });
      }
    });

    // Convert to percentages
    const totalCategoryItems = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    const topCategories = Object.entries(categoryCount).map(([name, count], index) => ({
      name,
      percentage: totalCategoryItems > 0 ? Math.round((count / totalCategoryItems) * 100) : 0,
      color: ["#6366F1", "#8B5CF6", "#00D4FF", "#22C55E"][index % 4]
    }));

    // Calculate monthly revenue trend (last 6 months)
    const salesTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      month.setDate(1);
      month.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(month);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const monthRevenue = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= month && orderDate < nextMonth;
      }).reduce((sum, order) => {
        if (order.total) {
          return sum + order.total;
        } else if (order.amount) {
          return sum + parseFloat(order.amount);
        }
        return sum;
      }, 0);
      
      salesTrend.push(Math.round(monthRevenue));
    }

    return {
      totalOrders,
      revenue: `$${revenue.toFixed(2)}`,
      pendingUsers: pendingUsers.size,
      pendingOrders,
      todayOrders,
      ordersPerDay,
      topCategories: topCategories.length > 0 ? topCategories : [
        { name: "No categories yet", percentage: 100, color: "#6366F1" }
      ],
      salesTrend: salesTrend.length > 0 ? salesTrend : [0, 0, 0, 0, 0, 0]
    };
  }

  async getXenditBalance() {
    return {
      balance: "$47,832.50",
      pending: "$3,245.00",
      monthlyVolume: "$124,560"
    };
  }
}

export const storage = new DatabaseStorage();