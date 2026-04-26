// Company detail: name, description, and nested job list (GraphQL `Company` + `Jobs`).

import { useParams } from 'react-router';
import JobList from '../components/JobList';
import { useCompanyData } from '../../graphQL/hooks.js';

function CompanyPage() {
  const { companyId } = useParams();

  // Must run unconditionally (Rules of Hooks). `useCompanyData` skips the network request when `id` is falsy.
  const { data: company, loading, error } = useCompanyData(companyId);

  if (!companyId) {
    return <p className="has-text-grey">Invalid company link.</p>;
  }

  if (loading) {
    return <h1 className="title">Loading…</h1>;
  }

  if (error) {
    return (
      <div className="notification is-danger">
        Could not load company: {error.message}
      </div>
    );
  }

  // Query succeeded but the server returned no company for this id.
  if (!company) {
    return <p className="has-text-grey">Company not found.</p>;
  }

  return (
    <div>
      <h1 className="title">{company.name}</h1>
      <div className="box">{company.description}</div>
      <div className="job-listing">
        <h3 className="title is-4">Job listings</h3>
        {company.Jobs?.length ? (
          <JobList jobs={company.Jobs} />
        ) : (
          <p className="has-text-grey">No jobs for this company yet.</p>
        )}
      </div>
    </div>
  );
}

export default CompanyPage;
