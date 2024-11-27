import mongoose, { Document, Schema, Model } from 'mongoose';

import { IFile } from "../utils/Interface"

// Create the schema
const fileSchema: Schema<IFile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User-ID is a required field"],
      ref: 'User', // Optional: Reference to User model if needed
    },
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
  },
  {
    timestamps: true,
  }
);

// Define and export the model
const File: Model<IFile> = mongoose.model<IFile>('File', fileSchema, 'file');

export {
  File,
  fileSchema,
  IFile, // Exporting the interface for external use
};