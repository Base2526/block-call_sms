import { gql } from "@apollo/client";

export const query_test = gql`query test($input: JSON) { test(input: $input) }`;

export const query_reports = gql`query reports{ reports }`;
export const query_report  = gql`query report($id: ID) { report(_id: $id) }`;

export const mutation_login   = gql`mutation login($input: JSON) { login(input: $input) }`;
export const mutation_register= gql`mutation register($input: JSON) { register(input: $input) }`;

export const mutation_profile = gql`mutation profile($input: JSON) { profile(input: $input) }`;

export const mutation_uploadfile =  gql`
  mutation UploadFile($file: Upload!, $username: String!, $details: String!) {
    UploadFile(file: $file, username: $username, details: $details)
  }
`;

export const query_banks = gql`query banks { banks }`;
export const guery_provinces  = gql`query provinces { provinces }`;

export const mutation_report  = gql`mutation report($input: JSON) { report(input: $input) }`;