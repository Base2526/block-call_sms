// Import necessary modules
import mongoose, { Document, Schema, Model } from 'mongoose';
import * as Constants from "../constants"; // Ensure this path is correct

// Define the File schema
interface IFile {
  url: string;
  filename: string;
  mimetype: string;
  encoding: string;
}

const FileSchema = new Schema<IFile>({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  encoding: { type: String, required: true },
});

// Define the Transition schema
interface ITransition extends Document {
  type: number;
  refId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: number;
  expire: boolean;
  isLucky: boolean;
  statusPay: number;
  files: IFile[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransitionSchema = new Schema<ITransition>(
  {
    type: {
      type: Number,
      min: 10,
      max: 12,
      default: Constants.TransactionType.SUPPLIER,
    },
    refId: {
      type: Schema.Types.ObjectId,
      required: [true, "Ref-Id is a required field"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User-Id is a required field"],
    },
    status: {
      type: Number,
      min: 13,
      max: 15,
      default: Constants.ApprovalStatus.WAIT,
    },
    expire: { type: Boolean, default: false },
    isLucky: { type: Boolean, default: false },
    statusPay: {
      type: Number,
      min: 13,
      max: 15,
      default: Constants.ApprovalStatus.WAIT,
    },
    files: [FileSchema], // Attach the File schema
    description: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Define and export the model
const Transition: Model<ITransition> = mongoose.model<ITransition>(
  'Transition',
  TransitionSchema,
  'transition' // Collection name
);

export default Transition;
