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