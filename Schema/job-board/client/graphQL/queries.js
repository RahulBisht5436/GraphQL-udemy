import { GraphQLClient, gql } from 'graphql-request';

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const client = new GraphQLClient(endpoint);

export async function getJobs() {
  const query = gql`
    query {
      Jobs {
        id
        title
        description
        date
        createdAt
        company {
          id
        }
      }
    }
  `;

  const apiData = await client.request(query);
  return apiData.Jobs;
}
