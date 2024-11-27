import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface representing a document in MongoDB
interface IBank extends Document {
  name_th: string;
  name_en: string;
  description?: string; // Optional field
}

// Define the schema
const bankSchema: Schema<IBank> = new Schema(
  {
    name_th: { type: String, required: [true, "Name-TH is a required field"] },
    name_en: { type: String, required: [true, "Name-EN is a required field"] },
    description: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create the model with type
const Bank: Model<IBank> = mongoose.model<IBank>('Bank', bankSchema, 'bank');

export default Bank;
