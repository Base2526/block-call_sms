import mongoose, { Schema, Document, Model } from 'mongoose';
import { fileSchema as File } from './FileModel';
import { IReport, ITelNumber, ISellerAccount, IHistory, ILike } from "../utils/Interface"

// Define sub-schemas with proper types
const historySchema = new Schema<IHistory>({
  version: Number,
  data: Schema.Types.Mixed,
  updatedAt: Date,
});

const sellerAccountSchema = new Schema<ISellerAccount>({
  sellerAccount: { type: String, required: [true, 'Seller-Account is a required field'] },
  bankId: { type: Schema.Types.ObjectId, required: [true, 'Bank-ID is a required field'] },
});

const telNumbersSchema = new Schema<ITelNumber>({
  tel: { type: String, required: [true, 'Tel is a required field'] },
});

const likeSchema = new Schema<ILike>({
  userId: { type: Schema.Types.ObjectId, required: [true, 'User-ID is a required field'] },
});

// Define the main Report schema
const reportSchema = new Schema<IReport>(
  {
    current: {
      ownerId: { type: Schema.Types.ObjectId, required: [true, 'Owner-ID is a required field'] },
      sellerFirstName: { type: String, required: [true, 'กรุณากรอกชื่อคนขาย'] },
      sellerLastName: { type: String, required: [true, 'กรุณากรอกนามสกุลคนขาย'] },
      idCard: {
        type: String,
        required: [true, 'กรุณากรอกเลขบัตรประชาชน'],
        maxlength: [13, 'เลขบัตรประชาชนต้องมีความยาว 13 หลัก'],
        minlength: [13, 'เลขบัตรประชาชนต้องมีความยาว 13 หลัก'],
      },
      telNumbers: { type: [telNumbersSchema], default: [] },
      sellerAccounts: { type: [sellerAccountSchema], default: [] },
      product: { type: String, required: [true, 'กรุณากรอกสินค้าที่สั่งซื้อ'] },
      transferAmount: { type: Number, required: [true, 'กรุณากรอกยอดโอน'] },
      transferDate: { type: Date, required: [true, 'กรุณาเลือกวันโอนเงิน'] },
      sellingWebsite: { type: String, required: [true, 'กรุณากรอกเว็บประกาศขายของ'] },
      provinceId: { type: Schema.Types.ObjectId, required: [true, 'Province-ID is a required field'] },
      additionalInfo: { type: String },
      images: { type: [File], default: [] },
    },
    likes: { type: [likeSchema], default: [] },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

// Export the compiled model
const ReportModel: Model<IReport> = mongoose.model<IReport>('Report', reportSchema, 'report');
export default ReportModel;
