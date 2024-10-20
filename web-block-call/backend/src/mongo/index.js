import mongoose from "mongoose";
import _ from "lodash"
import * as Model from "../model"
let logger = require("../utils/logger");

import banksInThailand from "./banks"
import provinces from "./provinces"

const modelExists =()=>{
  Model.Bank.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Socket');
    } else {
      _.map(banksInThailand, async(item)=>{
        const bank = new Model.Bank({ name_th: item.name_th,  name_en: item.name_en });
        await bank.save();
      })
    }
  });

  Model.Socket.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Socket');
    } else {
      // console.log('Not found Model.Socket, creating');
      let newSocket = new Model.Socket({});
      await newSocket.save();

      await Model.Socket.deleteMany({})
    }
  });

  Model.User.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newUser = new Model.User(JSON.parse(process.env.INIT_USER_ADMIN));
      await newUser.save();
    }
  });

  Model.Mail.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Mail');
    } else {
      let newMails = new Model.Mail({});
      await newMails.save();
      await Model.Mail.deleteMany({})
    }
  });

  Model.Report.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Report');
    } else {
      let newReport = new Model.Report({
        current:{
          ownerId: new mongoose.Types.ObjectId(),
          sellerFirstName: 'กรุณากรอกชื่อคนขาย',
          sellerLastName: 'กรุณากรอกนามสกุลคนขาย',
          idCard: '1234567890123',
          // sellerAccount:'กรุณากรอกบัญชีคนขาย',
          // bank: 'กรุณาเลือกธนาคาร',
          sellerAccounts: [ { sellerAccount:"123456789", bankId: new mongoose.Types.ObjectId() }],
          product: 'กรุณากรอกสินค้าที่สั่งซื้อ',
          transferAmount: 0,
          transferDate: new Date(),
          sellingWebsite: 'กรุณากรอกเว็บประกาศขายของ',
          provinceId: new mongoose.Types.ObjectId(),
        }
      });
      await newReport.save();
      await Model.Report.deleteMany({})
    }
  });

  Model.Dblog.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Dblog');
    } else {
      let newDblog = new Model.Dblog({});
      await newDblog.save();
      await Model.Dblog.deleteMany({})
    }
  });

  Model.Session.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Model.Session');
    } else {
      let newSession = new Model.Session({ userId: new mongoose.Types.ObjectId(), token: "token", expired:new Date() });
      await newSession.save();
      await Model.Session.deleteMany({})
    }
  });

  Model.Notification.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newNotification = new Model.Notification({ user_to_notify: new mongoose.Types.ObjectId(), user_id_approve: new mongoose.Types.ObjectId() });
      await newNotification.save();
      await Model.Notification.deleteMany({})
    }
  });

  Model.BasicContent.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newBasicContent = new Model.BasicContent({title: "text"});
      await newBasicContent.save();
      await Model.BasicContent.deleteMany({})
    }
  });

  Model.ContactUs.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newContactUs = new Model.ContactUs({  title: "title",
                                          description: "description" });
      await newContactUs.save();
      await Model.ContactUs.deleteMany({})
    }
  });

  Model.LogUserAccess.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newLogUserAccess = new Model.LogUserAccess({current:{ websocketKey: "test", userId: new mongoose.Types.ObjectId() }});
      
      await newLogUserAccess.save();
      await Model.LogUserAccess.deleteMany({})
    }
  });

  Model.File.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newFile = new Model.File({ userId: new mongoose.Types.ObjectId() });
      
      await newFile.save();
      await Model.File.deleteMany({})
    }
  });

  Model.Province.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      _.map(provinces, async(province)=>{
        const prov = new Model.Province({ name_th: province.value,  name_en: province.label });
        await prov.save();
      })
    }
  });

  Model.Comment.find({}, async(err, result)=> {
    if (result.length > 0) {
    } else {
      let newComment = new Model.Comment({
                                          reportId: new mongoose.Types.ObjectId(),  // Replace with actual report ID if needed
                                          data: [{
                                            text: 'This is a comment text',  // The main comment text
                                            user: {
                                              userId: '12345',
                                              username: 'JohnDoe',
                                              url: 'https://example.com/profile/JohnDoe'
                                            },
                                            status: 'SENDING',  // Status, default is 'SENDING'
                                            created: Date.now(),
                                            updated: Date.now(),
                                            subComments: [
                                              {
                                                text: 'This is a subcomment text',
                                                user: {
                                                  userId: '54321',
                                                  username: 'JaneDoe',
                                                  url: 'https://example.com/profile/JaneDoe'
                                                },
                                                status: 'SENDING',  // Default is 'SENDING'
                                                created: Date.now(),
                                                updated: Date.now()
                                              }
                                            ]
                                          }]
                                        });
      
      await newComment.save();
      await Model.Comment.deleteMany({})
    }
  });
 
}

// TODO: initial and connect to MongoDB
mongoose.Promise = global.Promise;
// mongoose.connect("YOUR_MONGODB_URI", { useNewUrlParser: true });
// console.log(">>>>> process.env :", process.env)
// uri
mongoose.connect(
  // "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/bl?replicaSet=rs",
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false, // optional
    useCreateIndex: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 100000, // Defaults to 30000 (30 seconds)
    poolSize: 100, // Set the maximum number of connections in the connection pool
  }
);

const connection = mongoose.connection;
connection.on("error", (err)=>{
  // console.error.bind(console, "Error : Connection to database")

  logger.error("Error : Connection to database :", err.toString() )
});
connection.once("open", async function () {
  // we're connected!
  // console.log("Successfully : Connected to database!");

  logger.info("Successfully : Connected to database!")

  modelExists()


  // # MUST SET replSet before
  // // Get the MongoDB client 
  // const client = mongoose.connection.getClient();
  // // Now you can use the MongoDB client for operations
  // const database = client.db(process.env.MONGO_INITDB_DATABASE);
  // const collection = database.collection("mlm");
  // const changeStream = collection.watch();
  // changeStream.on('change', next => {
  //   // process next document
  //   console.log("---------------change-----------------")
  // });
});

export default connection;