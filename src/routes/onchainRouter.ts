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

async function contractsFinder(
  nftContracts: Record<string, Record<string, string>>,
  tokenContracts: Record<string, Record<string, string>>,
  addresses: string[],
  start: number
) {
  let query = "{";
  for (let j = 0; j < addresses.length; j++) {
    const address = addresses[j];
    query += `
    balance${start + j}: TokenBalances(
      input: {filter: {owner: {_eq: "${address}"}, tokenType: {_in: [ERC1155, ERC721, ERC20]}}, blockchain: ethereum, limit: 100}
      ) {
        TokenBalance {
          tokenAddress
          token {
            name
          }
          tokenType
        }
      }`;
  }
  query += "\n}";

  const data = (await runAirstackQuery(query)) as any;
  for (let j = 0; j < addresses.length; j++) {
    const address = addresses[j];
    const username = `balance${start + j}`;
    nftContracts[address] = {};
    tokenContracts[address] = {};

    // console.log(data[username]);

    if (data[username].TokenBalance) {
      for (const tokenBalance of data[username].TokenBalance) {
        if (tokenBalance.tokenType === "ERC20")
          tokenContracts[address][tokenBalance.tokenAddress] =
            tokenBalance.token.name;
        else
          nftContracts[address][tokenBalance.tokenAddress] =
            tokenBalance.token.name;
      }
    }
  }
}

export async function onchainScores(requester: string, candidates: string[]) {
  // const requester = "0xBD19a3F0A9CaCE18513A1e2863d648D13975CB30";
  // const candidates = [
  //   "0x6eA4Ea5c3cD5c1f77F9D2114659cBaCAeA97EdB7",
  //   "0xE340b00B6B622C136fFA5CFf130eC8edCdDCb39D",
  //   "0x7f96a6269B00c56cdC319721be80bf8C290324a5",
  //   "0x2487fC7E019860AFbfC7Fb16689e421843c777E2",
  //   "0x3eEFAa9d6e2ab7972C1001D41C82BB4881389257",
  // ];
  const limit = 5;
  let addresses = [requester, ...candidates];
  const nftContracts: Record<string, Record<string, string>> = {};
  const tokenContracts: Record<string, Record<string, string>> = {};
  for (let i = 0; i < Math.ceil(addresses.length / limit); i++) {
    const skip = i * limit;
    await contractsFinder(
      nftContracts,
      tokenContracts,
      addresses.slice(skip, skip + limit),
      skip
    );
  }

  const commonNfts: Record<string, number> = {};
  const commonTokens: Record<string, number> = {};
  candidates.forEach((candidate) => (commonNfts[candidate] = 0));
  for (const candidate of candidates) {
    commonNfts[candidate] = 0;
    commonTokens[candidate] = 0;
    for (const contractAddress in nftContracts[requester]) {
      commonNfts[candidate] += Number(
        Boolean(nftContracts[candidate][contractAddress])
      );
    }
    for (const contractAddress in tokenContracts[requester]) {
      commonTokens[candidate] += Number(
        Boolean(tokenContracts[candidate][contractAddress])
      );
    }
  }

  return { nftContracts, tokenContracts, commonNfts, commonTokens };
}

export default onchainRouter;
