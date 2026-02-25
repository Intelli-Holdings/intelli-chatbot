import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from "@/lib/logger";

const connectionUrl = process.env.MONGO_URI;

if (!connectionUrl) {
  throw new Error('MONGO_URI environment variable not defined');
}

interface MongooseConnectOptions extends ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

export const clientPromise = mongoose.connect(connectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as MongooseConnectOptions).then(() => {
  logger.info('Connected to MongoDB');
}).catch((err) => {
  logger.error('Could not connect to MongoDB', { error: err instanceof Error ? err.message : String(err) });
});
