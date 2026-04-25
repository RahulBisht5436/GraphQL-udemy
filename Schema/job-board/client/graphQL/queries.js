// GraphQL: Apollo Client (SetContextLink + HttpLink) for all queries and mutations. JWT in Authorization header.
import { ApolloClient, HttpLink, gql, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getAccessToken } from '../src/lib/auth.js';

// API URL from Vite (.env as VITE_GRAPHQL_ENDPOINT); must match the job-board GraphQL server.
const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;

const httpLink = new HttpLink({ uri: endpoint });
const authLink = new SetContextLink((prevContext) => {
  const token = getAccessToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Fetches the full job list with nested company (id + name).
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
          name
        }
      }
    }
  `;

  const { data } = await apolloClient.query({
    query,
    fetchPolicy: 'cache-first'
  });
  return data.Jobs;
}

// Loads one job by GraphQL ID. Returns the single `Job` object.
export async function getJobData(id_job) {
  const query = gql`
    query ($id: ID!) {
      Job(id: $id) {
        title
        description
        id
        date
        company {
          name
          id
        }
      }
    }
  `;
  const { data } = await apolloClient.query({
    query,
    variables: { id: id_job },
    fetchPolicy: 'cache-first'
  });
  return data.Job;
}

// Loads one company and its nested `Jobs` list.
export async function getCompanyData(companyId) {
  const companyData = gql`
    query ($id: ID!) {
      Company(id: $id) {
        id
        name
        description
        Jobs {
          id
          title
          description
          date
        }
      }
    }
  `;
  const variables = { id: companyId };

  const { data } = await apolloClient.query({
    query: companyData,
    variables,
    fetchPolicy: 'cache-first'
  });
  return data.Company;
}

// createJob: returns mutation `data` (CreateJobPage reads `result.createJob`).
export async function createJob(
  title,
  description,
  companyId = 'FjcJCHJALA4i'
) {
  const createJobQuery = gql`
    mutation ($input: CreateJobInput!) {
      createJob(input: $input) {
        createdAt
        title
      }
    }
  `;

  const variables = {
    input: {
      title,
      description,
      companyId,
    },
  };

  const { data } = await apolloClient.mutate({
    mutation: createJobQuery,
    variables,
    update:(cache, data)=>{
      // alert("This is happeing after new Job is created OK!")
      console.log('This is cache params data',cache)
      console.log('this is data param data',data)
    }


  });
  return data;
}

// Returns the deleted job payload (id, title).
export async function deleteJob(jobId) {
  const deleteJobMutation = gql`
    mutation ($id: ID!) {
      deleteJob(id: $id) {
        id
        title
      }
    }
  `;

  const { data } = await apolloClient.mutate({
    mutation: deleteJobMutation,
    variables: { id: jobId },
  });
  return data.deleteJob;
}
