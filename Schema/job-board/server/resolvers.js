/**
 * GraphQL resolvers for schema.graphql
 *
 * Structure:
 * - Query     — root entry points: greetings, Job, Jobs, Company
 * - Mutation  — createJob (insert job; companyId must reference an existing company row)
 * - Job       — field resolvers on Job objects (date, company)
 * - Company   — field resolver Jobs on Company (jobs for that company)
 *
 * DB access: ./db/jobs.js (getJobs, getJob, createJob), ./db/companies.js (getCompany).
 */
import { getJobs, getJob, createJob } from './db/jobs.js'
import { getCompany } from './db/companies.js'
/** Typed errors with `extensions.code` for missing/invalid Company lookups. */
import { GraphQLError } from 'graphql';

const resolvers = {
    /** Root read operations (see schema `type Query`). */
    Query: {
        /** Smoke-test string; not backed by the database. */
        greetings: () => {
            return "Hello this is the staring point"
        },

        /**
         * Schema: Job(id: ID): Job
         * Loads a single job row; spreads DB fields onto the GraphQL Job type.
         */
        Job: async (_parent, args) => {
            if (!args.id) {
                throw new Error("Job id is required");
            }
            const jobsData = await getJob(args.id)
            // Spread so GraphQL can resolve nested fields (e.g. `company`) on the returned Job.
            return {
                ...jobsData
            }
        },

        /** Schema: Jobs: [Job] — all jobs, no filter. */
        Jobs: async () => {
            const jobsData = await getJobs();
            return [...jobsData]
        },

        /**
         * Schema: Company(id: ID!): Company
         * Requires a non-null id; uses GraphQL errors with extension codes for clients/tools.
         */
        Company: async (_parent, args) => {
                const companyId = args.id
                // Redundant with schema `ID!` but keeps a clear error if the field is ever optional.
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
        date: (parent, _args, _context) => {
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
    },

    /** Root write operations (see schema `type Mutation`). */
    Mutation: {
        /**
         * Schema: createJob(title, description, companyId): Job
         * Persists a row in `job`; `companyId` must match an existing `company.id` (SQLite FK).
         * Resolver should return the new Job so the mutation response can be resolved (schema `Job`).
         */
        createJob: async (_parent, args, _context, _info) => {
            const { title, description, companyId } = args
            console.log("This is the send data from the request", title, description, companyId)
            const jobCreatedData = await createJob({ companyId, title, description })
            console.log(jobCreatedData)
        }
    }

}


export default resolvers;
