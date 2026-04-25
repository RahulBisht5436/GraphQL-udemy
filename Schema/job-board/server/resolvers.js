/**
 * GraphQL resolvers for `schema.graphql`.
 *
 * Maps schema types to implementation:
 *
 * `type Query`
 *   - `greetings` → static string (smoke test).
 *   - `Job(id: ID)` → single job; `id` required at runtime.
 *   - `Jobs` → list of all jobs.
 *   - `Company(id: ID!)` → one company; throws `GraphQLError` if missing or not found.
 *
 * `type Mutation`
 *   - `createJob(input: CreateJobInput!)` → insert job; `companyId` must exist (SQLite FK).
 *
 * `type Job` (field resolvers; parent is a job row/object from DB or parent selection)
 *   - `date` → schema string date; here sourced from `parent.createdAt`.
 *   - `company` → nested `Company` via `parent.companyId`.
 *
 * `type Company`
 *   - `Jobs` → jobs whose `companyId` equals this company’s `id`.
 *
 * Data layer: `./db/jobs.js` and `./db/companies.js`.
 */
import { getJobs, getJob, deleteJob, createJob, updateJob as updateJobfunction } from './db/jobs.js';
import { getCompany } from './db/companies.js';
/** Standard GraphQL error type; used for `Company` lookup failures with `extensions.code`. */
import { GraphQLError } from 'graphql';

const resolvers = {
    /**
     * Root Query resolvers (`type Query` in the schema).
     */
    Query: {
        /**
         * `greetings: String`
         * Returns a fixed greeting; does not read the database.
         */
        greetings: () => {
            return "Hello this is the staring point"
        },

        /**
         * `Job(id: ID): Job`
         * Fetches one job by id. Throws if `id` is missing.
         * Return value is spread so nested selections (`date`, `company`, etc.) resolve on `Job`.
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

        /**
         * `Jobs: [Job]`
         * Returns every job row; no filtering or pagination.
         */
        Jobs: async () => {
            const jobsData = await getJobs();
            return [...jobsData]
        },

        /**
         * `Company(id: ID!): Company`
         * Loads a company by primary key. Uses `GraphQLError` + `extensions.code` for:
         * - missing id (defensive; schema already requires `ID!`)
         * - no row for that id
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
     * Field resolvers for GraphQL type `Job`.
     * Run when the executor needs `date` or `company` and the parent is a `Job`-shaped object.
     */
    Job: {
        /**
         * `date: String!` (schema documents this as a string date)
         * Maps the GraphQL `date` field from the stored timestamp field on the parent (`createdAt`).
         */
        date: (parent, _args, _context) => {
            return parent.createdAt
        },

        /**
         * `company: Company`
         * Resolves the employer for this job using `parent.companyId`.
         */
        company: async (parent) => {
            const companyData = await getCompany(parent.companyId)
            return {
                ...companyData
            }
        }

    },

    /**
     * Field resolvers for GraphQL type `Company`.
     */
    Company: {
        /**
         * `Jobs: [Job]`
         * Lists jobs belonging to this company: `job.companyId === parent.id`.
         * Implementation loads all jobs then filters in memory.
         */
        Jobs: async (parent) => {
            const jobsData = await getJobs();
            // Return only the jobs that belong to the current company.
            const filteredJobs = jobsData.filter(el => el.companyId == parent.id)
            return [...filteredJobs]
        }
    },

    /**
     * Root Mutation resolvers (`type Mutation` in the schema).
     */
    Mutation: {
        /**
         * `createJob(input: CreateJobInput!): Job`
         * `CreateJobInput`: `title`, optional `description`, `companyId` (must reference `company.id`).
         * Persists via `createJob` in the jobs DB module; `companyId` is enforced as FK in SQLite.
         */
        createJob: async (_parent, args, _context, _info) => {
            const { title, description, companyId } = args.input
            const jobCreatedData = await createJob({ companyId, title, description })
            return jobCreatedData
        },
        deleteJob:async (_parent,args)=>{
            // Deletes by id and returns the deleted row.
            const id = args.id
            const deletedJobData= await deleteJob(id)
            return deletedJobData
        },
        updateJob:async(_parent,args,context)=>{
            // Authorization check: update is allowed only for authenticated users.
            // Expected shape: `context.authorization.sub` contains the user identifier.
            if(!context.authorization.sub){
                throw new GraphQLError("Not authorized to preform action",{
                    extensions:{
                        code:"UNAUTHENICATED",
                        status:401
                    }

                })
            }
            // Reads the update payload from GraphQL input.
            // `id` identifies the target job; other fields are optional updates.
            const {id,title,description}=args.input
            if(!id){
                throw new GraphQLError("ID is a required Field for the Updation",{
                    extensions:{
                        "status":400,
                        code:"WRONG INPUT"
                    }
                })

            }

            // Persists changes in the DB layer and returns updated job data.
            const updateJobResult = await updateJobfunction({id, title , description})
            return updateJobResult
        }
    }

}


export default resolvers;
