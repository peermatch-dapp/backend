import { Router } from "express";
import { GraphQLClient, gql } from "graphql-request";
import { LENS_API_PROD } from "../config";

const lens = new GraphQLClient(LENS_API_PROD);

export async function getInterests(profileId: string) {
  const query = gql`
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
  const data = await lens.request(query);
  console.log(data)
  return data;
}

const interestsRouter = Router();

interestsRouter.get('/', async (req, res) => {
  const interests = await getInterests('32751')
  res.json(interests)
})

export default interestsRouter;
