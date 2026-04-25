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
          name
        }
      }
    }
  `;

  const apiData = await client.request(query);
  return apiData.Jobs;
}

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