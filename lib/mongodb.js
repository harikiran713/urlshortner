import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

let indexesEnsured = false;

export async function ensureIndexes() {
  if (indexesEnsured) return;
  try {
    const client = await clientPromise;
    const db = client.db("url_shortener");
    const collection = db.collection("urls");

    await collection.createIndex({ code: 1 }, { unique: true });
    await collection.createIndex({ originalUrl: 1 });
    await collection.createIndex({ createdAt: -1 });

    indexesEnsured = true;
  } catch (error) {
    console.error("Failed to ensure indexes:", error);
  }
}

export default clientPromise;
