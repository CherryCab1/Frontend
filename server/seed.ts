import { mongodb } from "./db";

export async function seedDatabase() {
  console.log("Seeding MongoDB database...");

  const db = await mongodb();

  // Clear existing data
  await db.collection('orders').deleteMany({});
  await db.collection('conversations').deleteMany({});
  await db.collection('messages').deleteMany({});
  await db.collection('transactions').deleteMany({});
  await db.collection('systemStatus').deleteMany({});

  // Seed orders
  await db.collection('orders').insertMany([
    {
      orderNo: "ORD-001",
      customerName: "John Doe",
      customerInitials: "JD",
      items: "iPhone 14 Pro, AirPods",
      deliveryInfo: "123 Main St, City",
      paymentStatus: "paid",
      orderStatus: "preparing",
      amount: "1299.00",
      createdAt: new Date()
    },
    {
      orderNo: "ORD-002",
      customerName: "Alice Smith",
      customerInitials: "AS",
      items: "MacBook Air, Magic Mouse",
      deliveryInfo: "456 Oak Ave, Town",
      paymentStatus: "pending",
      orderStatus: "received",
      amount: "1599.00",
      createdAt: new Date()
    }
  ]);

  // Seed conversations
  const conversations = await db.collection('conversations').insertMany([
    {
      name: "John Doe",
      initials: "JD",
      lastMessage: "Thanks for the quick delivery!",
      time: "2m",
      unreadCount: 0,
      isOnline: true,
      platform: "telegram_bot",
      createdAt: new Date()
    },
    {
      name: "Sarah Wilson",
      initials: "SW",
      lastMessage: "When will my order arrive?",
      time: "5m",
      unreadCount: 2,
      isOnline: false,
      platform: "telegram_personal",
      createdAt: new Date()
    },
    {
      name: "Mike Chen",
      initials: "MC",
      lastMessage: "Great service!",
      time: "15m",
      unreadCount: 0,
      isOnline: true,
      platform: "messenger",
      createdAt: new Date()
    }
  ]);

  // Seed messages
  const firstConversationId = conversations.insertedIds[0];
  await db.collection('messages').insertMany([
    {
      conversationId: firstConversationId,
      content: "Hey, I placed an order yesterday. Order #ORD-001. Can you check the status?",
      isFromBot: false,
      timestamp: "2:34 PM",
      createdAt: new Date()
    },
    {
      conversationId: firstConversationId,
      content: "Hi John! I can see your order #ORD-001 is currently being prepared. It should be ready for delivery by tomorrow morning.",
      isFromBot: true,
      timestamp: "2:35 PM",
      createdAt: new Date()
    }
  ]);

  // Seed transactions
  await db.collection('transactions').insertMany([
    {
      transactionId: "TXN-12345",
      description: "Order Payment - ORD-001",
      amount: "1299.00",
      type: "credit",
      time: "2 mins ago",
      createdAt: new Date()
    },
    {
      transactionId: "TXN-12346",
      description: "Order Payment - ORD-002",
      amount: "1599.00",
      type: "credit",
      time: "1 hour ago",
      createdAt: new Date()
    }
  ]);

  // Seed system status
  await db.collection('systemStatus').insertOne({
    botStatus: "online",
    webhookStatus: "active",
    dbStatus: "connected",
    apiStatus: "monitoring",
    uptime: "99.8%",
    version: "v2.1.0",
    build: "#1542",
    environment: "production",
    server: "Render.com",
    region: "Singapore",
    lastDeploy: "2 hours ago",
    cpuUsage: 34,
    memoryUsage: 68,
    diskUsage: 42,
    updatedAt: new Date()
  });

  console.log("MongoDB database seeded successfully!");
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}

export { seedDatabase };