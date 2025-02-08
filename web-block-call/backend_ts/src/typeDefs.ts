import gql from 'graphql-tag';

import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

// Define custom scalar types
export const typeDefs = gql`
  scalar DATETIME
  scalar Long
  scalar Date
  scalar JSON
  scalar Upload
  

  type Query {
    test(input: JSON): JSON
    provinces(input: JSON): JSON
    reports(input: JSON): JSON
    report(_id: ID): JSON
    my_reports: JSON
    user(_id: ID!): JSON
    users: JSON
    banks: JSON
    comment_by_id(input: JSON): JSON
  }

  type Mutation {
    test(input: JSON): JSON
    login(input: JSON): JSON
    register(input: JSON): JSON
    forgot_password(input: JSON): JSON
    profile(input: JSON): JSON
    report(input: JSON): JSON
    like_report(input: JSON): JSON
    like_comment(input: JSON): JSON
    follow(input: JSON): JSON
    comment_by_id(input: JSON): JSON
  }

  type Subscription {
    heart_beat(input: JSON): JSON
  }
`;

export default typeDefs;
