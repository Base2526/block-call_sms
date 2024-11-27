import { PubSub } from 'graphql-subscriptions';

// Create a PubSub instance
const pubsub = new PubSub();

// Access the underlying EventEmitter to set max listeners
(pubsub as any).ee.setMaxListeners(100);  // Cast to `any` to access the `ee` property safely

export default pubsub;
