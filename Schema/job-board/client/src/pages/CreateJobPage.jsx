// New job form: `createJob` via shared `useCreateJob()` (see `graphQL/hooks.js`).

import { useState } from 'react';
import { useCreateJob } from '../../graphQL/hooks.js';

// Server expects a `companyId` on `CreateJobInput`; same default as in `queries.js`’s `createJob()`.
const DEFAULT_COMPANY_ID = 'FjcJCHJALA4i';

function CreateJobPage() {
  // Form fields (controlled inputs).
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Success or error message shown above the form (`{ type, text }` or `null` when hidden).
  const [feedback, setFeedback] = useState(null);

  const { mutateCreateJob, loading } = useCreateJob();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setFeedback(null);

    try {
      // `variables` must match the operation: `mutation ($input: CreateJobInput!)` → `variables: { input: { ... } }`.
      const { data, errors } = await mutateCreateJob({
        variables: {
          input: {
            title,
            description,
            companyId: DEFAULT_COMPANY_ID,
          },
        },
      });

      // GraphQL can return 200 with partial errors in `errors` while `data` is null/omitted.
      if (errors?.length) {
        throw new Error(errors.map((e) => e.message).join(', '));
      }

      const created = data?.createJob;
      setFeedback({
        type: 'success',
        text: created?.title
          ? `Job "${created.title}" was created successfully.`
          : 'Job was created successfully.',
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      // Network failures or thrown `Error` from `errors` above.
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to create the job. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="title">New Job</h1>
      <div className="box">
        {feedback && (
          <div
            className={
              feedback.type === 'success'
                ? 'notification is-success'
                : 'notification is-danger'
            }
            role="alert"
          >
            {feedback.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="create-job-title">
              Title
            </label>
            <div className="control">
              <input
                id="create-job-title"
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="create-job-description">
              Description
            </label>
            <div className="control">
              <textarea
                id="create-job-description"
                className="textarea"
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button
                className="button is-link"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
