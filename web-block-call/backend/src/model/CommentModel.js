import mongoose from 'mongoose';
const Schema = mongoose.Schema

/*
const commentSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required:[true, "Id is a required field"] },
    data: [{
            userId: { type: Schema.Types.ObjectId, required:[true, "User-Id is a required field"] },
            comId: { type: String },
            created: { type: Date },
            updated: { type: Date },
            text: { type: String },
            replies: [{
                        userId: { type: Schema.Types.ObjectId, required:[true, "User-Id is a required field"] },
                        comId: { type: String },
                        text: { type: String },
                        created: { type: Date },
                        updated: { type: Date },
                    }]
            }]
},
{
    timestamps: true
})

const Comment = mongoose.model('comment', commentSchema,'comment')
export default Comment
*/

// Enum for status
const statusValues = ['SENDING', 'SENT', 'FAILED'];

// UserComment Schema
const userCommentSchema = new Schema({
  userId: { type: String, required: [true, 'User ID is a required field'] },
  username: { type: String, required: [true, 'Username is a required field'] },
  url: { type: String, default: '' }  // Default is optional, so no required message here
});

// SubComment Schema
const subCommentSchema = new Schema({
  text: { type: String, required: [true, 'Text or Message is a required field'] },
  user: { type: userCommentSchema, required: [true, 'User information is required'] },
  status: { 
      type: String, 
      enum: {
          values: statusValues,
          message: 'Status must be one of: SENDING, SENT, FAILED'  // Custom message for enum validation
      },
      default: 'SENDING',  // Default value is SENDING
      required: [true, 'Status is a required field'] 
  },
  created: { type: Number, default: Date.now },
  updated: { type: Number, default: Date.now }
});

// Comment Schema
const commentSchema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, required: [true, 'Report ID is a required field'] },
    data: [{
      text: { type: String, required: [true, 'Text is a required field'] },
      user: { type: userCommentSchema, required: [true, 'User information is required'] },
      status: { 
          type: String, 
          enum: {
              values: statusValues,
              message: 'Status must be one of: SENDING, SENT, FAILED'  // Custom message for enum validation
          },
          default: 'SENDING',  // Default value is SENDING
          required: [true, 'Status is a required field']
      },
      created: { type: Number, default: Date.now },
      updated: { type: Number, default: Date.now },
      subComments: { type: [subCommentSchema], default: [] }  // Array of subcomments
    }]
  },
  {
    timestamps: true  // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Create the Comment model
const Comment = mongoose.model('comment', commentSchema,'comment')

export default Comment;
