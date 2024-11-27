import mongoose, { Document, Schema, Model } from 'mongoose';
import { IDblog } from "../utils/Interface"

// Define the schema
const dblogSchema: Schema<IDblog> = new Schema(
  {
    level: { type: String, required: true }, // Add 'required' if appropriate
    meta: { type: Schema.Types.Mixed, required: true }, // Handle dynamic objects
    message: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Dblog: Model<IDblog> = mongoose.model<IDblog>('dblog', dblogSchema, 'dblog');
export default Dblog;
