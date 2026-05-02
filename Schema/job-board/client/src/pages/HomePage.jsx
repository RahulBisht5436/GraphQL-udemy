// Job board home: all jobs from GraphQL.

import JobList from '../components/JobList';
import { useJobs } from '../../graphQL/hooks.js';

function HomePage() {
  const { jobs, loading, error } = useJobs(10);

  if (loading) {
    return (
      <div>
        <h1 className="title">Job Board</h1>
        <p className="has-text-grey">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="title">Job Board</h1>
        <div className="notification is-danger">
          Could not load jobs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">Job Board</h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
