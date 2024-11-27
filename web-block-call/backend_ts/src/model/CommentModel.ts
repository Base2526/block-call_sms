import mongoose, { Schema, Document, Model } from 'mongoose';
import * as constants from "../constants"

// Enum for status
enum Status {
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// Interface for UserComment
interface IUserComment extends Document {
  userId: string;
  username: string;
  url: string;
}

// Interface for SubComment
interface ISubComment extends Document {
  text: string;
  user: IUserComment;
  status:  Status;
  created: number;
  updated: number;
}

// Interface for Comment Data Item
interface ICommentData extends Document {
  text: string;
  user: IUserComment;
  status: Status;
  created: number;
  updated: number;
  subComments: ISubComment[];
}

// Interface for the main Comment document
interface IComment extends Document {
  reportId: mongoose.Types.ObjectId;
  data: ICommentData[];
}

// UserComment Schema
const userCommentSchema: Schema<IUserComment> = new Schema({
  userId: { type: String, required: [true, 'User ID is a required field'] },
  username: { type: String, required: [true, 'Username is a required field'] },
  url: { type: String, default: '' },
});

// SubComment Schema
const subCommentSchema: Schema<ISubComment> = new Schema({
  text: { type: String, required: [true, 'Text or Message is a required field'] },
  user: { type: userCommentSchema, required: [true, 'User information is required'] },
  status: { 
    type: String, 
    enum: {
      values: Object.values(Status),
      message: 'Status must be one of: SENDING, SENT, FAILED',
    },
    default: Status.SENDING,
    required: [true, 'Status is a required field'],
  },
  created: { type: Number, default: Date.now },
  updated: { type: Number, default: Date.now },
});

// Comment Schema
const commentSchema: Schema<IComment> = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, required: [true, 'Report ID is a required field'] },
    data: [{
      text: { type: String, required: [true, 'Text is a required field'] },
      user: { type: userCommentSchema, required: [true, 'User information is required'] },
      status: { 
        type: String, 
        enum: {
          values: Object.values(Status),
          message: 'Status must be one of: SENDING, SENT, FAILED',
        },
        default: Status.SENDING,
        required: [true, 'Status is a required field'],
      },
      created: { type: Number, default: Date.now },
      updated: { type: Number, default: Date.now },
      subComments: { type: [subCommentSchema], default: [] },
    }],
  },
  {
    timestamps: true,  // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Create and export the Comment model
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema, 'comment');

export default Comment;
