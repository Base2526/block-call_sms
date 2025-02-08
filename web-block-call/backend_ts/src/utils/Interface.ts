import mongoose, { Model, Types } from 'mongoose'; // Adjust based on your actual imports

import { fileSchema as File } from '../model/FileModel';

// Define interfaces for Node and Member data structures
export interface Node {
    _id: mongoose.Types.ObjectId;
    current: {
      parentNodeId: mongoose.Types.ObjectId;
      ownerId: mongoose.Types.ObjectId;
      number: number;
      isParent: boolean;
    };
}
  
export interface Member {
    _id: mongoose.Types.ObjectId;
    // name: string; // Add relevant properties
}
  
// Define the shape of the tree node result
export interface TreeNode {
    title: string;
    key: string;
    node: Node;
    owner: Member | null;
    level: number;
    children: TreeNode[] | null;
}

// Interface for the History Schema
export interface IHistory {
    version: number;
    data: any;  // Replace with a more specific type if known
    updatedAt: Date;
}

// Interface for Position ID
export interface IPositionId {
    version: number;
    positionId: mongoose.Types.ObjectId;
    updatedAt: Date;
}

// Interface for Avatar
export interface IAvatar {
    url: string;
    filename: string;
    mimetype: string;
    encoding: string;
}

// Interface for LockAccount
export interface ILockAccount {
    lock: boolean;
    date: Date;
}

// Interface for Delivery Address
export interface IDeliveryAddress {
    name: string;
    phone: string;
    address: string;
}

// Interface for the Member Schema's Current Data
export interface ICurrent {
    parentId: mongoose.Types.ObjectId;
    username: string;
    password: string;
    email: string;
    tel: string;
    displayName: string;
    idCard: string;
    address: string;
    packages: 1 | 2 | 3;
    roles: number[];
    isActive: 0 | 1;
    avatar: IAvatar;
    lockAccount: ILockAccount;
    lastAccess: Date;
    car_brand: string;
    car_model: string;
    car_year_model: string;
    car_month_expired: string;
    position: string;
    positionId: mongoose.Types.ObjectId;
    positionIds: IPositionId[];
    address_delivery: IDeliveryAddress;
}

// Interface for the entire Member document
export interface IMember extends Document {
    _id: mongoose.Types.ObjectId;
    current: ICurrent;
    history: IHistory[];
}

export interface ILike extends Document {
    userId: mongoose.Types.ObjectId;
}

interface IFollow {
    userId: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
    current: {
      username: string;
      password: string;
      email: string;
      displayName: string;
      address?: string;
      roles: number[];
      isActive: number;
      avatarId?: mongoose.Types.ObjectId;
      lockAccount: ILockAccount;
      lastAccess: Date;
    };
    follows: IFollow[];
    followers: IFollow[];
    history: IHistory[];
}

// Define an interface for the File document
export interface IFile extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    url?: string;
    filename?: string;
    mimetype?: string;
    encoding?: string;
}

export interface IHistory extends Document {
  version: number;
  data: any; // Schema.Types.Mixed
  updatedAt: Date;
}

export interface ISellerAccount extends Document {
  sellerAccount: string;
  bankId: mongoose.Types.ObjectId;
}

export interface ITelNumber extends Document {
  tel: string;
}

// Define the main Report interface
export interface IReport extends Document {
  current: {
    ownerId: mongoose.Types.ObjectId;
    sellerFirstName: string;
    sellerLastName: string;
    idCard: string;
    telNumbers: ITelNumber[];
    sellerAccounts: ISellerAccount[];
    product: string;
    transferAmount: number;
    transferDate: Date;
    sellingWebsite: string;
    provinceId: mongoose.Types.ObjectId;
    additionalInfo?: string;
    images: typeof File[]; // Assuming fileSchema is defined similarly
  };
  likes: ILike[];
  history: IHistory[];
}

// Define the interface for the document
export interface IDblog extends Document {
  level: string;
  meta: Record<string, any>;
  message: Record<string, any>;
  timestamp: Date;
}

export interface IProvince {
  // id: any;
  value: string; // Thai name
  label: string; // English name
}

// Define interfaces for data structures
export interface IAdminUser {
  // current: {
    username?: string;
    password?: string;
    display_name?: string;
    email?: string;
    tel: string;
    idCard: string;
    roles: number[];
  // };
}

// Define an interface for the bank object
export interface IBank {
  name_th: string;
  name_en: string;
}