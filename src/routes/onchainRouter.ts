import { Router } from "express";
import { GraphQLClient, gql } from "graphql-request";

const airstack = new GraphQLClient("https://api.airstack.xyz/gql");

export async function runAirstackQuery(textQuery: string) {
  const query = gql`
    ${textQuery}
  `;
  const data = await airstack.request(query);
  return data;
}

const onchainRouter = Router();

export default onchainRouter;
