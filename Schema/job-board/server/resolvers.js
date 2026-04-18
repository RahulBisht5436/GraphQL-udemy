import { json } from 'express';
import { getJobs, getJob } from './db/jobs.js'
const resolvers = {
    Query: {
        greetings: () => {
            return "Hello this is the staring point"
        },
        Job: async (parent, args) => {
            const jobsData = await getJob(args.id)

            if (!args.id) {
                throw new Error("Job id is required");
            }
            return {
                ...jobsData
            }
        },
        Jobs: async () => {
            const jobsData = await getJobs();
            return [
                ...jobsData,
            ]
        }

    },
    Job :{
        date:(parent, args , context)=>{
            return parent.createdAt
        },
        
    }

}


export default resolvers;