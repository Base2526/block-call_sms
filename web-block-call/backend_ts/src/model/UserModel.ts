import mongoose, { Document, Schema, Model } from 'mongoose';
import * as constants from "../constants"

import { IUser } from "../utils/Interface"

// Interfaces for schemas
interface IHistory {
  version: number;
  data: Record<string, any>;
  updatedAt: Date;
}

interface IFollow {
  userId: mongoose.Types.ObjectId;
}

interface ILockAccount {
  lock: boolean;
  date: Date;
}


// History schema
const historySchema = new Schema<IHistory>({
  version: { type: Number },
  data: { type: Schema.Types.Mixed },
  updatedAt: { type: Date },
});

// Follow schema
const followSchema = new Schema<IFollow>({
  userId: { type: Schema.Types.ObjectId, required: [true, 'User-ID is a required field'] },
});

// User schema
const userSchema = new Schema<IUser>({
  current: {
    username: { type: String, unique: true, required: [true, 'Username Request is a required field'] },
    password: { type: String, required: [true, 'Password Request is a required field'] },
    email: { type: String, unique: true, required: [true, 'Email Request is a required field'] },
    displayName: { type: String, required: [true, 'Display Name Request is a required field'] },
    address: { type: String },
    roles: {
      type: [Number],
      enum: [constants.Role.AUTHENTICATED, constants.Role.ADMINISTRATOR],
      default: [constants.Role.AUTHENTICATED],
    },
    isActive: {
      type: Number,
      enum: [0, 1], // 0: FALSE, 1: TRUE
      default: 0,
    },
    avatarId: { type: Schema.Types.ObjectId },
    lockAccount: {
      lock: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
    },
    lastAccess: { type: Date, default: Date.now },
  },
  follows: { type: [followSchema], default: [] },
  followers: { type: [followSchema], default: [] },
  history: [historySchema],
}, {
  timestamps: true,
});

// Model typing
const UserModel: Model<IUser> = mongoose.model<IUser>('user', userSchema, 'user');
export default UserModel;
