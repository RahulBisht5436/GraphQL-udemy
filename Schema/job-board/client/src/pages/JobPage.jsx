// Single job detail: title, company link, posted date, description, delete.

import { useParams } from 'react-router';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/formatters';
import { deleteJob } from '../../graphQL/queries';
import { useJobData } from '../../graphQL/hooks.js';
import { useState } from 'react';

function JobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data: job, loading, error } = useJobData(jobId);

  const handleDeleteJob = async () => {
    if (!jobId || isDeleting) return;
    setFeedback(null);
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
      navigate('/');
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to delete the job. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const company = job?.company;

  if (!jobId) {
    return <p className="has-text-grey">Invalid job link.</p>;
  }

  if (loading) {
    return <h1 className="title is-2">Loading…</h1>;
  }

  if (error) {
    return (
      <div className="notification is-danger">
        Could not load job: {error.message}
      </div>
    );
  }

  if (!job) {
    return <p className="has-text-grey">Job not found.</p>;
  }

  return (
    <div>
      <h1 className="title is-2">{job.title}</h1>
      <h2 className="subtitle is-4">
        {company ? (
          <Link to={`/companies/${company.id}`}>{company.name}</Link>
        ) : (
          <span className="has-text-grey">No company</span>
        )}
      </h2>
      <div className="box">
        {feedback && (
          <div className="notification is-danger" role="alert">
            {feedback.text}
          </div>
        )}
        <div className="block has-text-grey">
          Posted:{' '}
          {job.date ? formatDate(job.date, 'long') : '—'}
        </div>
        <p className="block">{job.description ?? ''}</p>
        <button
          className="button is-danger is-light"
          type="button"
          onClick={handleDeleteJob}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting…' : 'Delete Job'}
        </button>
      </div>
    </div>
  );
}

export default JobPage;
