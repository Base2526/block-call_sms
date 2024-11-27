import express, { Request, Response, NextFunction } from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import WebSocket, { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import path from 'path';
// import jwt from 'jsonwebtoken';
// import cryptojs from "crypto-js";
import bodyParser from "body-parser";
import _ from "lodash";
// import { graphqlUploadExpress, GraphQLUpload } from 'graphql-upload';
import { processRequest } from 'graphql-upload-ts';
import { json } from 'body-parser';


import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
// import * as Utils from "./utils";
import pubsub from './pubsub';

// import { savePositionsIfNotExists } from "./utils/positionsCache";
// import logger from "./utils/logger";
// import { graphqlUploadExpress } from 'graphql-upload';
// import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs"

// Import your cron jobs
// import './cron-jobs';

import './mongo';

// Create an executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Initialize Express
const app = express();

let subscriptionCount: string[] = [];
const { NODE_ENV, REACT_APP_GRAPHQL_PORT } = process.env;

// Logging Plugin for Apollo Server
const loggingPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext: any) {
        for (const err of requestContext.errors) {
          // logger.error(`Error: ${err.message}`, { err });
        }
      },
    };
  },
};

// Create an Apollo Server instance
// const server = new ApolloServer({
//   schema,
//   plugins: [ApolloServerPluginLandingPageLocalDefault(), loggingPlugin],
//   introspection: NODE_ENV !== 'production',
//   context: ({ req }: { req: Request }) => ({
//     req: req.headers,
//     rt: NODE_ENV
//   }),
//   formatError: (error) => {
//     console.error("formatError:", error);
//     return error;
//   }
// });

const server = new ApolloServer({ 
  schema, 
  plugins: [ApolloServerPluginLandingPageLocalDefault(), loggingPlugin],
  introspection: NODE_ENV !== 'production', 
  formatError: (error) => {
    console.log("formatError :", error)
    return error;
  }
});

// Start the server
server.start().then(() => {
  // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  // app.use(graphqlUploadExpress()); // Enable file uploads
  // Custom middleware to handle request processing
  app.use(
    json(),
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.is('multipart/form-data')) {
        // Handle file uploads using `graphql-upload`
        await processRequest(req, res); // Parses and processes the request
      }
      next(); // Proceed to the next middleware
    }
  );

  app.use('/images', express.static(path.join(__dirname, '/app/uploads')));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost',
    'http://localhost:1984',
    'http://localhost:4000',
  ];

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use((req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
    
  });

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }: { req: Request }) =>{
      console.log('/graphql')
      return ({ req: req.headers })
    } ,
  }));

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('Okay! >> ' + subscriptionCount.toString());
  });

  app.get('/subscriptions', (req: Request, res: Response) => {
    res.status(200).send('Subscription All: ' + subscriptionCount.join(' '));
  });

  const httpServer = app.listen(Number(REACT_APP_GRAPHQL_PORT) || 4000, () => {
    console.log(`Server is now running on http://localhost:${REACT_APP_GRAPHQL_PORT || 4000}/graphql`);
    // savePositionsIfNotExists();
  });

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  useServer({
    schema,
    onConnect: async (ctx) => {
      // pubsub.publish('USER_CONNECTED', { userConnected: 'A user connected' });
      // await Utils.logUserAccess(0, ctx);
    },
    onSubscribe: (ctx, msg) => {
      const websocketKey = ctx.extra.request.headers['sec-websocket-key'] as string;
      if (!subscriptionCount.includes(websocketKey)) {
        subscriptionCount.push(websocketKey);
      }
    },
    onDisconnect: async (ctx) => {
      subscriptionCount = subscriptionCount.filter((el) => el !== ctx.extra.request.headers['sec-websocket-key']);
      // await Utils.logUserAccess(1, ctx);
    },
  }, wsServer);
});
