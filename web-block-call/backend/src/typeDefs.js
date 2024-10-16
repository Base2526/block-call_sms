const gql = require('graphql-tag');

export default gql`
  scalar DATETIME
  scalar Long
  scalar Date
  scalar JSON

  scalar Upload

  input LoginInput {
    username: String!
    password: String!
    remember: Boolean
    deviceAgent: String
  }

  type Query {
    test(input: JSON): JSON
    provinces(input: JSON): JSON
    reports: JSON
    report(_id: ID): JSON
    my_reports: JSON
    users: JSON
    banks: JSON
  }  
  
  type Mutation {
    login(input: LoginInput): JSON
    register(input: JSON): JSON
    forgot_password(input: JSON): JSON
    profile(input: JSON): JSON
    report(input: JSON): JSON
  }

  type Subscription {
    userConnected: String
  }
`;
