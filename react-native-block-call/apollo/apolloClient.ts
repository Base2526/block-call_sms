// apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({
        uri: 'http://192.168.1.3:1984/graphql', // Replace with your GraphQL endpoint
    }),
    cache: new InMemoryCache(),
});

export default client;
