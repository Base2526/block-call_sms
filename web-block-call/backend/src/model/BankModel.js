import mongoose from 'mongoose';

const Schema = mongoose.Schema

const bankSchema = new Schema({
  name_th: { type: String, required:[true, "Name-TH is a required field"] },
  name_en: { type: String, required:[true, "Name-EN is a required field"] },
  description: { type: String }
},
{
    timestamps: true
})

const Bank = mongoose.model('bank', bankSchema,'bank')
export default Bank