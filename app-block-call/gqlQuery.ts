import { gql } from "@apollo/client";

export const query_test       = gql`query test($input: JSON) { test(input: $input) }`;
export const query_reports    = gql`query reports{ reports }`;
export const query_report     = gql`query report($id: ID) { report(_id: $id) }`;
export const mutation_login   = gql`mutation login($input: JSON) { login(input: $input) }`;
export const mutation_register= gql`mutation register($input: JSON) { register(input: $input) }`;
export const query_user       = gql`query user($input: JSON) { user(input: $input) }`;

export const mutation_uploadfile =  gql`
  mutation UploadFile($file: Upload!, $username: String!, $details: String!) {
    UploadFile(file: $file, username: $username, details: $details)
  }
`;

export const query_banks      = gql`query banks { banks }`;
export const guery_provinces  = gql`query provinces { provinces }`;
export const mutation_report  = gql`mutation report($input: JSON) { report(input: $input) }`;

export const mutation_like_report  = gql`mutation like_report($input: JSON) { like_report(input: $input) }`;
export const mutation_like_comment = gql`mutation like_comment($input: JSON) { like_comment(input: $input) }`;
export const mutation_follow       = gql`mutation follow($input: JSON) { follow(input: $input) }`;

export const query_comment = gql`query comment_by_id($input: JSON) { comment_by_id(input: $input) }`;
export const mutation_comment  = gql`mutation comment_by_id($input: JSON) { comment_by_id(input: $input) }`;