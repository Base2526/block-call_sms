const mongoose = require("mongoose");

import { fileSchema as file } from "./FileModel";

const Schema = mongoose.Schema

const historySchema = new Schema({
  version: Number,
  data: Schema.Types.Mixed,
  updatedAt: Date
});

const sellerAccountSchema = new Schema({
  sellerAccount:  { type: String, required:[true, "Seller-Account is a required field"]},
  bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-ID is a required field"]},
});

const telNumbersSchema = new Schema({
  tel:  { type: String, required:[true, "Tel is a required field"]}
});

const reportSchema = new Schema(
  {
   current:{
    ownerId:  { type: Schema.Types.ObjectId, required:[true, "Owner-ID is a required field"]},
    sellerFirstName: {
      type: String,
      required: [true, 'กรุณากรอกชื่อคนขาย'], // Error message if validation fails
    },
    sellerLastName: {
      type: String,
      required: [true, 'กรุณากรอกนามสกุลคนขาย'],
    },
    idCard: {
      type: String,
      required: [true, 'กรุณากรอกเลขบัตรประชาชน'],
      maxlength: [13, 'เลขบัตรประชาชนต้องมีความยาว 13 หลัก'],
      minlength: [13, 'เลขบัตรประชาชนต้องมีความยาว 13 หลัก'],
    },
    telNumbers:{
      type: [telNumbersSchema], default: []
    },
    sellerAccounts:{
      type: [sellerAccountSchema], default: []
    },
    product: {
      type: String,
      required: [true, 'กรุณากรอกสินค้าที่สั่งซื้อ'],
    },
    transferAmount: {
      type: Number,
      required: [true, 'กรุณากรอกยอดโอน'],
    },
    transferDate: {
      type: Date,
      required: [true, 'กรุณาเลือกวันโอนเงิน'],
    },
    sellingWebsite: {
      type: String,
      required: [true, 'กรุณากรอกเว็บประกาศขายของ'],
    },
    provinceId: { type: Schema.Types.ObjectId, required:[true, "Province-ID is a required field"]},
    additionalInfo: {
      type: String,
    },
    images: { type: [file], default: [] }, 
   },
   history: [historySchema]
  },
  {
    timestamps: true,
  }
);

const report = mongoose.model('report', reportSchema,'report')
export default report

