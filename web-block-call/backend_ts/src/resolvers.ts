import { IResolvers } from '@graphql-tools/utils';
import { GraphQLJSON } from 'graphql-type-json'; // For JSON scalar type
import { withFilter } from 'graphql-subscriptions';
import { GraphQLResolveInfo } from 'graphql';
import _ from "lodash";
import mongoose from 'mongoose';
import cryptojs from "crypto-js";

import AppError from "./utils/AppError"
import * as utils from "./utils"
import * as constants from "./constants"
import * as model from "./model"
import pubsub from './pubsub'
import { IUser, ILike, IFile } from "./utils/Interface"

const REACT_APP_JWT_SECRET = process.env.REACT_APP_JWT_SECRET as string;

const resolvers: IResolvers = {
  Query: {
    test: async(parent, args, context): Promise<any> => {
      let start = Date.now();
      let { req } = context;
      return  {
                status: true,
                req,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
    },
    provinces: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context;

      let { current_user }=  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !== constants.Role.ADMINISTRATOR  &&
          role !== constants.Role.AUTHENTICATED 
          ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied')
    
      let provinces = await model.models.Province.find({})
      return {
        status: true,
        data: provinces,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    reports: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)

      // if( role !== Constants.ADMINISTRATOR  && 
      //     role !== Constants.AUTHENTICATED  ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)

      let limitSize = 10;  // Number of documents to return
      let page = 1;  // For pagination, which page to retrieve
      let skipSize = (page - 1) * limitSize;  // Number of documents to skip

      let reports = await model.models.Report.aggregate([
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
    report: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context
      let { _id } = args

      let { current_user } =  await utils.checkAuth(req);
      let report = await model.models.Report.aggregate([
                                                      { 
                                                        $match: { _id: mongoose.Types.ObjectId(_id) } 
                                                      },
                                                      {
                                                        $addFields: {
                                                          ownerId: "$current.ownerId",
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

                                                      {
                                                        $lookup: {
                                                          from: "user",
                                                          localField: "ownerId",
                                                          foreignField: "_id",
                                                          as: "owner"
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
    my_reports: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !== constants.Role.ADMINISTRATOR  && role !== constants.Role.AUTHENTICATED  ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

      let reports = await model.models.Report.aggregate([  { $match: { "current.ownerId":  current_user?._id } },
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
    users: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !== constants.Role.ADMINISTRATOR ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

      let users = await model.models.User.aggregate([ {
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
    user: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      let { input } = args

      let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)
      // if( role !== Constants.ADMINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)
      let user = await model.models.User.findById(input?._id)

      return {
        status: true,
        data: user,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    banks: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      let { current_user } =  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !== constants.Role.ADMINISTRATOR  &&
          role !== constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

      let banks = await model.models.Bank.find({});
      return {
        status: true,
        data: banks,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    comment_by_id: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context
      let { input } = args

      console.log("comment_by_id :", input)
      let { current_user } =  await utils.checkAuth(req);
      // let role = Utils.checkRole(current_user)
   
      const existingComment = await model.models.Comment.findOne({ reportId: input?.id });
         
                                                    
      // console.log("report @@@2 ", report, report.length > 0 ? report[0] : undefined)
      return {
        status:true,
        data: existingComment?.data !== undefined ? existingComment?.data : [],
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    }
  },
  Mutation: {
    login: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let {input} = args

      let username = input.username.toLowerCase()
    
      let user = await  model.models.User.findOne( {"current.email": username}  );
      if(utils.emailValidate().test(username)){
        if( _.isNull(user) ){
          throw new AppError(constants.Status.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user.current?.password, REACT_APP_JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          throw new AppError(constants.Status.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
      }else{
        user = await  model.models.User.findOne( {"current.username":username} ); 
        if( _.isNull(user) ){
          throw new AppError(constants.Status.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.current?.password, REACT_APP_JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          throw new AppError(constants.Status.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
      }

      await model.models.User.updateOne({ _id: user?._id }, { "current.lastAccess" : Date.now() });

      let sessionId = await utils.getSession(user?._id, input);
      return {
        status: true,
        data: user,
        sessionId,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    register: async(parent, args, context): Promise<any> => {
      let start     = Date.now()
      let { input } = args
      let { req } = context
      
      if(!_.isNull( await utils.getUser({
                                            "$and": [{
                                                "current.username": input.username
                                            }, {
                                                "current.email": input.email
                                            }]
                                          } ) )) throw new AppError(constants.Status.ERROR, "EXITING USERNAME AND EMAIL", input)
      
      if(!_.isNull( await utils.getUser({ "current.username": input.username?.toLowerCase() }))) throw new AppError(constants.Status.ERROR, "EXITING USERNAME", input)
      if(!_.isNull( await utils.getUser({ "current.email": input.email }) )) throw new AppError(constants.Status.ERROR, "EXITING EMAIL", input)

      let newInput =  {current: { ...input,  
                                  username: input.username?.toLowerCase(),
                                  password: cryptojs.AES.encrypt( input.password, REACT_APP_JWT_SECRET).toString(),
                                  displayName: input.username ,
                                  lastAccess: Date.now(), 
                                  isOnline: true}
                      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await model.models.User.create([newInput], { session });

        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error: any){
        console.log("error :", error)
  
        await session.abortTransaction();

        throw new AppError(constants.Status.ERROR, error)
      }finally {
        session.endSession();
      } 
    },
    forgot_password: async(parent, args, context): Promise<any> => {
      let start     = Date.now()
      let { input } = args
      let { req } = context

      let current_user =  await utils.getUser({ "current.email": input.email });

      console.log("forgot_password current_user :", current_user)
      if(_.isNull( current_user )) throw new AppError(constants.Status.ERROR, "EMPTY EMAIL", input)

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        let password = utils.generateRandomPassword(8);
        await model.models.User.updateOne({ _id: current_user?._id }, { "current.password":  cryptojs.AES.encrypt( password, REACT_APP_JWT_SECRET ).toString() }, { session });

        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          password,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error: any){
        console.log("error :", error)
  
        await session.abortTransaction();

        throw new AppError(constants.Status.ERROR, error)
      }finally {
        session.endSession();
      }  
    },
    profile: async(parent, args, context): Promise<any> => {
      let start     = Date.now()
      let { input } = args
      let { req } = context

       // Start a transaction
     const session = await mongoose.startSession();
     session.startTransaction()
 
     try {
        let { current_user }=  await utils.checkAuth(req);
        let role = utils.checkRole(current_user)
        if( role !==constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)
  
        switch(input.mode){
          case "update_image_profile":{
            // let avatar  =  await utils.saveFile(session, current_user, input.file)

            // let userHistory = await model.models.User.findById(current_user?._id)
            // await model.models.User.updateOne({ _id: current_user?._id }, { "current.avatarId":  avatar[0]._id, history: utils.createRevision(userHistory) }, { session });

            // Ensure the saveFile method returns a typed value
            const avatar: IFile[] = await utils.saveFile(session, current_user, input.file);
            if (!avatar || !avatar[0]?.userId) throw new AppError(constants.Status.ERROR, 'Invalid avatar data');

            // Fetch the user history
            const userHistory: IUser | null = await model.models.User.findById(current_user?._id).session(session);
            if (!userHistory) throw new AppError(constants.Status.NOT_FOUND, 'User history not found');

            // Update the user document
            await model.models.User.updateOne(
              { _id: current_user?._id },
              {
                'current.avatarId': avatar[0].userId,
                history: utils.createRevision(userHistory),
              },
              { session }
            );

            await session.commitTransaction(); 

            let user = await utils.getUserById(current_user?._id)
            return {
              status: true,
              data: user[0],
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            } 
          }
        }
      }catch(error: any){
          await session.abortTransaction();

          throw new AppError(constants.Status.ERROR, error)
      }finally {
          session.endSession();
      }  
    },
    report: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context
      let { _id } = args

      // let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)

      let report = await model.models.Report.aggregate([
                                                      { 
                                                        $match: { _id: mongoose.Types.ObjectId(_id) } 
                                                      },
                                                      {
                                                        $addFields: {
                                                          ownerId: "$current.ownerId",
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
                                                      {
                                                        $lookup: {
                                                          from: "user",
                                                          localField: "ownerId",
                                                          foreignField: "_id",
                                                          as: "owner"
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
                                                    
      return {
        status:true,
        data: report.length > 0 ? report[0] : undefined,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    like_report: async(parent, args, context): Promise<any> => {
      let start = Date.now();
      let { input } = args;
      let { req } = context;
  
      let { current_user } = await utils.checkAuth(req);
      let role = utils.checkRole(current_user);
      
      if (role !== constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED) {
          throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user);
      }
  
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
          let report = await model.models.Report.findById(input?._id).session(session);
          
          if (!report) {
              throw new Error('Report not found');
          }
  
          // Filter out likes from the current user
          const originalLikesCount = report.likes.length;
          // Check if the user already liked the report
          const likedIndex = report.likes.findIndex(like => like.userId.toString() === current_user?._id.toString() );

          report.likes = report.likes.filter(like => like.userId.toString() !== current_user?._id.toString());
  
          if (originalLikesCount > report.likes.length) {
              // The user had liked the report and has been unliked
              console.log('User unliked the report');
          } else {
              // The user has not liked the report yet, so add the like
              // report.likes.push({ userId: current_user?._id });
              if (current_user?._id) {
                const like = {
                  userId: new mongoose.Types.ObjectId(current_user._id)  // Ensure the type is correct
                };
              
                // Mongoose automatically validates and manages the document structure
                report.likes.push(like as ILike);  // Ensure TypeScript understands the compatibility
                console.log('User liked the report');
              }
          }
  
          // Save the updated report
          await report.save({ session });
  
          // Commit the transaction
          await session.commitTransaction();
          console.log('Transaction committed successfully');
  
          return {
              status: true,
              data: { reportId: input?._id, userId: current_user?._id },
              likedIndex,
              executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`
          };
      } catch (error: any) {
          await session.abortTransaction();
          throw new AppError(constants.Status.ERROR, error);
      } finally {
          session.endSession();
      }
    },
    like_comment: async(parent, args, context): Promise<any> => {
      let start     = Date.now()
      let { input } = args
      let { req } = context

      let { current_user }=  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !==constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)
  
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
      }catch(error: any){
          await session.abortTransaction();

          throw new AppError(constants.Status.ERROR, error)
      }finally {
          session.endSession();
      } 
    },
    follow: async(parent, args, context): Promise<any> => {
      let start = Date.now();
      let { input } = args;
      let { req } = context;
  
      let { current_user } = await utils.checkAuth(req);

      if (!current_user) {
        throw new AppError(constants.Status.UNAUTHENTICATED, 'User not authenticated');
      }

      let role = utils.checkRole(current_user);
      
      if (role !== constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED) {
          throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user);
      }

      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
          
          // ---------- Update MySelf
          const originalFollowsCount = current_user?.follows.length;
          let followIndex = 1;
          // current_user?.follows = current_user?.follows.filter(follow => follow.userId.toString() !== input?._id.toString());
  
          // Filter and update follows array
          current_user.follows = current_user.follows.filter(
            follow => follow.userId.toString() !== input?._id.toString()
          );

          if (originalFollowsCount > current_user?.follows.length) {
              // The user had liked the report and has been unliked
              followIndex = -1;
              console.log('User unfollow the user');
          } else {
              // The user has not liked the report yet, so add the like
              current_user.follows.push({ userId: input?._id });
              console.log('User follow the user');
          }
  
          // Save the updated report
          await current_user.save({ session });
          // ---------- Update MySelf

          // ---------- Update Follower
          let userFollowers = await model.models.User.findById(input?._id).session(session);
          if (!userFollowers) {
            throw new Error('User not found');
          }

          if(followIndex === 1){
            let checkUserFollowers =  userFollowers.followers.find(follower => follower.userId.toString() === current_user._id.toString());
            if(!checkUserFollowers){
              userFollowers.followers.push({ userId: current_user?._id })
            }

            console.log('User Follower the user');
          }else{
            userFollowers.followers = userFollowers.followers.filter(follower => follower.userId.toString() !== current_user._id.toString());
            console.log('User unfollower the user');
          }
          // Save the updated user followers
          await userFollowers.save({ session });
          // ---------- Update Follower


          pubsub.publish("USER_CONNECTED", {
            userConnected: {
              mutation: "CREATED"
            },
          });

          // pubsub.publish('MESSAGE_ADDED', { mutation: "CREATED" });

          // Commit the transaction
          await session.commitTransaction();
          
          // console.log('Transaction committed successfully');
          return {
              status: true,
              followIndex,
              executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`
          };
      } catch (error: any) {
          await session.abortTransaction();
          throw new AppError(constants.Status.ERROR, error);
      } finally {
          session.endSession();
      }
    },
    comment_by_id: async(parent, args, context): Promise<any> => {
      let start = Date.now();
      let { input } = args;
      let { req } = context;
  
      let { current_user } = await utils.checkAuth(req);
      let role = utils.checkRole(current_user);
      
      if (role !== constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED) {
          throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user);
      }
  
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      // console.log("input :", input)
      
      try {
        let newComment =  {...input.comment, status: 'SENT'}

        if(input.commentId === undefined){
          // Check if the Comment with the given reportId exists
          const existingComment = await model.models.Comment.findOne({ reportId: input.reportId }).session(session);

          if (existingComment) {
            // If it exists, push the new comment into the data array
            existingComment.data.push(newComment);
            await existingComment.save({ session });
          } else {
            // If it does not exist, create a new Comment document
            const newCommentDocument = new model.models.Comment({
                reportId: input.reportId,
                data: [newComment]
            });
            await newCommentDocument.save({ session });
          }
        }else{
          // Update subComments if commentId is provided
          const existingComment = await model.models.Comment.findOne({ reportId: input.reportId }).session(session);
          
          if (existingComment) {
            const commentToUpdate = existingComment.data.find(data => data._id.toString() === input.commentId);
            
            if (commentToUpdate) {
              // Add the new comment to subComments
              commentToUpdate.subComments.push(newComment);
              await existingComment.save({ session });
            } else {
              throw new AppError(constants.Status.NOT_FOUND, 'Comment not found');
            }
          } else {
            throw new AppError(constants.Status.NOT_FOUND, 'Comment document not found');
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
      } catch (error: any) {
          await session.abortTransaction();
          throw new AppError(constants.Status.ERROR, error);
      } finally {
          session.endSession();
      }
    }
  },
  Subscription: {
    userConnected: {
      resolve: (payload: any) => {
        console.log("@@@ resolve:", payload);
        return payload.userConnected;
      },
      subscribe: withFilter(
        (parent: any, args: any, context: any, info: GraphQLResolveInfo) => {
          // Return the async iterator for the topic
          return pubsub.asyncIterator<any>(["USER_CONNECTED"]);
        },
        async (payload: any, variables: any, context: any, info: GraphQLResolveInfo) => {
          console.log("userConnected subscribe");
          // Add filtering logic if needed
          return true;
        }
      ),
    },
  },
  JSON: GraphQLJSON, // Use the JSON scalar type from `graphql-type-json`
};

export default resolvers;
