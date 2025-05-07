import { IResolvers } from '@graphql-tools/utils';
import { GraphQLJSON } from 'graphql-type-json'; // For JSON scalar type
import { withFilter } from 'graphql-subscriptions';
import { GraphQLResolveInfo } from 'graphql';
import _ from "lodash";
import mongoose from 'mongoose';
import cryptojs from "crypto-js";
import * as fs from "fs";
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

import AppError from "./utils/AppError"
import * as utils from "./utils"
import * as constants from "./constants"
import * as model from "./model"
import pubsub from './pubsub'
import { IUser, ILike, IFile } from "./utils/Interface"
import pool from './db';
import logger from "./utils/logger";

const REACT_APP_JWT_SECRET = process.env.REACT_APP_JWT_SECRET as string;

const resolvers: IResolvers = {
  Query: {
    test: async(parent, args, context): Promise<any> => {
      let start = Date.now();
      let { req } = context;

     

      // const query = await pool.query('SELECT * FROM "user"');
      // // if( query && query.rowCount > 0 ) {
      // //   console.log("test > res : ", query.rows)
      // // }

      // console.log('Current Pool Status:');
      // console.log(`Total Connections: ${pool.totalCount}`);       // Total number of clients in the pool
      // console.log(`Idle Connections: ${pool.idleCount}`);         // Idle connections in the pool
      // console.log(`Active Connections: ${pool.totalCount - pool.idleCount}`); // Active connections
      
      return  {
                status: true,
                // req,
                // rows: query.rows,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
    },
    provinces: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context;

      // let { current_user }=  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)

      // if( role !== constants.Role.ADMINISTRATOR  &&
      //     role !== constants.Role.AUTHENTICATED 
      //     ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied')

      const query = await pool.query('SELECT * FROM province');
      if( query.rowCount == 0 ) throw new AppError(constants.Status.DATA_NOT_FOUND, 'data not found.')

      return {
        status: true,
        data: query.rows,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    reports: async(parent, args, context): Promise<any> => {
      try{
        let start = Date.now()
        let { req } = context
        
        console.log("call function reports()");
        let { current_user } =  await utils.checkAuth(req);
        let role = utils.checkRole(current_user)
        console.log("reports : current_user :", current_user, role, req)

        console.log(`reports :`)
        console.log(args)
        
  
        // logger.info(`Call >> reports: ${current_user}`, { current_user });

        // logger.info('Hello World');

        // if( role !== constants.Role.ADMINISTRATOR  && 
        //     role !== constants.Role.AUTHENTICATED  ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

        /*
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
        */

        let { searchText, page, pageSize} = args.input
        const reportsQuery = `SELECT 
                                r.id AS report_id,
                                r.user_id,
                                r.seller_first_name,
                                r.seller_last_name,
                                r.id_card,
                                r.product,
                                r.transfer_amount,
                                r.transfer_date,
                                r.selling_website,
                                r.additional_info,
                                r.created_at,
                                r.updated_at,

                                -- Province (Unique by p.id)
                                COALESCE(
                                    JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', p.id, 'name_th', p.name_th)) 
                                    FILTER (WHERE p.id IS NOT NULL), 
                                    '[]'::JSONB
                                ) AS province,

                                -- Tel Numbers (Unique by tn.id)
                                COALESCE(
                                    JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', tn.id, 'tel', tn.tel)) 
                                    FILTER (WHERE tn.id IS NOT NULL), 
                                    '[]'::JSONB
                                ) AS tel_numbers,

                                -- Seller Accounts (Unique by sa.id)
                                COALESCE(
                                    JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                                        'id', sa.id, 
                                        'seller_account', sa.seller_account, 
                                        'bank_id', sa.bank_id, 
                                        'bank_name', COALESCE(b.name_en, b.name_th)
                                    )) FILTER (WHERE sa.id IS NOT NULL), 
                                    '[]'::JSONB
                                ) AS seller_accounts,

                                -- Images (Unique by f.id)
                                COALESCE(
                                    JSONB_AGG(
                                        DISTINCT JSONB_BUILD_OBJECT('id', f.id, 'filename', f.filename, 'url', f.url)
                                    ) FILTER (WHERE f.id IS NOT NULL AND f.filename IS NOT NULL AND f.url IS NOT NULL), 
                                    '[]'::JSONB
                                ) AS images

                            FROM report r
                            LEFT JOIN tel_numbers tn ON r.id = tn.report_id
                            LEFT JOIN seller_account sa ON r.id = sa.report_id
                            LEFT JOIN bank b ON sa.bank_id = b.id -- Join with the bank table to get the bank name
                            LEFT JOIN report_images ri ON r.id = ri.report_id
                            LEFT JOIN province p ON p.id = r.province_id 
                            LEFT JOIN file f ON ri.file_id = f.id

                            WHERE (
                              COALESCE(CAST($3 AS TEXT), '') = '' OR 
                              r.seller_first_name ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              r.seller_last_name ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              r.id_card ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              r.product ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              r.selling_website ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              r.additional_info ILIKE '%' || CAST($3 AS TEXT) || '%' OR
                              p.name_th ILIKE '%' || CAST($3 AS TEXT) || '%'
                            )

                            GROUP BY r.id 
                            ORDER BY r.created_at DESC
                            LIMIT $1 OFFSET $2;
                            `;

        const totalCountQuery = `
                            SELECT COUNT(*) AS totalCount
                            FROM report r
                            LEFT JOIN province p ON p.id = r.province_id
                            WHERE (
                              COALESCE(CAST($1 AS TEXT), '') = '' OR 
                              (r.seller_first_name || ' ' || r.seller_last_name) ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.seller_first_name ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.seller_last_name ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.id_card ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.product ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.selling_website ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              r.additional_info ILIKE '%' || CAST($1 AS TEXT) || '%' OR
                              p.name_th ILIKE '%' || CAST($1 AS TEXT) || '%'
                            );
                          `;

        // const searchWords = searchText.trim().split(/\s+/);
        const reportsPromise = pool.query(reportsQuery, [pageSize, (page - 1) * pageSize, searchText]);
        const totalCountPromise = pool.query(totalCountQuery, [searchText]);
        const [reportsResult, totalCountResult] = await Promise.all([reportsPromise, totalCountPromise]);
                                  
        // if( reportsResult.rowCount == 0 ) throw new AppError(constants.Status.DATA_NOT_FOUND, 'data not found.')
        console.log( "rowCount :", reportsResult.rowCount )
        console.log( "rows :", reportsResult.rows )

        return {
          status: true,
          data: reportsResult.rows,
          totalCount: parseInt(totalCountResult.rows[0].totalcount, 10),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error: any){
        logger.error('[reports] An error occurred', { stack: error });

        throw new AppError(constants.Status.ERROR, error)
      }finally {
      }  
    },
    report: async(parent, args, context): Promise<any> => {
      try{
        let start = Date.now()
        let { req } = context
        let { _id } = args

        let { current_user } =  await utils.checkAuth(req);
        console.log("current_user :", current_user)

        const reportsQuery = `SELECT 
                                r.id AS report_id,
                                r.user_id,
                                r.seller_first_name,
                                r.seller_last_name,
                                r.id_card,
                                r.product,
                                r.transfer_amount,
                                r.transfer_date,
                                r.selling_website,
                                -- r.province_id,
                                r.additional_info,
                                r.created_at,
                                r.updated_at,
                              
                                -- Province (Unique by p.id)
                                COALESCE(
                                  JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', p.id, 'name_th', p.name_th)) 
                                  FILTER (WHERE p.id IS NOT NULL), 
                                  '[]'::JSONB
                                ) AS province,

                                -- Tel Numbers (Unique by tn.id)
                                COALESCE(
                                  JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', tn.id, 'tel', tn.tel)) 
                                  FILTER (WHERE tn.id IS NOT NULL), 
                                  '[]'::JSONB
                                ) AS tel_numbers,

                                -- Seller Accounts (Unique by sa.id)
                                COALESCE(
                                  JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
                                    'id', sa.id, 
                                    'seller_account', sa.seller_account, 
                                    'bank_id', sa.bank_id, 
                                    'bank_name', COALESCE(b.name_en, b.name_th)
                                  )) FILTER (WHERE sa.id IS NOT NULL), 
                                  '[]'::JSONB
                                ) AS seller_accounts,

                                -- Images (Unique by f.id)
                                COALESCE(
                                  JSONB_AGG(
                                    DISTINCT JSONB_BUILD_OBJECT('id', f.id, 'filename', f.filename, 'url', f.url)
                                  ) FILTER (WHERE f.id IS NOT NULL AND f.filename IS NOT NULL AND f.url IS NOT NULL), 
                                  '[]'::JSONB
                                ) AS images

                              FROM report r
                              LEFT JOIN tel_numbers tn ON r.id = tn.report_id
                              LEFT JOIN seller_account sa ON r.id = sa.report_id
                              LEFT JOIN bank b ON sa.bank_id = b.id -- Join with the bank table to get the bank name
                              LEFT JOIN report_images ri ON r.id = ri.report_id
                              LEFT JOIN province p ON p.id = r.province_id 
                              LEFT JOIN file f ON ri.file_id = f.id
                              WHERE r.id = $1
                              GROUP BY r.id, p.id;`;
                              
        const reportsResult = await pool.query(reportsQuery, [ _id ]);                                
        // console.log("report @@@2 ", report, report.length > 0 ? report[0] : undefined)

        console.log("call function report()");
        console.log( reportsResult.rows )
        return {
          status:true,
          data: reportsResult.rows.length > 0 ? reportsResult.rows[0] : undefined,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error: any){
        logger.error('[report] An error occurred', { stack: error });

        throw new AppError(constants.Status.ERROR, error)
      }finally {
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

      // let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)

      // console.log("users :", role)
      // if( role !== constants.Role.ADMINISTRATOR ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

      // let users = await model.models.User.aggregate([ 
      //                                         {
      //                                           $match: {
      //                                             "current.roles": { $ne: 1 } // Matches documents where 'roles' does not contain 1
      //                                           }
      //                                         },
      //                                         {
      //                                           $addFields: {
      //                                             avatarId: "$current.avatarId",  // Bring the nested field to the top level
      //                                           }
      //                                         },
      //                                         {
      //                                           $lookup: {
      //                                             localField: "avatarId",
      //                                             from: "file",
      //                                             foreignField: "_id",
      //                                             as: "avatar"
      //                                           }
      //                                         },
      //                                         {
      //                                           $unwind: {
      //                                             path: "$avatar",
      //                                             preserveNullAndEmptyArrays: true
      //                                           }
      //                                         },
      //                                         {
      //                                           $addFields: {
      //                                             "current.avatar": "$avatar"  // Set 'current.avatar' field
      //                                           }
      //                                         },
      //                                         {
      //                                           $project: {
      //                                             avatarId: 0,                // Hide 'avatarId' field if not needed
      //                                             avatar: 0                   // Optionally remove 'avatar' after mapping
      //                                           }
      //                                         }]);
      
      const query = await pool.query(`SELECT 
                                            "user".id AS id,
                                            "user".username,
                                            "user".email,
                                            file.id AS file_id,
                                            file.url,
                                            file.filename
                                        FROM 
                                            "user"
                                        LEFT JOIN 
                                            file
                                        ON 
                                            "user".id = file.user_id;`);

      if( query.rowCount == 0 ) throw new AppError(constants.Status.DATA_NOT_FOUND, 'data not found.')

      return {
        status: true,
        data: query.rows,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    user: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context
      let { _id } = args
      console.log("user : ", _id)
      let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)
      // if( role !== Constants.ADMINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'permission denied', current_user)
      
      const query = await pool.query(`SELECT "user".*,
                                             file.id AS file_id,
                                             file.url,
                                             file.filename
                                        FROM "user"
                                        LEFT JOIN  file ON "user".avatar_id = file.id
                                        WHERE "user".id = ${ _id };`);

      if( query.rowCount == 0 ) throw new AppError(constants.Status.DATA_NOT_FOUND, 'data not found.')

      return {
        status: true,
        data: query.rows[0],
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    banks: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context

      // let { current_user } =  await utils.checkAuth(req);
      // let role = utils.checkRole(current_user)
      // console.log('@@@@@@@@@@@ banks :', role)

      // if( role !== constants.Role.ADMINISTRATOR  &&
      //     role !== constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)

      // let banks = await model.models.Bank.find({});
 
      const query = await pool.query(`SELECT * FROM bank;`);
      if( query.rowCount == 0 ) throw new AppError(constants.Status.DATA_NOT_FOUND, 'data not found.')

      return {
        status: true,
        data: query.rows,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },
    comment: async(parent, args, context): Promise<any> => {
      let start = Date.now()
      let { req } = context
      let { _id } = args

      console.log("comment :", _id)
      let { current_user } =  await utils.checkAuth(req);
      // let role = Utils.checkRole(current_user)
   
      // const existingComment = await model.models.Comment.findOne({ reportId: input?.id });
         
                                                    
      // console.log("report @@@2 ", report, report.length > 0 ? report[0] : undefined)
      return {
        status:true,
        // data: existingComment?.data !== undefined ? existingComment?.data : [],
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    }
  },
  Mutation: {
    test: async (parent, args, context): Promise<any> => {
      const start = Date.now();
      // const { client } = context;
      let { req }   = context
      const { input } = args;

      pubsub.publish(constants.Subscription.HEART_BEAT, {
        params: {
          mutation: constants.Status.FORCE_LOGOUT,
          req
        },
      });
    
      // Return response
      return {
        status: true,
        executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`,
      };
    },
    login: async (parent, args, context): Promise<any> => {
      const start = Date.now();
      // const { client } = context;
      const { input } = args;
    
      const username = input.username.trim().toLowerCase();
      const password = input.password.trim();
    
      console.log("login attempt:", input);
    
      const isEmail = utils.emailValidate().test(username);
      const queryField = isEmail ? 'email' : 'username';
    
      // Query user based on username or email
      const query = await pool.query(
        `SELECT * FROM "user" WHERE "user".${queryField} = $1`,
        [username]
      );
    
      if (query.rowCount === 0) {
        throw new AppError(constants.Status.DATA_NOT_FOUND, 'USER NOT FOUND');
      }
    
      const user = query.rows[0];
      
      // Decrypt and verify the password
      const decryptedPassword = cryptojs.AES.decrypt(user.password, REACT_APP_JWT_SECRET).toString(cryptojs.enc.Utf8);
      if (decryptedPassword !== password) {
        throw new AppError(constants.Status.PASSWORD_WRONG, 'PASSWORD WRONG');
      }
    
      // Update last access timestamp
      await pool.query(
        `UPDATE "user" SET last_access = CURRENT_TIMESTAMP WHERE id = $1`,
        [user.id]
      );
    
      // Get session ID
      const sessionId = await utils.getSession(user.id);
    
      // Return response
      return {
        status: true,
        data: user,
        sessionId,
        executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`,
      };
    },
    register: async(parent, args, context): Promise<any> => {
      let start     = Date.now()
      let { input } = args

      // Combine the checks for username and email existence into one query
      let query = await pool.query(
        `SELECT * FROM "user" WHERE username = $1 OR email = $2`, 
        [input.username, input.email]
      );

      if (query.rowCount != 0) {
        // Determine whether it's a username or email conflict
        if (query.rows.some(row => row.username === input.username)) {
          throw new AppError(constants.Status.ERROR, "EXITING USERNAME", input);
        }
        if (query.rows.some(row => row.email === input.email)) {
          throw new AppError(constants.Status.ERROR, "EXITING EMAIL", input);
        }
      }

      let query_user = `
                        INSERT INTO "user" (
                            username, password, displayName, email, roles, isActive, lockAccount_lock, lockAccount_date, lastAccess, createdAt, updatedAt
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                        )
                      `;

      const values_user = [
        input.username,
        cryptojs.AES.encrypt( input.password, REACT_APP_JWT_SECRET).toString(),
        input.username,  // Assuming display name is the same as the username
        input.email,
        JSON.stringify([1]),  // Roles as an array
        true,  // isActive
        false, // lockAccount_lock
        new Date(), // lockAccount_date
        new Date(), // lastAccess
        new Date(), // createdAt
        new Date()  // updatedAt
      ];
                      
      await pool.query(query_user, values_user);
      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
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

      console.log("profile :", input)

      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction()
  
      try {
        let { current_user }=  await utils.checkAuth(req);
        let role = utils.checkRole(current_user)
        if( role !== constants.Role.ADMINISTRATOR && role !== constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)
  
        let user = await utils.getUser({ "_id": input.userId }); 
        switch(input.mode){
          case "update_image_profile":{
            // Ensure the saveFile method returns a typed value
            const avatar: IFile[] = await utils.saveFile(session, user, input.file);
            if (!avatar || !avatar[0]?.userId) throw new AppError(constants.Status.ERROR, 'Invalid avatar data');

            // Fetch the user history
            const userHistory: IUser | null = await model.models.User.findById(input.userId).session(session);
            if (!userHistory) throw new AppError(constants.Status.NOT_FOUND, 'User history not found');

            // Update the user document
            await model.models.User.updateOne(
              { _id: input.userId },
              {
                'current.avatarId': avatar[0]?._id,
                history: utils.createRevision(userHistory),
              },
              { session }
            );

            await session.commitTransaction(); 

            console.log("current_user?._id, avatar :", input.userId, avatar)
            // let user = await utils.getUserById(current_user?._id)
            return {
              status: true,
              // data: user[0],
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
      let start     = Date.now()
      let { req }   = context
      let { input } = args

      let { current_user } =  await utils.checkAuth(req);
      let role = utils.checkRole(current_user)
      if( role !==constants.Role.ADMINISTRATOR &&
          role !==constants.Role.AUTHENTICATED ) throw new AppError(constants.Status.UNAUTHENTICATED, 'permission denied', current_user)
          
      console.log("report : ", input)
      
      switch(input.mode){
        case 'added':{
          try {
            // Start a transaction
            await pool.query('BEGIN');
            
            const insertQueryReport = `
              INSERT INTO report (user_id, seller_first_name, seller_last_name, id_card, product, transfer_amount, transfer_date, selling_website, province_id, additional_info)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id;
            `;
          
            const report_query = await pool.query(insertQueryReport, [current_user.id, input.seller_first_name, input.seller_last_name, input.id_card, input.product, input.transfer_amount, input.transfer_date, input.selling_website, input.province_id, input.additional_info]);
          
            if (report_query.rowCount == 1) {
              const report_id = report_query.rows[0].id;
          
              // Insert related data like tel_numbers and seller_accounts (without checking report_id here)
              const insertQueryTelNumbers = `INSERT INTO tel_numbers (report_id, tel) VALUES ($1, $2) RETURNING id;`;
              for (const tel_number of input.tel_numbers) {
                await pool.query(insertQueryTelNumbers, [report_id, tel_number.tel]);
              }
          
              const insertQuerySellerAccount = `INSERT INTO seller_account (report_id, seller_account, bank_id) VALUES ($1, $2, $3) RETURNING id;`;
              for (const seller_account of input.seller_accounts) {
                await pool.query(insertQuerySellerAccount, [report_id, seller_account.seller_account, seller_account.bank_id]);
              }
          
              // Process images
              let promises = [];
              if (!_.isEmpty(input.images)) {
                for (let i = 0; i < input.images.length; i++) {
                  const { createReadStream, filename, encoding, mimetype } = (await input.images[i]).file;
                  const stream = createReadStream();
                  const assetUniqName = utils.fileRenamer(filename);
                  let pathName = `/app/uploads/${assetUniqName}`;
          
                  const output = fs.createWriteStream(pathName);
                  stream.pipe(output);
          
                  const promise = new Promise(async (resolve, reject) => {

                    const currentReportId = report_id;
                    
                    output.on('finish', async () => {
                      try {
                        const insertQueryFile = `
                          INSERT INTO file (user_id, url, filename, mimetype, encoding)
                          VALUES ($1, $2, $3, $4, $5)
                          RETURNING id;
                        `;
                        const file_query = await pool.query(insertQueryFile, [current_user?.id, `images/${assetUniqName}`, filename, encoding, mimetype]);
          
                        if (file_query.rowCount == 1) {
                          const file_id = file_query.rows[0].id;

                          // Ensure the report_id exists before inserting into report_images
                          // const checkReportExistsQuery = `SELECT id FROM report WHERE id = $1;`;
                          // const reportExists = await pool.query(checkReportExistsQuery, [currentReportId]);


                          // console.log(`>>>>>>>>>>   ${currentReportId} `);
                          // if (reportExists.rowCount === 0) {
                          //   throw new Error(`Report with id ${report_id} does not exist.`);
                          // }
          
                          // Now insert into report_images without checking the report again
                          const insertQueryReportImages = `INSERT INTO report_images (report_id, file_id) VALUES ($1, $2) RETURNING id;`;
                          const result = await pool.query(insertQueryReportImages, [currentReportId, file_id]);
                          resolve(file_id);
                        }
                      } catch (error) {
                        reject(`Failed to save data to MongoDB: ${error}`);
                      }
                    });
          
                    output.on('error', (err) => {
                      reject(err);
                    });
                  });
          
                  promises.push(promise);
                }
              }
          
              // Wait for all image files to be processed
              let images = await Promise.all(promises);
              console.log("All files processed: ", images);
          
              // Commit the transaction after all inserts are successful
              await pool.query('COMMIT');
          
              return {
                status: true,
                executionTime: `Time to execute = ${(Date.now() - start) / 1000} seconds`,
              };
            }
          } catch (error: any) {
            // Rollback the transaction in case of an error
            await pool.query('ROLLBACK');
            console.error('Error during transaction:', error);
            throw new AppError(constants.Status.ERROR, error)
          }
          
          // const session = await mongoose.startSession();
          // session.startTransaction();
          /*
          try {
            let promises = []; 
            if(!_.isEmpty(input.images)){
              for (let i = 0; i < input.images.length; i++) {
                const { createReadStream, filename, encoding, mimetype } = (await input.images[i]).file //await input.files[i];
      
                const stream = createReadStream();
                const assetUniqName = utils.fileRenamer(filename);
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
                        let file = await model.models.File.insertMany([{userId:current_user?.id, url: `images/${assetUniqName}`, filename, encoding, mimetype }], {session});
                        // console.log("file ", file)
                        resolve(file !== null ? file[0] : undefined );
                    } catch (error: any) {
                        reject(`Failed to save data to MongoDB: ${error.message}`);
                    }
                  });
            
                  output.on('error', async(err) => {
                    await utils.loggerError(req, err.toString());
      
                    reject(err);
                  });
                });
                promises.push(promise);
              }
            }

            let images = await Promise.all(promises);
            console.log("All files processed: ", images );

            const newInput = _.omit(input, ['mode']);
            // let current  = {...newInput, images, user_id: current_user?._id }
            
            console.log("@@@2 Report current : ", newInput)
            
            // await model.models.Report.insertMany([{ current }], { session });
            // // Commit the transaction
            // await session.commitTransaction();

            // await session.abortTransaction();
          }catch(error: any){
              console.log("error @@@@@@@1 :", error)
              // await session.abortTransaction();
          
              throw new AppError(constants.Status.ERROR, error)
          }finally {
              // session.endSession();
              console.log("finally @@@@@@@1 :")
          }  
          */

          break;
        }

      //   case 'edited':{
      //     const session = await mongoose.startSession();
      //     session.startTransaction();
      //     try {
      //       let promises = []; 
      //       let newFiles: unknown[] = [];
      //       if(!_.isEmpty(input.images)){
      //         for (let i = 0; i < input.images.length; i++) {
      //           try{
      //             let fileObject = (await input.images[i]).file
    
      //             if(!_.isEmpty(fileObject)){
      //               const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
      
      //               const stream = createReadStream();
      //               const assetUniqName = utils.fileRenamer(filename);
      //               let pathName = `/app/uploads/${assetUniqName}`;
          
      //               const output = fs.createWriteStream(pathName)
      //               stream.pipe(output);
          
      //               const promise = await new Promise(function (resolve, reject) {
      //                 // output.on('close', () => {
      //                 //   resolve("close");
      //                 // });

      //                 output.on('finish', async () => {
      //                   console.log('@finish');
      //                   try {
      //                       // Save data to MongoDB after the stream has finished writing
      //                       // await saveDataToMongoDB(data, dbUrl, dbName, collectionName);
      //                       // console.log("finish : ", { url: `images/${assetUniqName}`, filename, encoding, mimetype })
                            
      //                       // let newInput ={current: { parentId: input?.parentId, childs: [{childId: current_user?._id}]}}  
      //                       let file = await model.models.File.insertMany([{userId:current_user?._id, url: `images/${assetUniqName}`, filename, encoding, mimetype }], {session});
      //                       // console.log("file ", file)
      //                       resolve(file !== null ? file[0] : undefined );
      //                   } catch (error: any) {
      //                       reject(`Failed to save data to MongoDB: ${error.message}`);
      //                   }
      //                 });
                
      //                 output.on('error', async(err) => {
      //                   console.log('@error');
      //                   await utils.loggerError(req, err.toString());
          
      //                   reject(err);
      //                 });
      //               });
      //               promises.push(promise);

      //             }else{
      //               if(input.images[i].delete){
      //                 let pathUnlink = '/app/uploads/' + input.images[i].url.split('/').pop()
      //                 fs.unlink(pathUnlink, async(err: any)=>{
      //                     if (err) {
      //                       await utils.loggerError(req, err);
      //                     }else{
      //                       // if no error, file has been deleted successfully
      //                       console.log('File has been deleted successfully ', pathUnlink);
      //                     }
      //                 });
      //               }else{
      //                 newFiles = [...newFiles, input.images[i]]
      //               }
      //             }
      //           } catch(err: any) {
      //             await utils.loggerError(req, err.toString());

      //             console.log("@error :", err)
      //           }
      //         }
      //       }
      //       let images = await Promise.all(promises);
          
      //       let newInput = _.omit(input, ['_id', 'mode']);
          
      //       let history = await model.models.Report.findOne({ _id: mongoose.Types.ObjectId(input._id) })
      //       let result = await model.models.Report.updateOne({ _id: input._id }, { $set: { current: {...newInput, images: [...images, ...newFiles], ownerId: current_user?._id}, history: utils.createRevision(history) } }, { session });

      //       console.log("All files processed @@@ : ", result, input._id, newInput );
      //       // Commit the transaction
      //       await session.commitTransaction();
      //     }catch(error: any){
      //       console.log("error @@@@@@@1 :", error)
      //       await session.abortTransaction();
        
      //       throw new AppError(constants.Status.ERROR, error)
      //     }finally {
      //       session.endSession();
      //       console.log("finally @@@@@@@1 :")
      //     }  

      //     break;
      //   }

        case 'deleted':{
          try {
            // Start a transaction
            await pool.query('BEGIN');
            let { reportIds } = input
            if (reportIds.length === 0) throw new AppError(constants.Status.DATA_NOT_FOUND, "DATA_NOT_FOUND");

            // Delete from related tables first
            await pool.query(`
              DELETE FROM tel_numbers WHERE report_id = ANY($1);
            `, [reportIds]);
            await pool.query(`
              DELETE FROM seller_account WHERE report_id = ANY($1);
            `, [reportIds]);
            await pool.query(`
              DELETE FROM report_images WHERE report_id = ANY($1);
            `, [reportIds]);
            // Finally, delete from report table
            await pool.query(`
              DELETE FROM report WHERE id = ANY($1);
            `, [reportIds]);

            // Commit the transaction
            await pool.query('COMMIT');

            return {
              status: true,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          } catch (error: any) {
            // Rollback the transaction in case of an error
            await pool.query('ROLLBACK');
        
            console.error('Error checking or inserting data:', error);

            throw new AppError(constants.Status.ERROR, error)
          } 
        }
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
          // current_user.follows = current_user.follows.filter(
          //   follow => follow.userId.toString() !== input?._id.toString()
          // );

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
    heart_beat: {
      resolve: (payload: any) => {
        // console.log("heart_beat resolve:", payload);
        return payload.heart_beat;
      },
      subscribe: withFilter(
        (parent: any, args: any, context: any, info: GraphQLResolveInfo) => {
          // Return the async iterator for the topic
          return pubsub.asyncIterator<any>([constants.Subscription.HEART_BEAT]);
        },
        async (payload: any, variables: any, context: any, info: GraphQLResolveInfo) => {
          let { params } = payload

          console.log("@@1");
          switch(params.mutation){
            case constants.Status.FORCE_LOGOUT: {
              let { req }  = params;

              console.log("@1");
              console.log(params);
              console.log(variables);
              console.log(context);
              console.log("@2");
              break;
            }
          }

          // Add filtering logic if needed
          return true;
        }
      ),
    },
  },
  JSON: GraphQLJSON, // Use the JSON scalar type from `graphql-type-json`
  Upload: GraphQLUpload,
};

export default resolvers;
