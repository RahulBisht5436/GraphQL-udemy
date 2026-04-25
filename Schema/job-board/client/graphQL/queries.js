// GraphQL over HTTP: graphql-request sends raw POSTs; @apollo/client supplies `gql` for tagged query strings.
import { GraphQLClient } from 'graphql-request';
import {ApolloClient,HttpLink, gql,InMemoryCache} from '@apollo/client'

// API URL from Vite (.env as VITE_GRAPHQL_ENDPOINT); must match the job-board GraphQL server.
const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;

// Shared client used by all functions below: .request(document, variables?) returns parsed JSON for the top-level fields.
const client = new GraphQLClient(endpoint);

// Apollo client is configured here for the same endpoint (e.g. if you switch UI code to use Apollo hooks later).
// These exported helpers still use graphql-request, not apolloClient.
const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: endpoint }),
  cache:new InMemoryCache(),

})

// Fetches the full job list with nested company (id + name). Returns the array under the `Jobs` field.
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

  const apiData = await client.request(query);
  return apiData.Jobs;
}

// Loads one job by GraphQL ID; variables map `$id` -> id_job. Returns the single `Job` object (or null if server resolves that way).
export async function getJobData(id_job) {
  console.log("inside right function", id_job)
  const query = gql`
    query($id:ID!){
  Job(id:$id) {
    title,
    description
    id,
    date,
    company {
      name,
      id
    }
  
  }
}
    `
  const apiData = await client.request(query, {
    id: id_job
  })
  console.log(apiData)
  return apiData.Job
}

// Loads one company and all of its jobs (nested `Jobs`). `companyId` becomes the `$id` argument for `Company(id: ...)`.
export async function getCompanyData(companyId) {
  const companyData = gql`
    query($id: ID!) {
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
    `
  const variables = {
    id: companyId
  }


  const companiesGraphql = await client.request(companyData, variables);
  return companiesGraphql.Company;

}

// Runs the createJob mutation with CreateJobInput (title, description, companyId). Default companyId is a demo ID if callers omit it.
export async function createJob(title, description, companyId = "FjcJCHJALA4i") {
  console.log("right function called")
  const createJobQuery = gql`
    mutation($input: CreateJobInput!){
  createJob(input: $input) {
    createdAt
    title
  }
}
  `


  const createJobQueryVariables={
    "input":{
      "title": title,
      "description":description,
      "companyId": companyId
    }
  }

  const result = await client.request(createJobQuery,createJobQueryVariables)
  console.log("This has been successfully executed")
  console.log(result)
  return result


}


// Deletes a job by id; asks the server for id + title of the deleted row. Returns `result.deleteJob` (the mutation payload).
export async function deleteJob(jobId) {
  const deleteJobMutation = gql`
    mutation ($id: ID!) {
      deleteJob(id: $id) {
        id
        title
      }
    }
  `;

  const variables = {
    id: jobId,
  };

  const result = await client.request(deleteJobMutation, variables);
  return result.deleteJob;
}
