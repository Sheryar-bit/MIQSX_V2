import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI;

if (uri) {
  const client = new MongoClient(uri);
  if (process.env.NODE_ENV === "development") {
    const g = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
    if (!g._mongoClientPromise) g._mongoClientPromise = client.connect();
    clientPromise = g._mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }
} else {
  // Deferred — will throw when actually awaited without a URI
  clientPromise = Promise.reject(new Error("MONGODB_URI is not set"));
}

export default clientPromise;
