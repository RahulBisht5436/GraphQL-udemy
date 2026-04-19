import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/formatters';
import { getJobData } from '../../graphQL/queries';
import { useEffect, useState } from 'react';

function JobPage() {
  const { jobId } = useParams();
  const [jobsData, setJobsData] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadJob() {
      const latestJobData = await getJobData(jobId);
      if (!cancelled) {
        setJobsData(latestJobData);
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const company = jobsData?.company;

  return (
    <div>
      <h1 className="title is-2">
        {jobsData?.title ?? 'Loading…'}
      </h1>
      <h2 className="subtitle is-4">
        {!jobsData ? (
          '…'
        ) : company ? (
          <Link to={`/companies/${company.id}`}>{company.name}</Link>
        ) : (
          <span className="has-text-grey">No company</span>
        )}
      </h2>
      <div className="box">
        <div className="block has-text-grey">
          Posted:{' '}
          {jobsData?.date
            ? formatDate(jobsData.date, 'long')
            : jobsData
              ? '—'
              : '…'}
        </div>
        <p className="block">{jobsData?.description ?? ''}</p>
      </div>
    </div>
  );
}

export default JobPage;
