import { gql } from "@apollo/client";

export const query_test = gql`query test($input: JSON) { test(input: $input) }`;


export const mutation_login   = gql`mutation login($input: JSON) { login(input: $input) }`;
export const mutation_register= gql`mutation register($input: JSON) { register(input: $input) }`;

export const mutation_profile = gql`mutation profile($input: JSON) { profile(input: $input) }`;

