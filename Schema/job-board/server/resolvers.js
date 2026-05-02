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
import {
  getJobs,
  getJob,
  deleteJob as deleteJobRecord,
  createJob,
  updateJob as updateJobRecord,
} from './db/jobs.js';
import { companyLoader, getCompany } from './db/companies.js';
/** Standard GraphQL error type; used for `Company` lookup failures with `extensions.code`. */
import { GraphQLError } from 'graphql';

/** Requires a logged-in user; throws UNAUTHENTICATED. */
function requireUser(context) {
  if (!context.userDetails) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.userDetails;
}

/**
 * Only users whose `companyId` matches the job's can update or delete it.
 * Unauthenticated users get UNAUTHENTICATED (no job-id probing before login).
 */
function assertUserOwnsJob(context, job) {
  const user = requireUser(context);
  if (!job) {
    throw new GraphQLError('Job not found', { extensions: { code: 'NOT_FOUND' } });
  }
  if (user.companyId !== job.companyId) {
    throw new GraphQLError('You can only change jobs that belong to your company', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
}

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
        Jobs: async (_parent, args) => {
            const jobsData = await getJobs(args.limit);
            return [...jobsData];
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
         * `company: Company` (nullable)
         * Resolves the employer via DataLoader. Must `await` `load()` — it returns a Promise.
         */
        company: async (parent) => {
            if (parent.companyId == null) {
                return null;
            }
            const companyData = await companyLoader.load(parent.companyId);
            if (companyData == null) {
                return null;
            }
            return companyData;
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
        createJob: async (_parent, args, context) => {
            const user = requireUser(context);
            const { title, description } = args.input;
            // Ignore client-supplied company: always the authenticated user's company.
            const companyId = user.companyId;
            return createJob({ companyId, title, description });
        },
        deleteJob: async (_parent, args, context) => {
            const id = args.id;
            const job = await getJob(id);
            assertUserOwnsJob(context, job);
            return deleteJobRecord(id);
        },
        updateJob: async (_parent, args, context) => {
            const { title, description } = args.input;
            const id = args.input.id;
            if (!id) {
                throw new GraphQLError('id is required to update a job', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            const job = await getJob(id);
            assertUserOwnsJob(context, job);
            return updateJobRecord({ id, title, description });
        },
    }

}


export default resolvers;
