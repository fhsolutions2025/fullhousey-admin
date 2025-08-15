import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI!;
const DB_NAME = process.env.DB_NAME || "fullhousey";

let client: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  if (!MONGO_URI) throw new Error("MONGO_URI missing");
  if (!client) client = new MongoClient(MONGO_URI, { maxPoolSize: 5 });
  await client.connect();
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}
