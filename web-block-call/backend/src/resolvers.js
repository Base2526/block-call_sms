import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";
import { GraphQLUpload } from 'graphql-upload';
import moment from "moment";
import jwt from 'jsonwebtoken';

import pubsub from './pubsub'
import AppError from "./utils/AppError"
import logger from "./utils/logger";
import * as cache from "./cache"
import * as Constants from "./constants"
import * as Model from "./model"
import * as Utils from "./utils"
import connection from './mongo'

const mongoose = require('mongoose');

const getUserById = async(_id) => {
  return await Model.User.aggregate([
    { $match: { _id } },
    {
      $addFields: {
        avatarId: "$current.avatarId",  // Bring the nested field to the top level
      }
    },{
      $lookup: {
        localField: "avatarId",
        from: "file",
        foreignField: "_id",
        as: "avatar"
      }
    },
    {
      $unwind: {
        path: "$avatar",
        preserveNullAndEmptyArrays: true
      }
    },
  ]);  
}

const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
};

export default {
  Query: {
    async test(parent, args, context, info){
      let start = Date.now()
      let { req } = context;
    
      return {
        status: true,
        req,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async provinces(parent, args, context, info){
      let start = Date.now()
      let { req } = context;

      let { current_user }=  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.ADMINISTRATOR  &&
          role !== Constants.AUTHENTICATED 
          ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied')
    
      let provinces = await Model.Province.find({})
      return {
        status: true,
        data: provinces,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async reports(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)

      // if( role !== Constants.ADMINISTRATOR  && 
      //     role !== Constants.AUTHENTICATED  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let limitSize = 10;  // Number of documents to return
      let page = 1;  // For pagination, which page to retrieve
      let skipSize = (page - 1) * limitSize;  // Number of documents to skip

      let reports = await Model.Report.aggregate([
        {
          $addFields: {
            ownerId: "$current.ownerId",
            provinceId: "$current.provinceId",  // Bring the nested field to the top level
          }
        },
        {
          $lookup: {
            localField: "ownerId",
            from: "user",
            foreignField: "_id",
            as: "owner"
          }
        },
        {
          $unwind: {
            path: "$owner",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            localField: "provinceId",
            from: "province",
            foreignField: "_id",
            as: "province"
          }
        },
        {
          $unwind: {
            path: "$province",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            localField: "_id",
            from: "comment",
            foreignField: "reportId",
            as: "comment"
          }
        },
        {
          $unwind: {
            path: "$province",
            preserveNullAndEmptyArrays: true
          }
        },
        // Add the $skip stage to skip documents for pagination
        { 
          $skip: skipSize 
        },
        // Add the $limit stage to limit the number of returned documents
        { 
          $limit: limitSize 
        }
      ]);

      return {
        status:true,
        data: reports,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async report(parent, args, context, info) {
      let start = Date.now()
      let { req } = context
      let { _id } = args

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      // if( role !== Constants.ADMINISTRATOR  && 
      //     role !== Constants.AUTHENTICATED  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let report = await Model.Report.aggregate([
                                                      { 
                                                        $match: { _id: mongoose.Types.ObjectId(_id) } 
                                                      },
                                                      {
                                                        $addFields: {
                                                          provinceId: "$current.provinceId",  // Bring the nested field to the top level
                                                        }
                                                      },
                                                      {
                                                        $lookup: {
                                                          from: "province",
                                                          localField: "provinceId",
                                                          foreignField: "_id",
                                                          as: "province"
                                                        }
                                                      },
                                                      {
                                                        $unwind: {
                                                          path: "$province",
                                                          preserveNullAndEmptyArrays: true
                                                        }
                                                      },
                                                      // Unwind sellerAccounts to perform a lookup for each account
                                                      {
                                                        $unwind: {
                                                          path: "$current.sellerAccounts",
                                                          preserveNullAndEmptyArrays: true
                                                        }
                                                      },
                                                      // Lookup bank details for each bankId in sellerAccounts
                                                      {
                                                        $lookup: {
                                                          from: "bank",  // the collection for banks
                                                          localField: "current.sellerAccounts.bankId",
                                                          foreignField: "_id",
                                                          as: "bank"
                                                        }
                                                      },
                                                      // Unwind the bank lookup results to get individual bank details
                                                      {
                                                        $unwind: {
                                                          path: "$bank",
                                                          preserveNullAndEmptyArrays: false
                                                        }
                                                      },
                                                      // Add the bank name_th field into sellerAccounts
                                                      {
                                                        $addFields: {
                                                          "current.sellerAccounts.bankName_th": "$bank.name_th"
                                                        }
                                                      },
                                                      // Group sellerAccounts back into an array after the unwind
                                                      {
                                                        $group: {
                                                          _id: "$_id",
                                                          reportData: { $first: "$$ROOT" },
                                                          sellerAccounts: { $push: "$current.sellerAccounts" }
                                                        }
                                                      },
                                                      // Reconstruct the report with sellerAccounts containing bankName_th
                                                      {
                                                        $addFields: {
                                                          "reportData.current.sellerAccounts": "$sellerAccounts"
                                                        }
                                                      },
                                                      {
                                                        $replaceRoot: { newRoot: "$reportData" }
                                                      },
                                                      {
                                                        $lookup: {
                                                          localField: "_id",
                                                          from: "comment",
                                                          foreignField: "reportId",
                                                          as: "comment"
                                                        }
                                                      },
                                                    ]);
                                                    
      // console.log("report @@@2 ", report, report.length > 0 ? report[0] : undefined)
      return {
        status:true,
        data: report.length > 0 ? report[0] : undefined,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async my_reports(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.ADMINISTRATOR  && role !== Constants.AUTHENTICATED  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let reports = await Model.Report.aggregate([  { $match: { "current.ownerId":  current_user._id } },
                                                    {
                                                      $addFields: {
                                                        provinceId: "$current.provinceId",  // Bring the nested field to the top level
                                                      }
                                                    },
                                                    {
                                                      $lookup: {
                                                        localField: "provinceId",
                                                        from: "province",
                                                        foreignField: "_id",
                                                        as: "province"
                                                      }
                                                    },
                                                    {
                                                      $unwind: {
                                                        path: "$province",
                                                        preserveNullAndEmptyArrays: true
                                                      }
                                                    }
                                                    ]);
      return {
        status:true,
        data: reports,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async users(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.ADMINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let users = await Model.User.aggregate([ {
                                                $match: {
                                                  "current.roles": { $ne: 1 } // Matches documents where 'roles' does not contain 1
                                                }
                                              }]);
      return {
        status: true,
        data: users,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async banks(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !== Constants.ADMINISTRATOR  &&
          role !== Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let banks = await Model.Bank.find({});
      return {
        status: true,
        data: banks,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async comment_by_id(parent, args, context, info) {
      let start = Date.now()
      let { req } = context
      let { input } = args

      console.log("comment_by_id :", input)
      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      // if( role !== Constants.ADMINISTRATOR  && 
      //     role !== Constants.AUTHENTICATED  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      // let report = await Model.Report.aggregate([
      //                                                 { 
      //                                                   $match: { _id: mongoose.Types.ObjectId(_id) } 
      //                                                 },
      //                                                 {
      //                                                   $addFields: {
      //                                                     provinceId: "$current.provinceId",  // Bring the nested field to the top level
      //                                                   }
      //                                                 },
      //                                                 {
      //                                                   $lookup: {
      //                                                     from: "province",
      //                                                     localField: "provinceId",
      //                                                     foreignField: "_id",
      //                                                     as: "province"
      //                                                   }
      //                                                 },
      //                                                 {
      //                                                   $unwind: {
      //                                                     path: "$province",
      //                                                     preserveNullAndEmptyArrays: true
      //                                                   }
      //                                                 },
      //                                                 // Unwind sellerAccounts to perform a lookup for each account
      //                                                 {
      //                                                   $unwind: {
      //                                                     path: "$current.sellerAccounts",
      //                                                     preserveNullAndEmptyArrays: true
      //                                                   }
      //                                                 },
      //                                                 // Lookup bank details for each bankId in sellerAccounts
      //                                                 {
      //                                                   $lookup: {
      //                                                     from: "bank",  // the collection for banks
      //                                                     localField: "current.sellerAccounts.bankId",
      //                                                     foreignField: "_id",
      //                                                     as: "bank"
      //                                                   }
      //                                                 },
      //                                                 // Unwind the bank lookup results to get individual bank details
      //                                                 {
      //                                                   $unwind: {
      //                                                     path: "$bank",
      //                                                     preserveNullAndEmptyArrays: false
      //                                                   }
      //                                                 },
      //                                                 // Add the bank name_th field into sellerAccounts
      //                                                 {
      //                                                   $addFields: {
      //                                                     "current.sellerAccounts.bankName_th": "$bank.name_th"
      //                                                   }
      //                                                 },
      //                                                 // Group sellerAccounts back into an array after the unwind
      //                                                 {
      //                                                   $group: {
      //                                                     _id: "$_id",
      //                                                     reportData: { $first: "$$ROOT" },
      //                                                     sellerAccounts: { $push: "$current.sellerAccounts" }
      //                                                   }
      //                                                 },
      //                                                 // Reconstruct the report with sellerAccounts containing bankName_th
      //                                                 {
      //                                                   $addFields: {
      //                                                     "reportData.current.sellerAccounts": "$sellerAccounts"
      //                                                   }
      //                                                 },
      //                                                 {
      //                                                   $replaceRoot: { newRoot: "$reportData" }
      //                                                 }
      //                                               ]);

      const existingComment = await Model.Comment.findOne({ reportId: input?.id });
         
                                                    
      // console.log("report @@@2 ", report, report.length > 0 ? report[0] : undefined)
      return {
        status:true,
        data: existingComment?.data !== undefined ? existingComment?.data : [],
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
  },
  Upload: GraphQLUpload,
  Mutation: {
    async login(parent, args, context, info) {
      let start = Date.now()
      let {input} = args

      let username = input.username.toLowerCase()
      let user = Utils.emailValidate().test(username) 
      if(Utils.emailValidate().test(username)){
        user = await  Model.User.findOne( {"current.email": username}  );
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.current?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          
          // console.log("e :", user?.current?.password, input?.password, cryptojs.AES.decrypt(user?.current?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8))
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
      }else{
        user = await  Model.User.findOne( {"current.username":username} ); 
       
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.current?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          // console.log("e :", user?.current?.password, input?.password, cryptojs.AES.decrypt(user?.current?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8))
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
      }

      await Model.User.updateOne({ _id: user?._id }, { "current.lastAccess" : Date.now() });
      return {
        status: true,
        data: user,
        sessionId: await Utils.getSession(user?._id, input),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async register(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args
      let { req } = context
      
      if(!_.isNull( await Utils.getUser({
                                            "$and": [{
                                                "current.username": input.username
                                            }, {
                                                "current.email": input.email
                                            }]
                                          } ) )) throw new AppError(Constants.ERROR, "EXITING USERNAME AND EMAIL", input)
      
      if(!_.isNull( await Utils.getUser({ "current.username": input.username?.toLowerCase() }))) throw new AppError(Constants.ERROR, "EXITING USERNAME", input)
      if(!_.isNull( await Utils.getUser({ "current.email": input.email }) )) throw new AppError(Constants.ERROR, "EXITING EMAIL", input)
      // if(!_.isNull( await Utils.getMember({ "current.idCard": input.idCard }) )) throw new AppError(Constants.ERROR, "EXITING ID CARD", input)
      // if(!_.isNull( await Utils.getMember({ "current.tel": input.tel }) )) throw new AppError(Constants.ERROR, "EXITING TEL", input)
      
      let newInput =  {current: { ...input,  
                                  username: input.username?.toLowerCase(),
                                  password: cryptojs.AES.encrypt( input.password, process.env.JWT_SECRET).toString(),
                                  displayName: input.username ,
                                  lastAccess: Date.now(), 
                                  isOnline: true}
                      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        let newMember = await Model.User.create([newInput], { session });

        // if (!newMember || newMember.length === 0) {
        //   throw new AppError("Member creation failed, returned undefined.");
        // }
        // let parentId     = mongoose.Types.ObjectId(input.parentId);
        // let current_user = newMember[0];
        // // let packages     = input.packages;
        // await Utils.createChildNodes(parentId, current_user, packages, session);

        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        console.log("error :", error)
  
        await session.abortTransaction();

        throw new AppError(Constants.ERROR, error)
      }finally {
        session.endSession();
      }  
    },
    async forgot_password(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args
      let { req } = context

      let current_user =  await Utils.getUser({ "current.email": input.email });

      console.log("forgot_password current_user :", current_user)
      if(_.isNull( current_user )) throw new AppError(Constants.ERROR, "EMPTY EMAIL", input)

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        let password = generateRandomPassword(8);
        await Model.User.updateOne({ _id: current_user?._id }, { "current.password":  cryptojs.AES.encrypt( password, process.env.JWT_SECRET).toString() }, { session });

        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          password,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        console.log("error :", error)
  
        await session.abortTransaction();

        throw new AppError(Constants.ERROR, error)
      }finally {
        session.endSession();
      }  
    },
    async profile(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args
      let { req } = context

       // Start a transaction
     const session = await mongoose.startSession();
     session.startTransaction()
 
     try {
        let { current_user }=  await Utils.checkAuth(req);
        let role = Utils.checkRole(current_user)
        if( role !==Constants.ADMINISTRATOR && role !== Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)
  
        switch(input.mode){
          case "update_image_profile":{
            let avatar  =  await Utils.saveFile(session, current_user, input.file)

            let userHistory = await Model.User.findById(current_user?._id)
            await Model.User.updateOne({ _id: current_user?._id }, { "current.avatarId":  avatar[0]._id, history: Utils.createRevision(userHistory) }, { session });

            await session.commitTransaction(); 

            let user = await getUserById(current_user?._id)
            return {
              status: true,
              data: user[0],
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            } 
          }
        }
      }catch(error){
          await session.abortTransaction();

          throw new AppError(Constants.ERROR, error)
      }finally {
          session.endSession();
      }   
        
    },
    async report(parent, args, context, info) {
      let start     = Date.now()
      let { req }   = context
      let { input } = args

      let { current_user } =  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.ADMINISTRATOR &&
          role !==Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)
          
      console.log("report : ", input)
      
      switch(input.mode){
        case 'added':{
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
           
            let promises = []; 
            if(!_.isEmpty(input.images)){
              for (let i = 0; i < input.images.length; i++) {
                const { createReadStream, filename, encoding, mimetype } = (await input.images[i]).file //await input.files[i];
      
                const stream = createReadStream();
                const assetUniqName = Utils.fileRenamer(filename);
                let pathName = `/app/uploads/${assetUniqName}`;
      
                const output = fs.createWriteStream(pathName)
                stream.pipe(output);
      
                const promise = await new Promise(function (resolve, reject) {
                  // output.on('close', () => {
                  //   resolve("close");
                  // });

                  output.on('finish', async () => {
                    try {
                        // Save data to MongoDB after the stream has finished writing
                        // await saveDataToMongoDB(data, dbUrl, dbName, collectionName);
                        // console.log("finish : ", { url: `images/${assetUniqName}`, filename, encoding, mimetype })
                        
                        // let newInput ={current: { parentId: input?.parentId, childs: [{childId: current_user?._id}]}}  
                        let file = await Model.File.insertMany([{userId:current_user._id, url: `images/${assetUniqName}`, filename, encoding, mimetype }], {session});
                        // console.log("file ", file)
                        resolve(file !== null ? file[0] : undefined );
                    } catch (error) {
                        reject(`Failed to save data to MongoDB: ${error.message}`);
                    }
                  });
            
                  output.on('error', async(err) => {
                    await Utils.loggerError(req, err.toString());
      
                    reject(err);
                  });
                });
                promises.push(promise);
              }
            }

            let images = await Promise.all(promises);
            console.log("All files processed: ", images );

            const newInput = _.omit(input, ['mode']);
            let current  = {...newInput, images, ownerId: current_user._id }
            
            console.log("@@@2 Report current : ", current)
            
            await Model.Report.insertMany([{ current }], { session });
            // Commit the transaction
            await session.commitTransaction();

            // await session.abortTransaction();
          }catch(error){
              console.log("error @@@@@@@1 :", error)
              await session.abortTransaction();
          
              throw new AppError(Constants.ERROR, error)
          }finally {
              session.endSession();
              console.log("finally @@@@@@@1 :")
          }  

          break;
        }

        case 'edited':{
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            let promises = []; 
            let newFiles = [];
            if(!_.isEmpty(input.images)){
              for (let i = 0; i < input.images.length; i++) {
                try{
                  let fileObject = (await input.images[i]).file
    
                  if(!_.isEmpty(fileObject)){
                    const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
      
                    const stream = createReadStream();
                    const assetUniqName = Utils.fileRenamer(filename);
                    let pathName = `/app/uploads/${assetUniqName}`;
          
                    const output = fs.createWriteStream(pathName)
                    stream.pipe(output);
          
                    const promise = await new Promise(function (resolve, reject) {
                      // output.on('close', () => {
                      //   resolve("close");
                      // });

                      output.on('finish', async () => {
                        console.log('@finish');
                        try {
                            // Save data to MongoDB after the stream has finished writing
                            // await saveDataToMongoDB(data, dbUrl, dbName, collectionName);
                            // console.log("finish : ", { url: `images/${assetUniqName}`, filename, encoding, mimetype })
                            
                            // let newInput ={current: { parentId: input?.parentId, childs: [{childId: current_user?._id}]}}  
                            let file = await Model.File.insertMany([{userId:current_user._id, url: `images/${assetUniqName}`, filename, encoding, mimetype }], {session});
                            // console.log("file ", file)
                            resolve(file !== null ? file[0] : undefined );
                        } catch (error) {
                            reject(`Failed to save data to MongoDB: ${error.message}`);
                        }
                      });
                
                      output.on('error', async(err) => {
                        console.log('@error');
                        await Utils.loggerError(req, err.toString());
          
                        reject(err);
                      });
                    });
                    promises.push(promise);

                  }else{
                    if(input.images[i].delete){
                      let pathUnlink = '/app/uploads/' + input.images[i].url.split('/').pop()
                      fs.unlink(pathUnlink, async(err)=>{
                          if (err) {
                            await Utils.loggerError(req, err);
                          }else{
                            // if no error, file has been deleted successfully
                            console.log('File has been deleted successfully ', pathUnlink);
                          }
                      });
                    }else{
                      newFiles = [...newFiles, input.images[i]]
                    }
                  }
                } catch(err) {
                  await Utils.loggerError(req, err.toString());

                  console.log("@error :", err)
                }
              }
            }
            let images = await Promise.all(promises);
          
            let newInput = _.omit(input, ['_id', 'mode']);
          
            let history = await Model.Report.findOne({ _id: mongoose.Types.ObjectId(input._id) })
            let result = await Model.Report.updateOne({ _id: input._id }, { $set: { current: {...newInput, images: [...images, ...newFiles], ownerId: current_user._id}, history: Utils.createRevision(history) } }, { session });

            console.log("All files processed @@@ : ", result, input._id, newInput );
            // Commit the transaction
            await session.commitTransaction();
          }catch(error){
            console.log("error @@@@@@@1 :", error)
            await session.abortTransaction();
        
            throw new AppError(Constants.ERROR, error)
          }finally {
            session.endSession();
            console.log("finally @@@@@@@1 :")
          }  

          break;
        }

        case 'deleted':{
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            await Model.Report.deleteOne({ _id: input._id }, { session });

            // Commit the transaction
            await session.commitTransaction();
          }catch(error){
            console.log("error @@@@@@@1 :", error)
            await session.abortTransaction();
        
            throw new AppError(Constants.ERROR, error)
          }finally {
            session.endSession();
            console.log("finally @@@@@@@1 :")
          } 

          break;
        }
      }
      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    async like_report(parent, args, context, info) {
      let start = Date.now();
      let { input } = args;
      let { req } = context;
  
      let { current_user } = await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user);
      
      if (role !== Constants.ADMINISTRATOR && role !== Constants.AUTHENTICATED) {
          throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user);
      }
  
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
          let report = await Model.Report.findById(input?._id).session(session);
          
          if (!report) {
              throw new Error('Report not found');
          }
  
          // Filter out likes from the current user
          const originalLikesCount = report.likes.length;
          // Check if the user already liked the report
          const likedIndex = report.likes.findIndex(like => like.userId.toString() === current_user._id.toString() );

          report.likes = report.likes.filter(like => like.userId.toString() !== current_user._id.toString());
  
          if (originalLikesCount > report.likes.length) {
              // The user had liked the report and has been unliked
              console.log('User unliked the report');
          } else {
              // The user has not liked the report yet, so add the like
              report.likes.push({ userId: current_user._id });
              console.log('User liked the report');
          }
  
          // Save the updated report
          await report.save({ session });
  
          // Commit the transaction
          await session.commitTransaction();
          console.log('Transaction committed successfully');
  
          return {
              status: true,
              data: { reportId: input?._id, userId: current_user._id },
              likedIndex,
              executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`
          };
      } catch (error) {
          await session.abortTransaction();
          throw new AppError(Constants.ERROR, error);
      } finally {
          session.endSession();
      }
    },
    async like_comment(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args
      let { req } = context

      let { current_user }=  await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user)
      if( role !==Constants.ADMINISTRATOR && role !== Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)
  
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction()
 
      try {
        // switch(input.mode){
        //   case "update_image_profile":{
        //     let avatar  =  await Utils.saveFile(session, current_user, input.file)

        //     let userHistory = await Model.User.findById(current_user?._id)
        //     await Model.User.updateOne({ _id: current_user?._id }, { "current.avatarId":  avatar[0]._id, history: Utils.createRevision(userHistory) }, { session });

        //     await session.commitTransaction(); 

        //     let user = await getUserById(current_user?._id)
        //     return {
        //       status: true,
        //       data: user[0],
        //       executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        //     } 
        //   }
        // }
      }catch(error){
          await session.abortTransaction();

          throw new AppError(Constants.ERROR, error)
      }finally {
          session.endSession();
      }   
    },
    async comment_by_id(parent, args, context, info) {
      let start = Date.now();
      let { input } = args;
      let { req } = context;
  
      let { current_user } = await Utils.checkAuth(req);
      let role = Utils.checkRole(current_user);
      
      if (role !== Constants.ADMINISTRATOR && role !== Constants.AUTHENTICATED) {
          throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user);
      }
  
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      // console.log("input :", input)
      
      try {
        let newComment =  {...input.comment, status: 'SENT'}

        if(input.commentId === undefined){
          // Check if the Comment with the given reportId exists
          const existingComment = await Model.Comment.findOne({ reportId: input.reportId }).session(session);

          if (existingComment) {
            // If it exists, push the new comment into the data array
            existingComment.data.push(newComment);
            await existingComment.save({ session });
          } else {
            // If it does not exist, create a new Comment document
            const newCommentDocument = new Model.Comment({
                reportId: input.reportId,
                data: [newComment]
            });
            await newCommentDocument.save({ session });
          }
        }else{
          // Update subComments if commentId is provided
          const existingComment = await Model.Comment.findOne({ reportId: input.reportId }).session(session);
          
          if (existingComment) {
            const commentToUpdate = existingComment.data.find(data => data._id.toString() === input.commentId);
            
            if (commentToUpdate) {
              // Add the new comment to subComments
              commentToUpdate.subComments.push(newComment);
              await existingComment.save({ session });
            } else {
              throw new AppError(Constants.NOT_FOUND, 'Comment not found');
            }
          } else {
            throw new AppError(Constants.NOT_FOUND, 'Comment document not found');
          }
        }

        // Commit the transaction
        await session.commitTransaction();
        console.log('Transaction committed successfully');

        return {
            status: true,
            // data: { reportId: input?._id, userId: current_user._id },
            // likedIndex,
            executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`
        };
      } catch (error) {
          await session.abortTransaction();
          throw new AppError(Constants.ERROR, error);
      } finally {
          session.endSession();
      }
    },
  },
  Subscription:{
    userConnected: {
      resolve: (payload) =>{
        return payload.userConnected
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["USER_CONNECTED"])
        }, async (payload, variables, context, info) => {
          console.log("userConnected subscribe")
          return true;
        }
      ),
      onDisconnect: () => {
        console.log(`Active subscriptions: xxxx`);
      },
    },
  },
}