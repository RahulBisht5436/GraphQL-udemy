import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createJob } from '../../graphQL/queries';
import { getGraphQLErrorInfo } from '../lib/graphqlError';

function CreateJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const result = await createJob(title, description);
      const created = result.createJob;
      setFeedback({
        type: 'success',
        text: created?.title
          ? `Job "${created.title}" was created successfully.`
          : 'Job was created successfully.',
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      const info = getGraphQLErrorInfo(err);
      setFeedback({
        type: 'error',
        title: info.title,
        text: info.text,
        needsLogin: info.needsLogin,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="title">
        New Job
      </h1>
      <div className="box">
        {feedback && (
          <div
            className={
              feedback.type === 'success'
                ? 'notification is-success'
                : 'notification is-danger is-light'
            }
            role="alert"
            aria-live="polite"
          >
            {feedback.type === 'error' && feedback.title && (
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
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">
              Title 
            </label>
            <div className="control">
              <input className="input" type="text" value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">
              Description
            </label>
            <div className="control">
              <textarea className="textarea" rows={10} value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                className="button is-link"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
