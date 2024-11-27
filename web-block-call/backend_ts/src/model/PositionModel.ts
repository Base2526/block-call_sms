import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Position document
interface IPosition extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  percent?: number;
  budget?: number;
  level?: number;
  description?: string;
}

// Define the position schema
const positionSchema = new Schema<IPosition>({
  _id: { type: Schema.Types.ObjectId },
  name: { type: String, required: [true, 'Name is a required field'] },
  percent: { type: Number },
  budget: { type: Number },
  level: { type: Number },
  description: { type: String }
}, {
  timestamps: true
});

// Create the model with the interface
const Position = mongoose.model<IPosition>('Position', positionSchema, 'position');

export default Position;