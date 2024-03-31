import mongoose, { ConnectOptions } from 'mongoose';

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
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Could not connect to MongoDB', err);
});
