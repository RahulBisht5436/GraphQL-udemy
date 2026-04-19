/**
 * GraphQL resolvers for schema.graphql
 *
 * Structure:
 * - Query     — root entry points: greetings, Job, Jobs, Company
 * - Job       — field resolvers on Job objects (date, company)
 * - Company   — field resolver Jobs on Company (jobs for that company)
 *
 * DB access: ./db/jobs.js (getJobs, getJob), ./db/companies.js (getCompany).
 */
import { getJobs, getJob } from './db/jobs.js'
import { getCompany } from './db/companies.js'
import { GraphQLError } from 'graphql';

const resolvers = {
    Query: {
        /** Smoke-test string; not backed by the database. */
        greetings: () => {
            return "Hello this is the staring point"
        },

        /**
         * Schema: Job(id: ID): Job
         * Loads a single job row; spreads DB fields onto the GraphQL Job type.
         */
        Job: async (parent, args) => {
            if (!args.id) {
                throw new Error("Job id is required");
            }
            const jobsData = await getJob(args.id)
            return {
                ...jobsData
            }
        },

        /** Schema: Jobs: [Job] — all jobs, no filter. */
        Jobs: async () => {
            const jobsData = await getJobs();
            return [
                ...jobsData,
            ]
        },

        /**
         * Schema: Company(id: ID!): Company
         * Requires a non-null id; uses GraphQL errors with extension codes for clients/tools.
         */
        Company: async (parent, args) => {
                const companyId = args.id
                if (!args.id) {
                    throw new GraphQLError('Company Id not provided', {
                        extensions: {
                          code: 'BAD REQUEST',
                        },
                      });
                }
                console.log("inside right resolver", companyId)
                const companyData = await getCompany(companyId)
                if (!companyData) {
                    throw new GraphQLError('No matched document found', {
                        extensions: {
                          code: 'DATABASE INVALID',
                        },
                      });
                }
                return companyData
        }

    },

    /**
     * Field resolvers for GraphQL type Job.
     * Invoked when a Job object is in the result tree and the selection set asks for `date` or `company`.
     */
    Job: {
        /**
         * Expose a string date for the schema’s `date` field (resolver output),
         * sourced from the row’s `createdAt` (or equivalent) on the parent job object.
         */
        date: (parent, args, context) => {
            return parent.createdAt
        },

        /** Load the Company for this job via `parent.companyId`. */
        company: async (parent) => {
            console.log(parent.companyId)
            const companyData = await getCompany(parent.companyId)
            console.log(companyData, "this is comapany dat")
            return {
                ...companyData
            }
        }

    },

    /**
     * Field resolvers for GraphQL type Company.
     */
    Company: {
        /**
         * Schema: Company.Jobs: [Job]
         * Parent is the Company object from Query.Company (has `id`).
         * Loads all jobs then filters to rows whose `companyId` matches the company.
         */
        Jobs: async (parent) => {
            console.log(parent.id)
            const jobsData = await getJobs();
            console.log(jobsData, "This is Jobs daa")
            const filteredJobs = jobsData.filter(el => el.companyId == parent.id)
            return [...filteredJobs]
        }
    }

}


export default resolvers;
