import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";
// import mongoose from 'mongoose';
// import fetch from "node-fetch";
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
    }
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
      
      if(!_.isNull( await Utils.getMember({
                                            "$and": [{
                                                "current.username": input.username
                                            }, {
                                                "current.email": input.email
                                            }]
                                          } ) )) throw new AppError(Constants.ERROR, "EXITING USERNAME AND EMAIL", input)
      
      if(!_.isNull( await Utils.getMember({ "current.username": input.username?.toLowerCase() }))) throw new AppError(Constants.ERROR, "EXITING USERNAME", input)
      if(!_.isNull( await Utils.getMember({ "current.email": input.email }) )) throw new AppError(Constants.ERROR, "EXITING EMAIL", input)
      if(!_.isNull( await Utils.getMember({ "current.idCard": input.idCard }) )) throw new AppError(Constants.ERROR, "EXITING ID CARD", input)
      if(!_.isNull( await Utils.getMember({ "current.tel": input.tel }) )) throw new AppError(Constants.ERROR, "EXITING TEL", input)
      
      let newInput =  {current: { ...input,  
                                  username: input.username?.toLowerCase(),
                                  password: cryptojs.AES.encrypt( input.password, process.env.JWT_SECRET).toString(),
                                  displayName: _.isEmpty(input.displayName) ? input.username : input.displayName ,
                                  lastAccess: Date.now(), 
                                  isOnline: true}
                      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        let newMember = await Model.Member.create([newInput], { session });

        if (!newMember || newMember.length === 0) {
          throw new AppError("Member creation failed, returned undefined.");
        }

        let parentId     = mongoose.Types.ObjectId(input.parentId);
        let current_user = newMember[0];
        let packages     = input.packages;

        await Utils.createChildNodes(parentId, current_user, packages, session);

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
    async profile(parent, args, context, info) {
      let start     = Date.now()
      let { input } = args
      let { req } = context

      try{
      
        let current_user =  await Utils.checkAuth(req);
        console.log("profile ", current_user, req)
      } catch (e) {
        console.error("profile ", e)
        // throw new AppError(Constants.FORCE_LOGOUT, 'Expired!', {...e, ...req} )
      }

      
      // let files  =  await Utils.saveFile(current_user, input.file)
      return {
        status: true,
        message: "profile",
        args,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      } 
      
    },

    // 
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