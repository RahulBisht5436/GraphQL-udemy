import { useState } from 'react';
import { createJob } from '../../graphQL/queries';

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
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to create the job. Please try again.',
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
                : 'notification is-danger'
            }
            role="alert"
          >
            {feedback.text}
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
