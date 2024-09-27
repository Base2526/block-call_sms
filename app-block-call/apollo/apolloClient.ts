// apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';


// Create an upload link
const uploadLink = createUploadLink({
    uri: 'http://192.168.1.3:1984/graphql', // Replace with your Apollo Server URL
});

const client = new ApolloClient({
    // link: new HttpLink({
    //     uri: 'http://192.168.1.3:1984/graphql', // Replace with your GraphQL endpoint
    // }),
    link: uploadLink,
    cache: new InMemoryCache(),
});

export default client;
