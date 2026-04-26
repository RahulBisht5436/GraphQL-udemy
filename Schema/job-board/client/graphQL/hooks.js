// React hook wrappers around Apollo `useQuery` / `useMutation` for company and job data.

import { useMutation, useQuery } from "@apollo/client/react";
import { companyData, createJobQuery, jobData, jobsQuery } from './queries';

// Loads one company (with nested Jobs) by GraphQL id. Pass the route param or any `ID`.
export function useCompanyData(id){
    // `companyData` is the gql document; variables must match the query (`$id: ID!`).
    const { loading, error, data } = useQuery(companyData, {
        variables: { id },
        skip: !id,
      });  
    // Apollo puts the `Company(...)` field on `data.Company` (same casing as the schema).
    return {
        data:data?.Company,
        loading,
        error
      }
}

// Loads one job (with nested company) by GraphQL id.
export function useJobData(id) {
  const { loading, error, data } = useQuery(jobData, {
    variables: { id },
    skip: !id,
  });
  return {
    data: data?.Job,
    loading,
    error,
  };
}

// Full job list with nested company (home page).
export function useJobs() {
  const { loading, error, data } = useQuery(jobsQuery, {
    fetchPolicy: 'cache-first',
  });
  return {
    jobs: data?.Jobs ?? [],
    loading,
    error,
  };
}

// `createJob` mutation: call `mutateCreateJob({ variables: { input } })` in an event handler (e.g. form submit).
export function useCreateJob() {
  const [mutateCreateJob, { data, error, loading, reset }] = useMutation(createJobQuery);
  return {
    mutateCreateJob,
    // Last success payload from `data.createJob` in the mutation result.
    createdJob: data?.createJob,
    error,
    loading,
    reset,
  };
}
