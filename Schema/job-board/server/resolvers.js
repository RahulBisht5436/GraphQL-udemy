/**
 * GraphQL resolvers for schema.graphql:
 * - Query: root fields (greetings, Job, Jobs)
 * - Job: field resolvers when a Job object is returned (date, company)
 *
 * Matches types: Query, Job, Company (Company is resolved via Job.company).
 */
import { getJobs, getJob } from './db/jobs.js'
import { getCompany } from './db/companies.js'

const resolvers = {
    Query: {
        /** Simple smoke-test field. */
        greetings: () => {
            return "Hello this is the staring point"
        },

        /**
         * `Job(id: ID): Job` — load one job by id from the DB.
         * `parent` is unused on Query (always undefined).
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

        /** `Jobs: [Job]` — list all jobs. */
        Jobs: async () => {
            const jobsData = await getJobs();
            return [
                ...jobsData,
            ]
        }

    },

    /**
     * Field resolvers for type Job.
     * Run when the executor needs `date` or `company` on a Job instance
     * (e.g. returned from Query.Job / Query.Jobs or nested selection sets).
     */
    Job :{
        /**
         * Schema documents `date` as a string; map from stored `createdAt`
         * (adjust if your DB column differs).
         */
        date:(parent, args , context)=>{
            return parent.createdAt
        },

        /** Resolve `Job.company` by company id on the parent job row. */
        company:async (parent)=>{
            console.log(parent.companyId)
            const companyData = await getCompany(parent.companyId)
            console.log(companyData,"this is comapany dat")
            return {
                ...companyData
            }
        }

    }

}


export default resolvers;
