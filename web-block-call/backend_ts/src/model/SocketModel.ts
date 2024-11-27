import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the schema
interface ISocket extends Document {
  socketId: string;
  userId: string;
}

// Create the Mongoose schema
const SocketSchema: Schema<ISocket> = new Schema(
  {
    socketId: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Mongoose model
const Socket: Model<ISocket> = mongoose.model<ISocket>('Socket', SocketSchema, 'socket');
export default Socket;
