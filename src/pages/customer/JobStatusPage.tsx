import { useState, FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const JobStatusPage = () => {
  const [searchType, setSearchType] = useState<'jobId' | 'phone'>('jobId');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [jobStatus, setJobStatus] = useState<any>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);
    setJobStatus(null);

    // Validate input
    if (!searchValue.trim()) {
      setError(`Please enter a valid ${searchType === 'jobId' ? 'Job ID' : 'Phone Number'}`);
      return;
    }

    if (searchType === 'phone' && !/^\d{10}$/.test(searchValue.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (searchType === 'jobId' && !/^\d+$/.test(searchValue)) {
      setError('Please enter a valid Job ID (positive number only)');
      return;
    }

    // Fetch data from the API
    setIsLoading(true);
    try {
      const response = await axios.get(
        searchType === 'jobId'
          ? `http://localhost:5000/api/jobs/eachjob/${searchValue}`
          : `http://localhost:5000/api/jobs/jobsByPhone/${searchValue}`
      );

      if (searchType === 'jobId') {
        setJobStatus([response.data]); // Wrap single job in an array for consistency
      } else {
        // For phone number, handle multiple jobs
        setJobStatus(response.data.jobs); // Set all jobs from the response
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while fetching job status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Check Job Status</h1>
        <p className="text-gray-600 mb-8">
          Enter your Job ID or phone number to check the status of your repair.
        </p>

        <div className="card p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'jobId'}
                    onChange={() => setSearchType('jobId')}
                    className="mr-2"
                  />
                  <span>Search by Job ID</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === 'phone'}
                    onChange={() => setSearchType('phone')}
                    className="mr-2"
                  />
                  <span>Search by Phone Number</span>
                </label>
              </div>

              <label className="label" htmlFor="searchValue">
                {searchType === 'jobId' ? 'Job ID' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type={searchType === 'phone' ? 'tel' : 'text'}
                  id="searchValue"
                  placeholder={searchType === 'jobId' ? 'e.g., 1234' : 'e.g., (123) 456-7890'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="input pl-10"
                  autoComplete={searchType === 'phone' ? 'tel' : 'off'}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Check Status'
              )}
            </button>
          </form>
        </div>

        {isSubmitted && jobStatus && jobStatus.length > 0 && (
          <div className="card p-6 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4">Job Status</h2>
            {jobStatus.map((job: any) => (
              <div key={job.job_id} className="border-b pb-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Job ID:</span>
                    <span className="font-medium">{job.job_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{job.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Device:</span>
                    <span className="font-medium">{job.product_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Repair Description:</span>
                    <span className="font-medium">{job.repair_description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.repair_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.repair_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Est. Completion:</span>
                    <span className="font-medium">{job.handover_date || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isSubmitted && jobStatus && jobStatus.length === 0 && (
          <p className="text-center text-gray-600">No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default JobStatusPage;