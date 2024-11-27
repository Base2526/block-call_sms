import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the historySchema
interface IHistory {
  version: number;
  data: Record<string, any>; // Using `Record<string, any>` to accommodate mixed data types
  updatedAt: Date;
}

// Define an interface for the logUserAccessSchema
interface ILogUserAccess extends Document {
  current: {
    websocketKey: string;
    userId: mongoose.Types.ObjectId;
    request?: Record<string, any>;
    connectTime?: Date | null;
    disconnectTime?: Date | null;
    updatedAt?: Date;
  };
  history: IHistory[];
}

// Define the history schema
const historySchema: Schema<IHistory> = new Schema({
  version: { type: Number, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, required: true },
});

// Define the main schema
const logUserAccessSchema: Schema<ILogUserAccess> = new Schema(
  {
    current: {
      websocketKey: { type: String, required: [true, "websocketKey Request is a required field"] },
      userId: { type: Schema.Types.ObjectId, required: [true, "userId Request is a required field"], ref: 'User' },
      request: { type: Object },
      connectTime: { type: Date, default: null },
      disconnectTime: { type: Date, default: null },
      updatedAt: { type: Date },
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const LogUserAccessModel: Model<ILogUserAccess> = mongoose.model<ILogUserAccess>('LogUserAccess', logUserAccessSchema, 'logUserAccess');

export default LogUserAccessModel;
