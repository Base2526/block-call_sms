import mongoose, { Types, ConnectOptions, model } from 'mongoose';
import * as Model from "../model"; 
import * as utils from "../utils"; 
import { init_admin, init_node, init_position } from "./init_data";
import logger from "../utils/logger"; 

const modelExists = async (): Promise<void> => {
  // Check for Socket model
  const socketResult = await Model.models.Socket.find({}).exec();
  if (socketResult.length === 0) {
    const newSocket = new Model.models.Socket({});
    await newSocket.save();
    await Model.models.Socket.deleteMany({});
  }

  // Model.Session example (using async/await properly)
  const sessionResult = await Model.models.Session.find({}).exec();
  if (sessionResult.length === 0) {
    const newSession = new Model.models.Session({
      userId: new Types.ObjectId(),
      token: "token",
      expired: new Date(),
    });
    await newSession.save();
    await Model.models.Session.deleteMany({});
  }

  // LogUserAccess
  const logUserAccessResult = await Model.models.LogUserAccess.find({}).exec();
  if (logUserAccessResult.length > 0) {
  } else {
    let newLogUserAccess = new Model.models.LogUserAccess({current:{ websocketKey: "test", userId: new mongoose.Types.ObjectId() }});
    
    await newLogUserAccess.save();
    await Model.models.LogUserAccess.deleteMany({})
  }

  // File 
  const fileResult = await Model.models.File.find({}).exec();
  if (fileResult.length > 0) {
  } else {
    let newFile = new Model.models.File({ userId: new mongoose.Types.ObjectId() });
    
    await newFile.save();
    await Model.models.File.deleteMany({})
  }

  // Dblog
  const dblogResult = await Model.models.Dblog.find({}).exec();
  if (dblogResult.length > 0) {
    // console.log('Found Model.Dblog');
  } else {
    let newDblog = new Model.models.Dblog({});
    await newDblog.save();
    await Model.models.Dblog.deleteMany({})
  }

  // Transition
  const transitionResult = await Model.models.Transition.find({}).exec();
  if (transitionResult.length > 0) {
    // console.log('Found Model.BasicContent');
  } else {
    let newTransition = new Model.models.Transition({ refId: new mongoose.Types.ObjectId(),
                                                      userId: new mongoose.Types.ObjectId() });
    await newTransition.save();
    await Model.models.Transition.deleteMany({})
  }

  // Transition
  const userResult = await Model.models.User.find({}).exec();
  if (userResult.length > 0) {
  } else {
    let newUser = new Model.models.User();
    await newUser.save();
  }

  // Report
  const reportResult = await Model.models.Report.find({}).exec();
  if (reportResult.length > 0) {
    // console.log('Found Model.Report');
  } else {
    let newReport = new Model.models.Report({
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
    await Model.models.Report.deleteMany({})
  }
  
};


// TODO: Initialize and connect to MongoDB
mongoose.Promise = global.Promise;

// Ensure you have your MongoDB URI set up correctly in your environment variables
const mongoUri: string = process.env.MONGO_URI as string;

if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is missing');
}

// MongoDB connection options
const options: ConnectOptions = {
  useNewUrlParser: true,
  useFindAndModify: false, // optional
  useCreateIndex: true,    // optional
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 100000, // Defaults to 30000 (30 seconds)
  poolSize: 100,            // Set the maximum number of connections in the connection pool
};

mongoose.connect(mongoUri, options).catch((err) => {
  logger.error('Error: Unable to connect to MongoDB', err.toString());
});

const connection = mongoose.connection;

connection.on('error', (err) => {
  logger.error('Error : Connection to database:', err.toString());
});

connection.once('open', async function () {
  // We're connected!
  logger.info('Successfully : Connected to database!');
  
  // You can call your function or model check here
  // await modelExists(); // Assuming this is an async function that you call after DB connection

  // Call modelExists function to initialize data
  modelExists().catch((error) => {
    console.error('Error during model initialization:', error);
  });
});

// This is where you'd export the connection for use in other modules
export default connection;