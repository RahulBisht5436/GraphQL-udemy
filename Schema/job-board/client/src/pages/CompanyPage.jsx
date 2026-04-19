import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getCompanyData } from '../../graphQL/queries';
import JobList from '../components/JobList';

function CompanyPage() {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    if (!companyId) return;

    let cancelled = false;

    async function loadCompany() {
      const companyFetchData = await getCompanyData(companyId);
      if (!cancelled) {
        setCompanyData(companyFetchData);
      }
    }

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  // const company = companies.find((company) => company.id === companyId);
  return (
    <div>
      <h1 className="title">
        {companyData?.name ? companyData.name : "Loading"}
      </h1>
      <div className="box">
        {companyData?.description ? companyData.description : "Loading"}
      </div>
      <div className="job-listing">
        <h3 className="title is-4">Job listings</h3>
        {!companyData ? null : companyData.Jobs?.length ? (
          <JobList jobs={companyData.Jobs} />
        ) : (
          <p className="has-text-grey">No jobs for this company yet.</p>
        )}
      </div>
    </div>
  );
}

export default CompanyPage;
