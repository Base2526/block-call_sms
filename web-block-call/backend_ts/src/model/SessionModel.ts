import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface representing a session document
interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceAgent?: string;
  expired: Date;
}

// Create the session schema
const sessionSchema: Schema<ISession> = new Schema({
  userId: { type: Schema.Types.ObjectId, required: [true, "User-Id is a required field"], ref: 'User' },
  token: { type: String, required: [true, "Token is a required field"] },
  deviceAgent: { type: String },
  expired: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
    required: [true, "Expired is a required field"]
  }
}, {
  timestamps: true
});

// Create and export the model
const Session: Model<ISession> = mongoose.model<ISession>('Session', sessionSchema, 'session');
export default Session;