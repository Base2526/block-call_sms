const mongoose = require('mongoose');

// Define the schema for a province
const ProvinceModel = new mongoose.Schema(
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

const Province = mongoose.model("province", ProvinceModel, "province");
export default Province;
