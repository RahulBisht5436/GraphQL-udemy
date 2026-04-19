import JobList from '../components/JobList';
import { jobs } from '../lib/fake-data';
import { getJobs } from '../../graphQL/queries';
import { useEffect, useState } from 'react';


function HomePage() {
  const [jobsData, setJobsData]=useState([...jobs])
  useEffect(()=>{
      async function getJobsFunction() {
        const newJobsData = await getJobs()
        setJobsData(newJobsData)
      }
      getJobsFunction()
  },[])
  
  // console.log(jobsData)
  // console.log(jobs)
  return (
    <div>
      <h1 className="title">Job Board</h1>
      <JobList jobs={jobsData} />
    </div>
  );
}

export default HomePage;