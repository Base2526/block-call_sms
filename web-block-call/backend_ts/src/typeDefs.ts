import gql from 'graphql-tag';

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
    reports: JSON
    report(_id: ID): JSON
    my_reports: JSON
    user(input: JSON): JSON
    users: JSON
    banks: JSON
    comment_by_id(input: JSON): JSON
  }

  type Mutation {
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
    userConnected: JSON
  }
`;

export default typeDefs;
