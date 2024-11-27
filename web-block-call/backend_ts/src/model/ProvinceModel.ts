import mongoose, { Schema, Document, Model } from 'mongoose';

// Define an interface representing a document in MongoDB
interface IProvince extends Document {
    name_th: string;
    name_en: string;
}

// Create the schema for a province
const ProvinceSchema: Schema<IProvince> = new Schema(
    {
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
