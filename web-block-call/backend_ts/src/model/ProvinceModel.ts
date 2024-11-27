import mongoose, { Schema, Document, Model } from 'mongoose';

import { IProvince } from '../utils/Interface';

// Create the schema for a province
const ProvinceSchema: Schema<IProvince> = new Schema(
    {
        _id: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        name_th: {
            type: String,
            required: true,
            unique: true,
        },
        name_en: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

// Create the model from the schema
const Province: Model<IProvince> = mongoose.model<IProvince>("province", ProvinceSchema, "province");

export default Province;
