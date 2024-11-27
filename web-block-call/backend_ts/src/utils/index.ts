import jwt from 'jsonwebtoken';
import _, { result } from "lodash";
import deepdash from "deepdash";
deepdash(_);
import mongoose, { ObjectId, Schema } from 'mongoose';
import cryptojs from "crypto-js";
import * as fs from "fs";
import * as path from 'path';

import AppError from "./AppError"

import * as model from "../model"
import * as Constants from "../constants"
import * as cache from "../cache"


// import logger from "./logger";

import { generatePeriodsFromDates } from "./generatePeriods";

import { getPercentById, getPositionById, positionLevelMoreThan } from "./positionsCache";
// import order from '../model/OrderModel';

import { Node, Member, TreeNode, IMember, IFile } from "./Interface"

export const loggerError = async(req: any, message: string) =>{
   let { current_user } = await checkAuth(req);
   let user_agent = userAgent(req)
//    logger.error( message, 
//                     {
//                       username: current_user,
//                       ipAddress: "127.0.0.1",
//                       userAgent: user_agent
//                     }
//                 )
}

export const loggerInfo = async(req: any, message: string) =>{
    let { current_user } = await checkAuth(req);
    let user_agent = userAgent(req)
    // logger.info( message, 
    //                 {
    //                     username: current_user,
    //                     ipAddress: "127.0.0.1",
    //                     userAgent: user_agent
    //                 }
    //             )
 }

export const emailValidate = () =>{
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
}

export const fileRenamer = (filename: any) => {
    const queHoraEs = Date.now();
    const regex = /[^a-zA-Z]/g ///[\s_-]/gi;
    const fileTemp = filename.replace(regex, ".");
    let arrTemp = [fileTemp.split(".")];
    return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};

export const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getSession = async(userId: string, input: any) => {  
    await model.models.Session.deleteOne({userId})

    const { REACT_APP_JWT_SECRET } = process.env as { REACT_APP_JWT_SECRET: string; };
    let session = await model.models.Session.create({  ...input, 
                                                userId, 
                                                token: jwt.sign(userId.toString(), REACT_APP_JWT_SECRET)});
  
    return cryptojs.AES.encrypt(session?._id.toString(), REACT_APP_JWT_SECRET).toString() 
}

// export const getMember = async( query: any ) =>{
//     return  await Model.models.Member.findOne( query  )
// }

export const checkRole = (user: any) =>{
    // console.log("@1 checkRole :", user)
    if(user?.current?.roles){
        let { REACT_APP_USER_ROLES } = process.env
        // console.log("@2 checkRole :", user?.current?.roles, REACT_APP_USER_ROLES)
        if(_.includes( user?.current?.roles, parseInt(_.split(REACT_APP_USER_ROLES, ',' )[0])) ){
            return Constants.Role.ADMINISTRATOR;
        }
        else if(_.includes( user?.current?.roles, parseInt(_.split(REACT_APP_USER_ROLES, ',' )[2])) ){
            return Constants.Role.SELLER;
        }
        else if(_.includes( user?.current?.roles, parseInt(_.split(REACT_APP_USER_ROLES, ',' )[1])) ){
            return Constants.Role.AUTHENTICATED;
        }
    }
    return Constants.Role.ANONYMOUS;
}

export const getUser = async(query: any) =>{
    return  await model.models.User.findOne( query  )
}

export const checkAuth = async(req: any) => {
    console.log("@1 checkAuth :", req) // authorization
    const { REACT_APP_JWT_SECRET } = process.env as { REACT_APP_JWT_SECRET: string; };

    if (req && req["authorization"]) {
        const auth    = req["authorization"];
        const parts   = auth.split(" ");
        const bearer  = parts[0];
        try{
            const sessionId   = cryptojs.AES.decrypt(parts[1], REACT_APP_JWT_SECRET).toString(cryptojs.enc.Utf8);
            if (bearer === "Bearer") {
                let session = await model.models.Session.findOne({_id: sessionId});
                if(!_.isEmpty(session)){

                    let expiredDays = Math.floor((session.expired.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

                    // code
                    // -1 : force logout
                    //  0 : anonymums
                    //  1 : OK
                    if(expiredDays >= 0){
                        let userId  = jwt.verify(session.token, REACT_APP_JWT_SECRET);
                        let current_user = await getUser({_id: userId}) 

                        if(!_.isNull(current_user)){
                            return {
                                status: true,
                                code: Constants.Status.SUCCESS,
                                pathname: JSON.parse(req["custom-location"])?.pathname,
                                current_user,
                            }
                        }
                    }
                }
            }
            throw new AppError(Constants.Status.FORCE_LOGOUT, 'Expired!', req)
        } catch (e: any) {
            throw new AppError(Constants.Status.FORCE_LOGOUT, 'Expired!', {...e, ...req} )
        }
    }
    return {
        status: false,
        code: Constants.Status.USER_NOT_FOUND,
        message: "without user - anonymous user"
    }
}

export const userAgent = (req: any) => {
    if (req.headers && req.headers["user-agent"]) {
        return req.headers["user-agent"];
    }
    return "no-user-agent";
}

export const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    return password;
};

export const saveFile = async (session: any, user: any, file: any): Promise<IFile[]> => {
    console.log("@0 saveFile")
    const { createReadStream, filename, encoding, mimetype } = await file?.file;
    const stream = createReadStream();
    const assetUniqName = fileRenamer(filename);
    let pathName = `/app/uploads/${assetUniqName}`;
  
    const output = fs.createWriteStream(pathName);
    console.log("@1 saveFile")
    stream.pipe(output);
    console.log("@2 saveFile")
    const resultFile = await new Promise<IFile[]>((resolve, reject) => {
      output.on('finish', async () => {
        try {
          let file = await model.models.File.create(
            [
              {
                userId: user?._id,
                url: `images/${assetUniqName}`,
                filename,
                encoding,
                mimetype,
              },
            ],
            { session }
          );
          resolve(file as IFile[]); // Type assertion

        } catch (error: any) {
          reject(`Failed to save data to MongoDB: ${error.message}`);
        }
      });
  
      output.on('error', (err) => {
        console.error("File stream error:", err);
        reject(err);
      });
    });
  
    console.log("@3 saveFile :", resultFile)
    return resultFile;
};
  
export const createRevision = (model: any) =>{
    // Save the current version to history
    const current = model?.current;
    const version = model?.history.length + 1;

    return [...model?.history, { version: version, data: current, updatedAt: new Date() }];
}

export const getUserById = async(_id: any) => {
  return await model.models.User.aggregate([
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
