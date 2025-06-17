
import { MongoClient, Db } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your MongoDB connection string to environment variables.",
  );
}

let client: MongoClient;
let db: Db;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    db = client.db(); // Uses the database specified in the connection string
  }
  return db;
}

export { connectToDatabase, client };
export const mongodb = () => connectToDatabase();
