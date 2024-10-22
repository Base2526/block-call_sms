import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Create an HTTP link for queries and mutations
const uploadLink = createUploadLink({
  uri: 'http://192.168.1.3:1984/graphql', // Your GraphQL endpoint
});

// Create a WebSocket link for subscriptions with correct properties
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://192.168.1.3:1984/graphql', // Replace with your WebSocket endpoint
    reconnect: true, // Enable reconnection
    lazy: true, // Connect only when needed
    retryAttempts: 10, // Number of retry attempts after disconnection
    connectionParams: {
      // Add any custom connection parameters if needed
    },
    shouldRetry: () => true, // Always retry on failure
    on: {
      connected: () => console.log('WebSocket connected!'),
      closed: () => console.log('WebSocket closed!'),
      error: (err) => console.error('WebSocket error:', err),
    },
    retryWait: (retryCount: number) => {
      return new Promise<void>((resolve) => {
        // Exponential backoff with a maximum delay of 30 seconds
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => resolve(), delay);
      });
    },
  })
);

// Use split to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // Send subscriptions to the WebSocket link
  uploadLink // Send queries and mutations to the HTTP link
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

export default client;