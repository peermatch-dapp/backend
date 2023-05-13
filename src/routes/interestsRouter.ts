import { Router } from "express";
import { GraphQLClient, gql } from "graphql-request";
import { LENS_API_PROD } from "../config";
import { onchainScores } from "./onchainRouter";

const lens = new GraphQLClient(LENS_API_PROD);

const profileId = "0x0e29";

export async function getInterests() {
  const myInterestsQuery = `query Profile {
    profile(request: { profileId: "0x0e29" }) {
      id
      interests
    }
  }`;

  const {
    profile: { interests },
  }: any = await lens.request(myInterestsQuery);

  const followersQuery = gql`
    query Followers {
      followers(request: { profileId: "0x0e29", limit: 50 }) {
        items {
          wallet {
            address
            defaultProfile {
              id
              name
              interests
            }
          }
        }
      }
    }
  `;
  const {
    followers: { items },
  }: any = await lens.request(followersQuery);
  const data = [];
  for (const item of items) {
    const commonInterests = item.wallet.defaultProfile.interests.filter(
      (element: any) => {
        return interests.includes(element);
      }
    );
    data.push({
      address: item.wallet.address,
      commonInterests,
      numberInCommon: commonInterests.length,
      name: item.wallet.defaultProfile.name,
    });
  }
  return data;
}

const interestsRouter = Router();

interestsRouter.get("/", async (req, res) => {
  const requesterId = "0xBD19a3F0A9CaCE18513A1e2863d648D13975CB30";
  const interests = await getInterests();
  const { commonNfts, commonTokens } = await onchainScores(
    requesterId,
    interests.map((interest) => interest.address)
  );

  const commonInterests: Record<string, number> = {};
  interests.forEach(
    (interests) =>
      (commonInterests[interests.address] = interests.numberInCommon)
  );

  const scores: Record<
    string,
    { interests: number; nfts: number; tokens: number }
  > = {};
  for (const address in commonInterests) {
    scores[address] = {
      interests: commonInterests[address],
      nfts: commonNfts[address],
      tokens: commonTokens[address],
    };
  }

  res.json({ scores });
});

export default interestsRouter;
