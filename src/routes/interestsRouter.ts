import { Router } from "express";
import { GraphQLClient, gql } from "graphql-request";
import { LENS_API_PROD } from "../config";

const lens = new GraphQLClient(LENS_API_PROD);

const profileId = "0x0e29"

export async function getInterests() {
  const myInterestsQuery = `query Profile {
    profile(request: { profileId: "0x0e29" }) {
      id
      interests
    }
  }`

  const { profile: { interests } }: any = await lens.request(myInterestsQuery);

  console.log(interests)

  const followersQuery = gql`
  query Followers {
    followers(request: { 
                profileId: "0x0e29",
                limit: 50
               }) {
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
  const { followers: { items } }: any = await lens.request(followersQuery);
  console.log(items)
  const data = []
  for (const item of items) {
    console.log(item.wallet.defaultProfile.interests)
    const commonInterests = item.wallet.defaultProfile.interests.filter((element: any) => {
      return interests.includes(element);
    });
    console.log(commonInterests)
    data.push({ address: item.wallet.address, commonInterests, numberInCommon: commonInterests.length, name: item.wallet.defaultProfile.name })
  }
  return data;
}

const interestsRouter = Router();

interestsRouter.get('/', async (req, res) => {
  const interests = await getInterests()
  res.json(interests)
})

export default interestsRouter;
