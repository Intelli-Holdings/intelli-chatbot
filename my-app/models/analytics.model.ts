import mongoose from 'mongoose';

export const AnalyticsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  messageCount: {
    type: Number,
    required: true,
  },
  promptCount: {
    type: Number,
    required: true,
  },
  averageResponseTime: {
    type: Number,
    required: true,
  },
});

export interface AnalyticsModel extends mongoose.Document {
  timestamp: Date;
  userId: string;
  messageCount: number;
  promptCount: number;
  averageResponseTime: number;
}

const AnalyticsModel: mongoose.Model<AnalyticsModel> =
  mongoose.model<AnalyticsModel>('Analytics', AnalyticsSchema);

export default AnalyticsModel;
