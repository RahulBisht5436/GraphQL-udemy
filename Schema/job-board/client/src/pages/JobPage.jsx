import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/formatters';
import { deleteJob, getJobData } from '../../graphQL/queries';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGraphQLErrorInfo } from '../lib/graphqlError';

function JobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobsData, setJobsData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

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

  const handleDeleteJob = async () => {
    if (!jobId || isDeleting) return;
    setFeedback(null);
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
      navigate('/');
    } catch (err) {
      const info = getGraphQLErrorInfo(err);
      setFeedback({
        type: 'error',
        title: info.title,
        text: info.text,
        needsLogin: info.needsLogin,
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        {feedback && (
          <div
            className="notification is-danger is-light"
            role="alert"
            aria-live="polite"
          >
            {feedback.title && (
              <p className="title is-5 mb-2 has-text-weight-semibold">
                {feedback.title}
              </p>
            )}
            <p>{feedback.text}</p>
            {feedback.type === 'error' && feedback.needsLogin && (
              <p className="mt-3">
                <Link
                  to="/login"
                  className="button is-link is-outlined is-small"
                >
                  Go to sign in
                </Link>
              </p>
            )}
          </div>
        )}
        <div className="block has-text-grey">
          Posted:{' '}
          {jobsData?.date
            ? formatDate(jobsData.date, 'long')
            : jobsData
              ? '—'
              : '…'}
        </div>
        <p className="block">{jobsData?.description ?? ''}</p>
        <button
          className="button is-danger is-light"
          type="button"
          onClick={handleDeleteJob}
          disabled={!jobsData || isDeleting}
        >
          {isDeleting ? 'Deleting…' : 'Delete Job'}
        </button>
      </div>
    </div>
  );
}

export default JobPage;
